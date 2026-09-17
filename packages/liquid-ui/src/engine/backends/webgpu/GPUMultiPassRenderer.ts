/**
 * WebGPU multi-pass renderer.
 *
 * Adapted from Liquid Glass Studio's src/utils/GPUUtils.ts — the pass-type
 * bind group layouts (bg / blur / main), rgba16float intermediate buffers,
 * placeholder texture, and uniform packing are preserved. Adapted for the
 * generalized N-shape pipeline: one shared uniform buffer reused across
 * passes, packed per-shape arrays written per frame.
 */

import type { RenderPassConfig } from '../webgl/MultiPassRenderer';

class GPUFrameBuffer {
  private device: GPUDevice;
  private _colorTexture: GPUTexture;
  private _colorView: GPUTextureView;
  private width: number;
  private height: number;

  constructor(device: GPUDevice, width: number, height: number) {
    this.device = device;
    this.width = width;
    this.height = height;
    const color = this.createColorTexture();
    this._colorTexture = color;
    this._colorView = color.createView();
  }

  private createColorTexture() {
    return this.device.createTexture({
      size: [this.width, this.height],
      format: 'rgba16float',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
  }

  get colorTexture(): GPUTexture {
    return this._colorTexture;
  }
  get colorView(): GPUTextureView {
    return this._colorView;
  }

  resize(width: number, height: number): void {
    if (this.width === width && this.height === height) return;
    this._colorTexture.destroy();
    this.width = width;
    this.height = height;
    const color = this.createColorTexture();
    this._colorTexture = color;
    this._colorView = color.createView();
  }

  dispose(): void {
    this._colorTexture.destroy();
  }
}

/** Pass type determines which bind group layout to use. */
type PassType = 'bg' | 'blur' | 'main';

function detectPassType(config: RenderPassConfig): PassType {
  if (config.name === 'bgPass') return 'bg';
  if (config.name === 'vBlurPass' || config.name === 'hBlurPass') return 'blur';
  return 'main';
}

class GPURenderPassObj {
  private device: GPUDevice;
  private pipeline: GPURenderPipeline;
  private vertexBuffer: GPUBuffer;
  private frameBuffer: GPUFrameBuffer | null;
  private passType: PassType;
  public config: RenderPassConfig;

  private bindGroupLayout: GPUBindGroupLayout;

  constructor(
    device: GPUDevice,
    config: RenderPassConfig,
    canvasFormat: GPUTextureFormat,
    width: number,
    height: number,
  ) {
    this.device = device;
    this.config = config;
    this.passType = detectPassType(config);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.vertexBuffer, 0, vertices);

    this.bindGroupLayout = this.createBindGroupLayout();

    const shaderModule = device.createShaderModule({
      code: config.shader.vertex + '\n' + config.shader.fragment,
    });

    const outputFormat = config.outputToScreen ? canvasFormat : ('rgba16float' as GPUTextureFormat);

    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 2 * 4,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [
          config.outputToScreen
            ? {
                format: outputFormat,
                // Premultiplied src-over for transparent (dom) compositing;
                // with opaque alpha the factor reduces to plain replace.
                blend: {
                  color: {
                    srcFactor: 'one',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                  },
                  alpha: {
                    srcFactor: 'one',
                    dstFactor: 'one-minus-src-alpha',
                    operation: 'add',
                  },
                },
              }
            : { format: outputFormat },
        ],
      },
      primitive: { topology: 'triangle-strip' },
    });

    this.frameBuffer = config.outputToScreen ? null : new GPUFrameBuffer(device, width, height);
  }

  private createBindGroupLayout(): GPUBindGroupLayout {
    if (this.passType === 'blur') {
      return this.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
          { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
          { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        ],
      });
    } else if (this.passType === 'main') {
      return this.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
          { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
          { binding: 3, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        ],
      });
    } else {
      // bg pass
      return this.device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
          { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        ],
      });
    }
  }

  render(
    encoder: GPUCommandEncoder,
    targetView: GPUTextureView | null,
    bindGroup: GPUBindGroup,
  ): void {
    const view = this.frameBuffer ? this.frameBuffer.colorView : targetView!;

    const passDesc: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const pass = encoder.beginRenderPass(passDesc);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(4);
    pass.end();
  }

  getOutputTexture(): GPUTexture | null {
    return this.frameBuffer ? this.frameBuffer.colorTexture : null;
  }

  getBindGroupLayout(): GPUBindGroupLayout {
    return this.bindGroupLayout;
  }

  getPassType(): PassType {
    return this.passType;
  }

  resize(width: number, height: number): void {
    this.frameBuffer?.resize(width, height);
  }

  dispose(): void {
    this.frameBuffer?.dispose();
    this.vertexBuffer.destroy();
  }
}

export class GPUMultiPassRenderer {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private canvasFormat: GPUTextureFormat;
  private passes: Map<string, GPURenderPassObj> = new Map();
  private passesArray: GPURenderPassObj[] = [];
  private globalUniforms: Record<string, unknown> = {};
  private sampler: GPUSampler;

  // Shared uniform buffers — created once, rewritten each frame (no per-frame
  // allocation, unlike the original which created buffers every frame).
  private mainUniformBuffer: GPUBuffer;
  private blurUniformBuffer: GPUBuffer;
  private blurWeightsBuffer: GPUBuffer;
  private placeholderTexture: GPUTexture;

  // Header (12 floats) + _headerPad (4 floats, byte 48–64) + 8 shape arrays
  // × 48 vec4 = 1552 floats → 6208 bytes. Must match the WGSL Uniforms struct
  // (MAX_SHAPES=48, _headerPad) and the GLSL sdf.glsl include.
  private mainUniformData = new ArrayBuffer(6208);
  private mainUniformF32 = new Float32Array(this.mainUniformData);
  private mainUniformI32 = new Int32Array(this.mainUniformData);

  constructor(canvas: HTMLCanvasElement, configs: RenderPassConfig[], device: GPUDevice) {
    this.device = device;
    const context = canvas.getContext('webgpu');
    if (!context) throw new Error('WebGPU context not available');
    this.context = context;

    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    // Premultiplied alpha: the engine canvas composites over the DOM page in
    // transparent (dom) mode; glass shapes write premultiplied output.
    context.configure({
      device,
      format: this.canvasFormat,
      alphaMode: 'premultiplied',
    });

    this.sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
    });

    this.placeholderTexture = device.createTexture({
      size: [1, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    device.queue.writeTexture(
      { texture: this.placeholderTexture },
      new Uint8Array([255, 255, 255, 255]),
      { bytesPerRow: 4 },
      [1, 1],
    );

    // Shared uniform buffers (reused every frame).
    this.mainUniformBuffer = device.createBuffer({
      size: this.mainUniformData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.blurUniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.blurWeightsBuffer = device.createBuffer({
      size: 4 * 256,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    for (const cfg of configs) {
      const pass = new GPURenderPassObj(device, cfg, this.canvasFormat, canvas.width, canvas.height);
      this.passes.set(cfg.name, pass);
      this.passesArray.push(pass);
    }
  }

  resize(width: number, height: number): void {
    for (const pass of this.passesArray) {
      pass.resize(width, height);
    }
  }

  setUniform(name: string, value: unknown): void {
    this.globalUniforms[name] = value;
  }

  setUniforms(uniforms: Record<string, unknown>): void {
    Object.assign(this.globalUniforms, uniforms);
  }

  clearUniform(name: string): void {
    delete this.globalUniforms[name];
  }

  clearAllUniforms(): void {
    this.globalUniforms = {};
  }

  render(
    passUniforms?: Record<string, unknown>[] | Record<string, Record<string, unknown>>,
  ): void {
    const encoder = this.device.createCommandEncoder();
    const targetView = this.context.getCurrentTexture().createView();

    // Upload shared main uniform buffer once per frame.
    this.writeMainUniformData();
    this.device.queue.writeBuffer(this.mainUniformBuffer, 0, this.mainUniformData);

    // Blur uniforms.
    const res = (this.globalUniforms.u_resolution as [number, number] | undefined) ?? [0, 0];
    const blurData = new ArrayBuffer(16);
    const blurF32 = new Float32Array(blurData);
    const blurI32 = new Int32Array(blurData);
    blurF32[0] = res[0];
    blurF32[1] = res[1];
    blurI32[2] = (this.globalUniforms.u_blurRadius as number | undefined) ?? 1;
    this.device.queue.writeBuffer(this.blurUniformBuffer, 0, blurData);

    const weights: number[] = (this.globalUniforms.u_blurWeights as number[] | undefined) ?? [1.0];
    const weightsData = new Float32Array(256);
    weightsData.set(weights.slice(0, 256));
    this.device.queue.writeBuffer(this.blurWeightsBuffer, 0, weightsData);

    for (let i = 0; i < this.passesArray.length; i++) {
      const pass = this.passesArray[i];
      const config = pass.config;

      const uniforms: Record<string, unknown> = { ...this.globalUniforms };
      if (passUniforms) {
        if (Array.isArray(passUniforms)) {
          Object.assign(uniforms, passUniforms[i]);
        } else {
          Object.assign(uniforms, passUniforms[config.name] ?? null);
        }
      }

      const inputTextures: Record<string, GPUTexture> = {};
      if (config.inputs) {
        for (const [uniformName, fromPassName] of Object.entries(config.inputs)) {
          const fromPass = this.passes.get(fromPassName);
          const tex = fromPass?.getOutputTexture();
          if (tex) {
            inputTextures[uniformName] = tex;
          }
        }
      }

      const bindGroup = this.buildBindGroup(pass, uniforms, inputTextures);

      pass.render(encoder, config.outputToScreen ? targetView : null, bindGroup);
    }

    this.device.queue.submit([encoder.finish()]);
  }

  /**
   * Packs global + per-shape uniforms into the shared main uniform buffer.
   * Mirrors the Uniforms struct in the generalized WGSL shaders.
   */
  private writeMainUniformData(): void {
    const f32 = this.mainUniformF32;
    const i32 = this.mainUniformI32;
    f32.fill(0);

    // Header: resolution(2) + dpr(1) + shapeCount(1) + mergeRate(1)
    //          + bgType(1) + bgTextureRatio(1) + bgTextureReady(1)
    const res = (this.globalUniforms.u_resolution as [number, number] | undefined) ?? [0, 0];
    f32[0] = res[0];
    f32[1] = res[1];
    f32[2] = (this.globalUniforms.u_dpr as number | undefined) ?? 1;
    i32[3] = (this.globalUniforms.u_shapeCount as number | undefined) ?? 0;
    f32[4] = (this.globalUniforms.u_mergeRate as number | undefined) ?? 0.05;
    i32[5] = (this.globalUniforms.u_bgType as number | undefined) ?? 0;
    f32[6] = (this.globalUniforms.u_bgTextureRatio as number | undefined) ?? 1;
    i32[7] = (this.globalUniforms.u_bgTextureReady as number | undefined) ?? 0;
    i32[8] = (this.globalUniforms.u_transparentBg as number | undefined) ?? 0;

    // Packed shape arrays start at f32 offset 16 (vec4 row 4, byte 64) —
    // matching the WGSL Uniforms struct where a `_headerPad: vec4f` follows
    // the 9 header scalars (36 bytes → padded to 64 for array alignment).
    const shapesA = (this.globalUniforms.u_shapesA as Float32Array | undefined) ?? new Float32Array(0);
    const shapesB = (this.globalUniforms.u_shapesB as Float32Array | undefined) ?? new Float32Array(0);
    const shapesC = (this.globalUniforms.u_shapesC as Float32Array | undefined) ?? new Float32Array(0);
    const shapeM0 = (this.globalUniforms.u_shapeM0 as Float32Array | undefined) ?? new Float32Array(0);
    const shapeM1 = (this.globalUniforms.u_shapeM1 as Float32Array | undefined) ?? new Float32Array(0);
    const shapeM2 = (this.globalUniforms.u_shapeM2 as Float32Array | undefined) ?? new Float32Array(0);
    const shapeM3 = (this.globalUniforms.u_shapeM3 as Float32Array | undefined) ?? new Float32Array(0);
    const shapeTint = (this.globalUniforms.u_shapeTint as Float32Array | undefined) ?? new Float32Array(0);

    const rowStride = 4;
    const startRow = 4;
    const rows = 48;

    const copyRows = (src: Float32Array, destRowOffset: number) => {
      const count = Math.min(rows, Math.floor(src.length / 4));
      for (let r = 0; r < count; r++) {
        const srcOff = r * rowStride;
        const dstOff = (startRow + destRowOffset + r) * rowStride;
        f32[dstOff] = src[srcOff];
        f32[dstOff + 1] = src[srcOff + 1];
        f32[dstOff + 2] = src[srcOff + 2];
        f32[dstOff + 3] = src[srcOff + 3];
      }
    };

    copyRows(shapesA, 0);
    copyRows(shapesB, rows);
    copyRows(shapesC, rows * 2);
    copyRows(shapeM0, rows * 3);
    copyRows(shapeM1, rows * 4);
    copyRows(shapeM2, rows * 5);
    copyRows(shapeM3, rows * 6);
    copyRows(shapeTint, rows * 7);
  }

  private buildBindGroup(
    pass: GPURenderPassObj,
    uniforms: Record<string, unknown>,
    inputTextures: Record<string, GPUTexture>,
  ): GPUBindGroup {
    const passType = pass.getPassType();

    if (passType === 'blur') {
      return this.buildBlurBindGroup(pass, inputTextures);
    } else if (passType === 'main') {
      return this.buildMainBindGroup(pass, inputTextures);
    } else {
      return this.buildBgBindGroup(pass, uniforms);
    }
  }

  private buildBgBindGroup(pass: GPURenderPassObj, uniforms: Record<string, unknown>): GPUBindGroup {
    const bgTexture = (uniforms.u_bgTexture as GPUTexture) ?? this.placeholderTexture;

    return this.device.createBindGroup({
      layout: pass.getBindGroupLayout(),
      entries: [
        { binding: 0, resource: { buffer: this.mainUniformBuffer } },
        { binding: 1, resource: bgTexture.createView() },
        { binding: 2, resource: this.sampler },
      ],
    });
  }

  private buildBlurBindGroup(
    pass: GPURenderPassObj,
    inputTextures: Record<string, GPUTexture>,
  ): GPUBindGroup {
    const inputTex = inputTextures.u_prevPassTexture ?? this.placeholderTexture;

    return this.device.createBindGroup({
      layout: pass.getBindGroupLayout(),
      entries: [
        { binding: 0, resource: { buffer: this.blurUniformBuffer } },
        { binding: 1, resource: inputTex.createView() },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: { buffer: this.blurWeightsBuffer } },
      ],
    });
  }

  private buildMainBindGroup(
    pass: GPURenderPassObj,
    inputTextures: Record<string, GPUTexture>,
  ): GPUBindGroup {
    const blurredBg = inputTextures.u_blurredBg ?? this.placeholderTexture;
    const bg = inputTextures.u_bg ?? this.placeholderTexture;

    return this.device.createBindGroup({
      layout: pass.getBindGroupLayout(),
      entries: [
        { binding: 0, resource: { buffer: this.mainUniformBuffer } },
        { binding: 1, resource: blurredBg.createView() },
        { binding: 2, resource: bg.createView() },
        { binding: 3, resource: this.sampler },
      ],
    });
  }

  dispose(): void {
    for (const pass of this.passesArray) {
      pass.dispose();
    }
    this.passes.clear();
    this.passesArray = [];
    this.mainUniformBuffer.destroy();
    this.blurUniformBuffer.destroy();
    this.blurWeightsBuffer.destroy();
    this.placeholderTexture.destroy();
    this.globalUniforms = {};
  }
}
