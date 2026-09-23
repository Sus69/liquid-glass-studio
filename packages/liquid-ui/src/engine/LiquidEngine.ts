import type { LiquidBackdropMode, LiquidBackendInfo, LiquidMaterial } from '../types';
import { blurGroupKey, resolveMaterial } from '../materials';
import { ShapeRegistry, MAX_SHAPES } from './shapes';
import { Scheduler } from './scheduler';
import { detectWebGPU, type WebGPUDetectResult } from './gpuDetect';

import VertexShader from './shaders/vertex.glsl';
import FragmentBgShader from './shaders/fragment-bg.glsl';
import FragmentBgVblurShader from './shaders/fragment-bg-vblur.glsl';
import FragmentBgHblurShader from './shaders/fragment-bg-hblur.glsl';
import FragmentMainShader from './shaders/fragment-main.glsl';
import WgslVertex from './shaders-wgsl/vertex.wgsl';
import WgslFragBg from './shaders-wgsl/fragment-bg.wgsl';
import WgslFragVblur from './shaders-wgsl/fragment-bg-vblur.wgsl';
import WgslFragHblur from './shaders-wgsl/fragment-bg-hblur.wgsl';
import WgslFragMain from './shaders-wgsl/fragment-main.wgsl';

import { MultiPassRenderer } from './backends/webgl/MultiPassRenderer';
import {
  createEmptyTexture,
  loadTextureFromURL,
  updateVideoTexture,
} from './backends/webgl/textures';
import { GPUMultiPassRenderer } from './backends/webgpu/GPUMultiPassRenderer';
import {
  gpuCreateEmptyTexture,
  gpuLoadTextureFromURL,
  gpuUpdateVideoTexture,
} from './backends/webgpu/textures';

const MAX_BLUR_RADIUS = 200;

/** How the root's backdrop is supplied, mirroring the Studio's bgType values. */
export type EngineBgType =
  | { kind: 'procedural'; index: 0 | 1 | 2 }
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string };

export interface LiquidEngineOptions {
  /** Backdrop mode: textured = full GPU fidelity, dom = hybrid, css = fallback. */
  backdropMode: LiquidBackdropMode;
  /** Backdrop source for textured mode. */
  background?: EngineBgType;
  /** Cap for devicePixelRatio (default 2). */
  maxDpr?: number;
  /** Force a backend instead of WebGPU→WebGL2 auto-detection (dev/testing). */
  backend?: 'auto' | 'webgl' | 'webgpu';
  /** Keep the drawing buffer valid after compositing (debug/test readback). */
  debugPreserveDrawingBuffer?: boolean;
}

/** Compute a normalized Gaussian kernel (sigma = radius/3), as the Studio did. */
export function computeGaussianKernelByRadius(radius: number): number[] {
  const r = Math.max(1, Math.min(Math.floor(radius), MAX_BLUR_RADIUS));
  const sigma = r / 3.0;
  const kernel: number[] = [];
  let sum = 0;
  for (let i = 0; i <= r; i++) {
    const weight = Math.exp((-0.5 * (i * i)) / (sigma * sigma));
    kernel.push(weight);
    sum += i === 0 ? weight : weight * 2;
  }
  return kernel.map((w) => w / sum);
}

/**
 * The shared liquid rendering engine behind all components.
 *
 * One instance exists per <LiquidRoot>. It owns the single transparent GPU
 * canvas, selects the best backend (WebGPU → WebGL2 → CSS fallback), batches
 * the blur pipeline by blur-group, and drives a render-on-demand loop.
 */
export class LiquidEngine {
  readonly registry = new ShapeRegistry();
  readonly scheduler = new Scheduler();
  backend: LiquidBackendInfo;
  options: LiquidEngineOptions;

  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: MultiPassRenderer | GPUMultiPassRenderer | null = null;
  private device: GPUDevice | null = null;

  // Texture lifecycle (image/video backdrop)
  private bgTexture: WebGLTexture | GPUTexture | null = null;
  private bgTextureRatio = 1;
  private bgTextureReady = false;
  private loadedBgUrl: string | null = null;
  private bgIsVideo = false;
  private videoEl: HTMLVideoElement | null = null;

  // Viewport state
  private width = 0;
  private height = 0;
  private dpr = 1;

  // Blur batching: one blur group active per frame (the pipeline blurs the
  // backdrop once per distinct blur value; shapes are grouped by blurGroupKey).
  private activeBlurGroup = 1;
  private blurWeights: number[] = [1];

  // Interaction state (Studio-derived)
  mouse = { x: -10000, y: -10000 };

  // Render bookkeeping
  private stopRender: (() => void) | null = null;
  private disposed = false;
  private lastPackedCount = -1;
  private lastTransparentBg = -1;

  constructor(options: LiquidEngineOptions) {
    this.options = options;
    this.backend = { kind: 'css', gpu: false, reason: 'initializing' };
  }

  private attachPromise: Promise<void> | null = null;

  /** Attach the engine to a container element and initialize the backend.
   * Idempotent: repeated calls return the first attach's promise. */
  attach(container: HTMLElement): Promise<void> {
    if (this.attachPromise) return this.attachPromise;
    this.attachPromise = this.doAttach(container);
    return this.attachPromise;
  }

  private async doAttach(container: HTMLElement): Promise<void> {
    if (this.disposed) return;
    this.container = container;

    if (this.options.backdropMode === 'css') {
      this.backend = { kind: 'css', gpu: false, reason: 'CSS fallback requested' };
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'liquid-ui-engine-canvas';
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '0',
    } satisfies Partial<CSSStyleDeclaration>);
    container.insertBefore(canvas, container.firstChild);
    this.canvas = canvas;

    // Backend selection: WebGPU → WebGL2 → CSS (per the plan's fallback chain)
    let webgpu: WebGPUDetectResult | null = null;
    try {
      webgpu = await detectWebGPU();
    } catch {
      webgpu = null;
    }

    // The container may have been disposed while awaiting detection.
    if (this.disposed) {
      canvas.remove();
      return;
    }

    if (
      this.options.backend !== 'webgl' &&
      webgpu?.supported &&
      webgpu.device
    ) {
      try {
        this.device = webgpu.device;
        this.renderer = this.createWebGPURenderer(canvas, webgpu.device);
        this.backend = { kind: 'webgpu', gpu: true };
        // Surface device loss loudly instead of dying to a silent black/blank
        // canvas — uncached nodes on device-loss get re-requested via the
        // standard 'uncapturederror' path below.
        webgpu.device.lost?.then?.((info: GPUDeviceLostInfo) => {
          console.error('[liquid-ui] WebGPU device lost:', info.reason, info.message);
        });
        webgpu.device.addEventListener?.('uncapturederror', (event: Event) => {
          const e = event as GPUUncapturedErrorEvent;
          console.error('[liquid-ui] WebGPU error:', e.error.message);
        });
      } catch (e) {
        console.warn('[liquid-ui] WebGPU renderer failed, falling back to WebGL2:', e);
        this.renderer = null;
        this.device = null;
      }
    }

    if (!this.renderer) {
      try {
        // Validate the shader's shape capacity fits this device's uniform
        // budget BEFORE rendering with it: 64-byte header (16 rows) + 8
        // arrays × MAX_SHAPES vec4s. Below the minimum the engine would
        // link a shader that silently fails to compile → no glass at all.
        const probe = document.createElement('canvas');
        const pgl = probe.getContext('webgl2');
        if (pgl) {
          const budget = pgl.getParameter(pgl.MAX_FRAGMENT_UNIFORM_VECTORS);
          const needed = 16 + 8 * MAX_SHAPES;
          if (budget < needed) {
            console.error(
              `[liquid-ui] Device supports ${budget} fragment uniform vectors but the shaders need ${needed} (MAX_SHAPES=${MAX_SHAPES}). ` +
                'Glass will be broken on this device — lower MAX_SHAPES in shaders/lib/sdf.glsl, shaders-wgsl/*.wgsl, engine/shapes.ts and GPUMultiPassRenderer.ts (they must stay in sync).',
            );
          }
        }
        this.renderer = this.createWebGLRenderer(canvas);
        this.backend = { kind: 'webgl', gpu: true };
      } catch (e) {
        console.warn('[liquid-ui] WebGL2 unavailable, using CSS fallback:', e);
        this.backend = {
          kind: 'css',
          gpu: false,
          reason: e instanceof Error ? e.message : 'WebGL2 unavailable',
        };
        canvas.remove();
        this.canvas = null;
        return;
      }
    }

    if (typeof console !== 'undefined') {
      console.info(`[liquid-ui] engine ready: backend=${this.backend.kind}`);
    }

    this.measure();
    this.loadBackgroundTexture();
    this.startLoop();
  }

  private createWebGLRenderer(canvas: HTMLCanvasElement): MultiPassRenderer {
    // preserveDrawingBuffer is only enabled for debugging/test harnesses via
    // the engine option; production keeps the default (invalidated after
    // compositing, cheaper).
    return new MultiPassRenderer(
      canvas,
      [
        { name: 'bgPass', shader: { vertex: VertexShader, fragment: FragmentBgShader } },
        {
          name: 'vBlurPass',
          shader: { vertex: VertexShader, fragment: FragmentBgVblurShader },
          inputs: { u_prevPassTexture: 'bgPass' },
        },
        {
          name: 'hBlurPass',
          shader: { vertex: VertexShader, fragment: FragmentBgHblurShader },
          inputs: { u_prevPassTexture: 'vBlurPass' },
        },
        {
          name: 'mainPass',
          shader: { vertex: VertexShader, fragment: FragmentMainShader },
          inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' },
          outputToScreen: true,
        },
      ],
      { preserveDrawingBuffer: this.options.debugPreserveDrawingBuffer },
    );
  }

  private createWebGPURenderer(canvas: HTMLCanvasElement, device: GPUDevice): GPUMultiPassRenderer {
    return new GPUMultiPassRenderer(
      canvas,
      [
        { name: 'bgPass', shader: { vertex: WgslVertex, fragment: WgslFragBg } },
        {
          name: 'vBlurPass',
          shader: { vertex: WgslVertex, fragment: WgslFragVblur },
          inputs: { u_prevPassTexture: 'bgPass' },
        },
        {
          name: 'hBlurPass',
          shader: { vertex: WgslVertex, fragment: WgslFragHblur },
          inputs: { u_prevPassTexture: 'vBlurPass' },
        },
        {
          name: 'mainPass',
          shader: { vertex: WgslVertex, fragment: WgslFragMain },
          inputs: { u_blurredBg: 'hBlurPass', u_bg: 'bgPass' },
          outputToScreen: true,
        },
      ],
      device,
    );
  }

  /** Read container size and DPR; resize renderer if changed. */
  measure(): void {
    if (!this.container || !this.canvas || !this.renderer) return;

    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this.options.maxDpr ?? 2);

    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (width !== this.width || height !== this.height || dpr !== this.dpr) {
      this.width = width;
      this.height = height;
      this.dpr = dpr;

      const pw = Math.round(width * dpr);
      const ph = Math.round(height * dpr);
      this.canvas.width = pw;
      this.canvas.height = ph;

      if (this.backend.kind === 'webgl') {
        const gl = this.canvas.getContext('webgl2');
        gl?.viewport(0, 0, pw, ph);
      }

      this.renderer.resize(pw, ph);

      // Resizing a canvas destroys its backing store (WebGL) or orphans the
      // presented frame (WebGPU shows a stale, stretched image). The
      // render-on-demand check below would happily skip every following
      // frame when no *shape* moved (e.g. height-only layout change), leaving
      // glass blank or frozen at pre-resize positions — so force one repaint.
      this.lastPackedCount = -1;
    }
  }

  /** Begin loading the configured background texture (textured mode). */
  private loadBackgroundTexture(): void {
    const bg = this.options.background;
    if (!this.canvas || !bg || bg.kind === 'procedural') return;

    if (bg.kind === 'video') {
      this.bgIsVideo = true;
      const el = document.createElement('video');
      el.src = bg.url;
      el.loop = true;
      el.muted = true;
      el.playsInline = true;
      el.style.display = 'none';
      document.body.appendChild(el);
      el.play().catch(() => undefined);
      this.videoEl = el;
      this.bgTextureReady = false;
      if (this.backend.kind === 'webgl' && this.canvas) {
        const gl = this.canvas.getContext('webgl2');
        if (gl) this.bgTexture = createEmptyTexture(gl);
      } else if (this.backend.kind === 'webgpu' && this.device) {
        this.bgTexture = gpuCreateEmptyTexture(this.device);
      }
      return;
    }

    this.bgIsVideo = false;
    const url = bg.url;
    if (this.backend.kind === 'webgl' && this.canvas) {
      const gl = this.canvas.getContext('webgl2');
      if (!gl) return;
      loadTextureFromURL(gl, url).then(({ texture, ratio }) => {
        if (this.loadedBgUrl && this.loadedBgUrl !== url) return;
        this.bgTexture = texture;
        this.bgTextureRatio = ratio;
        const wasReady = this.bgTextureReady;
        this.bgTextureReady = true;
        // Texture arrival must wake the render-on-demand loop — otherwise the
        // backdrop (and glass over it) only appears after the next dirty event.
        if (!wasReady) this.lastPackedCount = -1;
      });
    } else if (this.backend.kind === 'webgpu' && this.device) {
      gpuLoadTextureFromURL(this.device, url).then(({ texture, ratio }) => {
        if (this.loadedBgUrl && this.loadedBgUrl !== url) return;
        this.bgTexture = texture;
        this.bgTextureRatio = ratio;
        const wasReady = this.bgTextureReady;
        this.bgTextureReady = true;
        if (!wasReady) this.lastPackedCount = -1;
      });
    }
    this.loadedBgUrl = url;
  }

  /** Change the backdrop after attach. */
  setBackground(bg: EngineBgType | undefined): void {
    this.options = { ...this.options, background: bg };
    this.bgTextureReady = false;
    this.loadedBgUrl = null;
    this.lastPackedCount = -1; // wake the loop for the backdrop swap
    if (bg?.kind === 'procedural') {
      this.bgTexture = null;
      this.bgIsVideo = false;
      if (this.videoEl) {
        this.videoEl.pause();
        this.videoEl.remove();
        this.videoEl = null;
      }
      return;
    }
    this.loadBackgroundTexture();
  }

  private startLoop(): void {
    if (this.stopRender) return;

    let hasVideoData = false;

    const frame = (dt: number) => {
      if (this.disposed || !this.renderer || !this.canvas) return;

      // 1. Viewport sync.
      this.measure();

      // 1.5 Per-frame geometry refresh. Components only re-sync on resize;
      // everything else that moves an element without resizing it — page
      // scroll under a fixed-position component (dock), layout settling,
      // transform-based magnification — must be re-measured here or the GPU
      // shape drifts from its DOM element (ghost outlines). All rect reads
      // are batched contiguously so this costs one reflow, and shapes whose
      // position is unchanged are not marked dirty (render-on-demand keeps
      // skipping GPU work on static pages).
      if (this.registry.size > 0) {
        const rootRect = this.container?.getBoundingClientRect();
        if (rootRect) {
          for (const shape of this.registry.list()) {
            const el = shape.element;
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const nx = rect.left - rootRect.left + rect.width / 2;
            const ny = rect.top - rootRect.top + rect.height / 2;
            const s = shape.state;
            if (
              Math.abs(nx - s.x) > 0.25 ||
              Math.abs(ny - s.y) > 0.25 ||
              Math.abs(rect.width / 2 - s.halfWidth) > 0.25 ||
              Math.abs(rect.height / 2 - s.halfHeight) > 0.25
            ) {
              shape.state = {
                ...s,
                x: nx,
                y: ny,
                halfWidth: rect.width / 2,
                halfHeight: rect.height / 2,
              };
              shape.dirty = true;
            }
          }
        }
      }

      // 2. Video texture update (Studio logic).
      if (this.bgIsVideo && this.videoEl && this.bgTexture) {
        if (this.backend.kind === 'webgl') {
          const gl = this.canvas.getContext('webgl2');
          if (gl) {
            const info = updateVideoTexture(gl, this.bgTexture as WebGLTexture, this.videoEl);
            if (info) {
              this.bgTextureRatio = info.ratio;
              this.bgTextureReady = true;
              hasVideoData = true;
            }
          }
        } else if (this.backend.kind === 'webgpu' && this.device) {
          gpuUpdateVideoTexture(this.device, this.bgTexture as GPUTexture, this.videoEl).then(
            (info) => {
              if (info) {
                this.bgTexture = info.texture;
                this.bgTextureRatio = info.ratio;
                this.bgTextureReady = true;
                hasVideoData = true;
              }
            },
          );
        }
      }

      // 3. Render-on-demand: skip GPU submission when nothing is in motion.
      const dirty = this.registry.isDirty();
      if (!dirty && !hasVideoData && this.lastPackedCount === this.registry.packed.count) {
        // Nothing changed — cheap frame.
        return;
      }

      // 4. Pack shapes + choose active blur group (batching).
      this.registry.pack();
      if (this.registry.droppedInLastPack > 0) {
        // Loud, once per burst — silent glass loss is the "dock has no glass"
        // bug class. Not a console spam risk: only fires when over capacity.
        console.warn(
          `[liquid-ui] ${this.registry.droppedInLastPack} shape(s) beyond MAX_SHAPES=${MAX_SHAPES} got no glass. ` +
            'Reduce simultaneous liquid surfaces on screen or raise MAX_SHAPES (shaders + registry must stay in sync).',
        );
      }
      this.registry.clearDirty();

      const shapes = this.registry.list().filter((s) => s.visible);
      let blurGroup = 1;
      if (shapes.length > 0) {
        // Majority blur value across visible shapes decides the shared blur
        // pass for this frame (single blur pipeline, like the Studio).
        const counts = new Map<number, number>();
        for (const s of shapes) {
          const k = blurGroupKey(s.state.material.blur);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        blurGroup = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
      const blurChanged = blurGroup !== this.activeBlurGroup;
      this.activeBlurGroup = blurGroup;
      this.blurWeights = computeGaussianKernelByRadius(blurGroup);

      const bg = this.options.background;
      const bgType = !bg ? 0 : bg.kind === 'procedural' ? bg.index : 11;
      // Transparent compositing: dom mode renders the glass over the page
      // (alpha carries coverage); textured mode keeps an opaque backdrop.
      const transparentBg = this.options.backdropMode === 'dom' ? 1 : 0;
      if (this.backend.kind === 'webgl' && transparentBg !== this.lastTransparentBg) {
        (this.renderer as MultiPassRenderer).setBlendMode(
          transparentBg ? 'premultiplied' : 'opaque',
        );
        this.lastTransparentBg = transparentBg;
      }

      const pw = this.width * this.dpr;
      const ph = this.height * this.dpr;

      // 5. Push uniforms (global + per-pass) — same structure as the Studio.
      this.renderer.setUniforms({
        u_resolution: [pw, ph],
        u_dpr: this.dpr,
        u_shapeCount: this.registry.packed.count,
        u_mergeRate: 0.05,
        u_bgType: bgType,
        u_bgTextureRatio: this.bgTextureRatio,
        u_bgTextureReady: this.bgTextureReady ? 1 : 0,
        u_transparentBg: transparentBg,
        // Canvas contexts are premultipliedAlpha; the shader must output
        // premultiplied color for correct src-over compositing.
        u_premultiply: 1,
        u_shapesA: this.registry.packed.shapesA,
        u_shapesB: this.registry.packed.shapesB,
        u_shapesC: this.registry.packed.shapesC,
        u_shapeM0: this.registry.packed.shapeM0,
        u_shapeM1: this.registry.packed.shapeM1,
        u_shapeM2: this.registry.packed.shapeM2,
        u_shapeM3: this.registry.packed.shapeM3,
        u_shapeTint: this.registry.packed.shapeTint,
        u_blurWeights: this.blurWeights,
        u_blurRadius: blurGroup,
      });

      if (this.backend.kind === 'webgl') {
        const gl = this.canvas.getContext('webgl2');
        if (gl) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
      }

      const layers = this.registry.getActiveLayers();
      const isMultiLayer = layers.length > 1;

      if (!isMultiLayer || this.backend.kind !== 'webgl') {
        this.renderer.render({
          bgPass: {
            u_bgType: bgType,
            u_bgTexture: (bgType === 11 && this.bgTextureReady && this.bgTexture ? this.bgTexture : undefined) as never,
            u_bgTextureRatio: this.bgTextureRatio,
            u_bgTextureReady: this.bgTextureReady ? 1 : 0,
          },
          mainPass: {},
        });
      } else {
        const glRenderer = this.renderer as MultiPassRenderer;

        // 1. Render base backdrop and blur passes
        glRenderer.renderPass('bgPass', {
          u_bgType: bgType,
          u_bgTexture: (bgType === 11 && this.bgTextureReady && this.bgTexture ? this.bgTexture : undefined) as never,
          u_bgTextureRatio: this.bgTextureRatio,
          u_bgTextureReady: this.bgTextureReady ? 1 : 0,
        });
        glRenderer.renderPass('vBlurPass');
        glRenderer.renderPass('hBlurPass');

        let currentBgTexture: WebGLTexture | null = glRenderer.getPass('bgPass')?.getOutputTexture() ?? null;
        const currentBlurredTexture: WebGLTexture | null = glRenderer.getPass('hBlurPass')?.getOutputTexture() ?? null;

        for (let idx = 0; idx < layers.length; idx++) {
          const layerNum = layers[idx];
          const isLast = idx === layers.length - 1;
          const layerPack = this.registry.getPackedLayer(layerNum);

          const layerUniforms: Record<string, unknown> = {
            u_shapeCount: layerPack.count,
            u_shapesA: layerPack.shapesA,
            u_shapesB: layerPack.shapesB,
            u_shapesC: layerPack.shapesC,
            u_shapeM0: layerPack.shapeM0,
            u_shapeM1: layerPack.shapeM1,
            u_shapeM2: layerPack.shapeM2,
            u_shapeM3: layerPack.shapeM3,
            u_shapeTint: layerPack.shapeTint,
            u_bg: currentBgTexture,
            u_blurredBg: currentBlurredTexture,
          };

          if (isLast) {
            // Final layer outputs to canvas screen
            glRenderer.renderPass('mainPass', layerUniforms, null);
          } else {
            // Intermediate layer outputs to FBO buffer
            const layerFbo = glRenderer.getOrCreateLayerFrameBuffer(idx);
            glRenderer.renderPass('mainPass', layerUniforms, layerFbo);
            currentBgTexture = layerFbo.getTexture();
          }
        }
      }

      this.lastPackedCount = this.registry.packed.count;
    };

    this.stopRender = this.scheduler.add(frame);
  }

  /** Compute a component's geometry in engine (root-relative CSS px) space. */
  computeShapeGeometry(el: HTMLElement, material: LiquidMaterial) {
    const rootRect = this.container?.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (!rootRect) {
      return { x: 0, y: 0, halfWidth: rect.width / 2, halfHeight: rect.height / 2 };
    }
    return {
      x: rect.left - rootRect.left + rect.width / 2,
      y: rect.top - rootRect.top + rect.height / 2,
      halfWidth: rect.width / 2,
      halfHeight: rect.height / 2,
    };
  }

  dispose(): void {
    this.disposed = true;
    this.stopRender?.();
    this.stopRender = null;

    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.remove();
      this.videoEl = null;
    }

    if (this.bgTexture) {
      if (this.backend.kind === 'webgl' && this.canvas) {
        const gl = this.canvas.getContext('webgl2');
        gl?.deleteTexture(this.bgTexture as WebGLTexture);
      } else if (this.backend.kind === 'webgpu') {
        (this.bgTexture as GPUTexture)?.destroy();
      }
      this.bgTexture = null;
    }

    this.renderer?.dispose();
    this.renderer = null;
    this.canvas?.remove();
    this.canvas = null;
    this.container = null;
  }
}
