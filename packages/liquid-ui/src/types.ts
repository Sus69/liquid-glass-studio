/**
 * Public type surface of liquid-ui.
 *
 * The material types here are a clean abstraction over the engine's shader
 * uniforms: every field maps 1:1 onto an existing uniform from the original
 * Liquid Glass Studio renderer (see materials/toUniforms.ts for the mapping).
 */

/** RGB color as 0-255 channels. */
export interface LiquidRGB {
  r: number;
  g: number;
  b: number;
}

/** RGBA color; r/g/b are 0-255, a is 0-1. */
export interface LiquidRGBA extends LiquidRGB {
  a: number;
}

/** A WebGL or WebGPU texture handle used as a backdrop source. */
export type LiquidTextureHandle = WebGLTexture | GPUTexture;

/**
 * Full low-level material description. Every field corresponds to an
 * existing uniform of the original Liquid Glass Studio renderer.
 */
export interface LiquidMaterial {
  /** Glass edge thickness in CSS pixels → u_refThickness. */
  thickness: number;
  /** Refractive index (1 = none) → u_refFactor. */
  refraction: number;
  /** Refraction offset distance → u_refDistance. */
  refractionDistance: number;
  /** Chromatic dispersion amount → u_refDispersion. */
  dispersion: number;
  /** Fresnel edge-light intensity → u_refFresnelFactor (0-1). */
  fresnel: number;
  /** Fresnel falloff range → u_refFresnelRange. */
  fresnelRange: number;
  /** Fresnel edge hardness → u_refFresnelHardness (0-1). */
  fresnelHardness: number;
  /** Glare intensity → u_glareFactor (0-1). */
  glare: number;
  /** Glare band range → u_glareRange. */
  glareRange: number;
  /** Glare band hardness → u_glareHardness (0-1). */
  glareHardness: number;
  /** Glare convergence exponent control → u_glareConvergence (0-1). */
  glareConvergence: number;
  /** Opposite-side glare multiplier → u_glareOppositeFactor (0-1). */
  glareOppositeFactor: number;
  /** Glare rotation in degrees → u_glareAngle. */
  glareAngle: number;
  /** Backdrop blur radius in px → u_blurRadius (+ u_blurWeights). */
  blur: number;
  /** Blend blurred backdrop through the whole edge → u_blurEdge. */
  borderBlend: boolean;
  /** Tint color → u_tint (rgb 0-255, a 0-1). */
  tint: LiquidRGBA;
  /** Shadow spread → u_shadowExpand. */
  shadowExpand: number;
  /** Shadow strength → u_shadowFactor (0-1). */
  shadow: number;
  /** Shadow offset → u_shadowPosition. */
  shadowOffset: { x: number; y: number };
  /** Shape merge radius for blob merging → u_mergeRate. */
  merge: number;
  /** Corner radius in px → u_shapeRadius. */
  radius: number;
  /** Superellipse roundness (2=ellipse, 5≈iOS squircle) → u_shapeRoundness. */
  roundness: number;
  /** Optical depth layer (0 = background/card, 1 = controls/buttons, 2 = modals). Defaults to 0. */
  layer?: number;
}

/** All material fields are optional when overriding a preset. */
export type LiquidMaterialOverride = Partial<LiquidMaterial>;

/** Named material presets. */
export type LiquidPresetName = 'soft' | 'clear' | 'frosted' | 'dark' | 'strong';

/**
 * How the engine obtains the pixels behind a glass shape.
 *
 * - `textured`: full GPU fidelity — the backdrop source is uploaded as a
 *   texture and the complete refraction/dispersion pipeline runs against it
 *   (Studio-style).
 * - `dom`: the GPU canvas draws shape/edge/lighting over an existing DOM
 *   backdrop; interior blur of real page content uses backdrop-filter.
 * - `css`: no GPU at all — pure CSS approximation.
 */
export type LiquidBackdropMode = 'textured' | 'dom' | 'css';

/** Spring configuration used for press/hover/pointer interactions. */
export interface LiquidSpringConfig {
  /** Stiffness of the spring (higher = snappier). */
  stiffness: number;
  /** Damping of the spring (lower = bouncier). */
  damping: number;
  /** Optional mass. */
  mass?: number;
}

/** Interaction tuning shared by interactive components. */
export interface LiquidInteraction {
  /** Enable pointer-following hover motion (default depends on component). */
  hover?: boolean;
  /** Enable press compression (default true for buttons). */
  press?: boolean;
  /** Multiplier for hover displacement (0-1 range recommended). */
  strength?: number;
  /** Override spring physics. */
  spring?: LiquidSpringConfig;
}

/** Props common to every liquid component. */
export interface LiquidComponentProps {
  /** Preset name or partial material override. */
  glass?: LiquidPresetName | LiquidMaterialOverride;
  /** Extra class names merged onto the DOM element. */
  className?: string;
  /** Inline styles merged onto the DOM element. */
  style?: React.CSSProperties;
  /** Ref forwarded to the underlying DOM element. */
  children?: React.ReactNode;
  /** Optical depth layer index (0 = background/card, 1 = controls, 2 = modals/tooltips). Defaults to 0 or auto-derived. */
  layer?: number;
}

/** Shape description sent from a component to the engine each frame. */
export interface LiquidShapeState {
  /** Center x of the shape, CSS px relative to the LiquidRoot origin. */
  x: number;
  /** Center y of the shape, CSS px relative to the LiquidRoot origin. */
  y: number;
  /** Half-width in CSS px. */
  halfWidth: number;
  /** Half-height in CSS px. */
  halfHeight: number;
  /** Corner radius in CSS px (from material). */
  radius: number;
  /** Superellipse roundness (from material). */
  roundness: number;
  /** Resolved material for this shape. */
  material: LiquidMaterial;
  /** Scale factor for press/hover deformation (1 = rest). */
  scale: number;
  /** Pointer-following offset in px (x). */
  offsetX: number;
  /** Pointer-following offset in px (y). */
  offsetY: number;
  /** Optical depth layer index for multi-pass rendering. */
  layer?: number;
}

/** Which GPU backend the engine selected. */
export type LiquidBackendKind = 'webgl' | 'webgpu' | 'css';

/** Information about the active renderer, exposed via context. */
export interface LiquidBackendInfo {
  kind: LiquidBackendKind;
  /** True when a real GPU pipeline is running (not the CSS fallback). */
  gpu: boolean;
  /** Human-readable reason when GPU is unavailable. */
  reason?: string;
}

/** Engine contract for resolving materials from user input. */
export type LiquidGlassInput = LiquidPresetName | LiquidMaterialOverride | undefined;
