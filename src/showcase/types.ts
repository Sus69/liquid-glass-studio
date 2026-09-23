import type { LiquidGlassInput, LiquidMaterialOverride, LiquidPresetName } from 'liquid-ui';

export type ShowcaseBackdropKind =
  | 'tahoe-light'
  | 'tahoe-dark'
  | 'video-fish'
  | 'text-grid'
  | 'buildings'
  | 'procedural-grid'
  | 'procedural-gradient';

export interface BackdropOption {
  id: ShowcaseBackdropKind;
  label: string;
  category: 'image' | 'video' | 'procedural';
  description: string;
  url?: string;
  proceduralIndex?: 0 | 1 | 2;
}

export interface MaterialTelemetry {
  name: LiquidPresetName | 'custom';
  thickness: number;
  refraction: number;
  refractionDistance: number;
  dispersion: number;
  fresnel: number;
  fresnelRange: number;
  fresnelHardness: number;
  glare: number;
  glareRange: number;
  glareHardness: number;
  glareConvergence: number;
  glareOppositeFactor: number;
  glareAngle: number;
  blur: number;
  borderBlend: boolean;
  tint: { r: number; g: number; b: number; a: number };
  shadow: number;
  shadowExpand: number;
  merge: number;
  radius: number;
  roundness: number;
}
