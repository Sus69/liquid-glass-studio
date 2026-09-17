/**
 * liquid-ui — reusable liquid-glass UI components.
 *
 * The GPU renderer (WebGL2 / WebGPU, generalized from Liquid Glass Studio)
 * runs underneath as a shared engine; components are normal, accessible DOM.
 */
import './styles/styles.css';

// Root + context
export { LiquidProvider, type LiquidProviderProps } from './components/LiquidProvider';
export { LiquidContext, useLiquidContext } from './context';

// Core primitive (advanced usage)
export { LiquidSurface, type LiquidSurfaceProps } from './components/LiquidSurface';

// Components
export { LiquidDiv, type LiquidDivProps } from './components/LiquidDiv';
export {
  LiquidButton,
  type LiquidButtonProps,
  type LiquidButtonVariant,
  type LiquidButtonSize,
} from './components/LiquidButton';
export { LiquidCard, type LiquidCardProps } from './components/LiquidCard';
export { LiquidPill, type LiquidPillProps } from './components/LiquidPill';
export { LiquidInput, type LiquidInputProps } from './components/LiquidInput';
export { LiquidIconButton, type LiquidIconButtonProps } from './components/LiquidIconButton';
export { LiquidToggle, type LiquidToggleProps } from './components/LiquidToggle';
export { LiquidTooltip, type LiquidTooltipProps } from './components/LiquidTooltip';
export { LiquidModal, type LiquidModalProps } from './components/LiquidModal';
export {
  LiquidDock,
  LiquidDockItem,
  type LiquidDockProps,
  type LiquidDockItemProps,
} from './components/LiquidDock';
export {
  LiquidBlob,
  LiquidBlobShape,
  type LiquidBlobProps,
  type LiquidBlobShapeProps,
} from './components/LiquidBlob';

// Materials
export { LIQUID_PRESETS, resolvePreset, cloneMaterial } from './materials/presets';
export { resolveMaterial, blurGroupKey } from './materials/resolveMaterial';
export { materialToShapeUniforms, type ShapeUniforms } from './materials/toUniforms';

// Engine (advanced usage — not needed for basic components)
export {
  LiquidEngine,
  computeGaussianKernelByRadius,
  type EngineBgType,
  type LiquidEngineOptions,
} from './engine/LiquidEngine';
export { detectWebGPU, type WebGPUDetectResult } from './engine/gpuDetect';
export { PointerSpring, ScalarSpring } from './engine/interaction';
export { Scheduler } from './engine/scheduler';

// Low-level renderer classes (Studio / advanced consumers)
export {
  MultiPassRenderer,
  ShaderProgram,
  FrameBuffer,
  RenderPass,
  type RenderPassConfig,
} from './engine/backends/webgl/MultiPassRenderer';
export { GPUMultiPassRenderer } from './engine/backends/webgpu/GPUMultiPassRenderer';
export {
  createEmptyTexture,
  loadTextureFromURL,
  updateVideoTexture,
} from './engine/backends/webgl/textures';
export {
  gpuCreateEmptyTexture,
  gpuLoadTextureFromURL,
  gpuUpdateVideoTexture,
} from './engine/backends/webgpu/textures';

// Hooks
export { useElementBounds, useReducedMotion } from './hooks';

// Types
export type {
  LiquidMaterial,
  LiquidMaterialOverride,
  LiquidPresetName,
  LiquidBackdropMode,
  LiquidBackendKind,
  LiquidBackendInfo,
  LiquidRGB,
  LiquidRGBA,
  LiquidShapeState,
  LiquidSpringConfig,
  LiquidInteraction,
  LiquidComponentProps,
  LiquidTextureHandle,
  LiquidGlassInput,
} from './types';
