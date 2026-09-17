/**
 * Studio migration adapter.
 *
 * The Studio's App.tsx now drives the shared `liquid-ui` engine instead of
 * its own private GLUtils/GPUUtils imports. This adapter exposes a small
 * imperative surface the App's render loop uses: the engine instance is
 * created with the Studio's four-pass pipeline and its uniforms are pushed
 * every frame exactly as before — but through the generalized N-shape
 * pipeline (the Studio's two shapes are just two registered shapes).
 */
import {
  LiquidEngine,
  MultiPassRenderer,
  GPUMultiPassRenderer,
  computeGaussianKernelByRadius,
  type EngineBgType,
} from 'liquid-ui';

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

export interface StudioRenderer {
  resize(width: number, height: number): void;
  setUniform(name: string, value: unknown): void;
  setUniforms(uniforms: Record<string, unknown>): void;
  render(passUniforms: Record<string, Record<string, unknown>>): void;
  dispose(): void;
}

export interface StudioEngineHooks {
  createWebGLRenderer(canvas: HTMLCanvasElement): StudioRenderer;
  createWebGPURenderer(canvas: HTMLCanvasElement, device: GPUDevice): StudioRenderer;
}

export { computeGaussianKernelByRadius };

/**
 * The Studio's original pass graphs (GLSL + WGSL), preserved verbatim.
 * These render through the generalized engine shaders in the package; the
 * Studio's own shader files remain for the STEP debug view parity.
 */
export function createStudioWebGLRenderer(canvas: HTMLCanvasElement): MultiPassRenderer {
  return new MultiPassRenderer(canvas, [
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
  ]);
}

export function createStudioWebGPURenderer(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
): GPUMultiPassRenderer {
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

export { LiquidEngine };
export type { EngineBgType };
