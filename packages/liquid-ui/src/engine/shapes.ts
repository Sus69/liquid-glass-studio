import type { LiquidMaterial, LiquidShapeState } from '../types';

/**
 * Maximum number of shapes rendered per frame. Must match MAX_SHAPES in
 * shaders/lib/sdf.glsl and the WGSL uniform structs; sized so a busy page
 * (27+ surfaces) never silently drops glass. WebGL2 guarantees at least 224
 * fragment uniform vectors; 64-byte header + 8×32 vec4s ≈ 260 vectors — the
 * engine validates this against MAX_FRAGMENT_UNIFORM_VECTORS at backend init
 * and logs loudly (never silently) if a device can't fit it.
 */
export const MAX_SHAPES = 48;

/**
 * Shape registry: DOM components register/unregister their geometry here and
 * the engine packs it into the uniform arrays each frame.
 */
export interface RegisteredShape {
  id: number;
  /** Latest geometry + material pushed by the owning component. */
  state: LiquidShapeState;
  /** Visibility from IntersectionObserver. Invisible shapes are skipped. */
  visible: boolean;
  /** Marked when the state changed since the last packed frame. */
  dirty: boolean;
  /** The DOM element that owns this shape (for per-frame re-measurement). */
  element: HTMLElement | null;
}

let nextShapeId = 1;

export class ShapeRegistry {
  private shapes = new Map<number, RegisteredShape>();
  /** Packed uniform arrays, uploaded to the GPU as vec4 rows. */
  readonly packed = {
    shapesA: new Float32Array(MAX_SHAPES * 4), // center.xy, halfSize.xy (CSS px)
    shapesB: new Float32Array(MAX_SHAPES * 4), // radius, roundness, scale, offsetX
    shapesC: new Float32Array(MAX_SHAPES * 4), // offsetY, blurEdge, shadowExpand, shadowFactor
    shapeM0: new Float32Array(MAX_SHAPES * 4), // thickness, refFactor, refDistance, dispersion
    shapeM1: new Float32Array(MAX_SHAPES * 4), // fresnel, fresnelRange, fresnelHardness, glare
    shapeM2: new Float32Array(MAX_SHAPES * 4), // glareRange, glareHardness, glareConv, glareOpp
    shapeM3: new Float32Array(MAX_SHAPES * 4), // glareAngle(rad), shadowPosX, shadowPosY, mergeRate
    shapeTint: new Float32Array(MAX_SHAPES * 4), // tint rgba (0-1)
    count: 0,
  };

  /** Shapes dropped by the last pack() because they exceeded MAX_SHAPES. */
  droppedInLastPack = 0;

  register(material: LiquidMaterial): number {
    const id = nextShapeId++;
    this.shapes.set(id, {
      id,
      state: {
        x: 0,
        y: 0,
        halfWidth: 0,
        halfHeight: 0,
        radius: material.radius,
        roundness: material.roundness,
        material,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      visible: true,
      dirty: true,
      element: null,
    });
    return id;
  }

  unregister(id: number): void {
    this.shapes.delete(id);
  }

  /** Attach (or re-attach) the owning DOM element for per-frame measurement. */
  setElement(id: number, el: HTMLElement | null): void {
    const shape = this.shapes.get(id);
    if (!shape || shape.element === el) return;
    shape.element = el;
    shape.dirty = true;
  }

  get(id: number): RegisteredShape | undefined {
    return this.shapes.get(id);
  }

  update(id: number, state: LiquidShapeState): void {
    const shape = this.shapes.get(id);
    if (!shape) return;
    shape.state = state;
    shape.dirty = true;
  }

  setVisible(id: number, visible: boolean): void {
    const shape = this.shapes.get(id);
    if (!shape) return;
    if (shape.visible !== visible) {
      shape.visible = visible;
      shape.dirty = true;
    }
  }

  list(): RegisteredShape[] {
    return [...this.shapes.values()];
  }

  /** Any shape has pending changes? */
  isDirty(): boolean {
    for (const s of this.shapes.values()) {
      if (s.dirty) return true;
    }
    return false;
  }

  clearDirty(): void {
    for (const s of this.shapes.values()) {
      s.dirty = false;
    }
  }

  get size(): number {
    return this.shapes.size;
  }

  /**
   * Pack visible shapes into the uniform arrays (max MAX_SHAPES). Nearest-last-wins
   * is avoided: the shader picks the nearest shape per pixel instead.
   */
  pack(): void {
    const p = this.packed;
    let n = 0;

    // Count visible first so dropped shapes can be reported loudly.
    let visibleTotal = 0;
    for (const shape of this.shapes.values()) {
      if (shape.visible) visibleTotal++;
    }
    this.droppedInLastPack = Math.max(0, visibleTotal - MAX_SHAPES);

    for (const shape of this.shapes.values()) {
      if (!shape.visible) continue;
      if (n >= MAX_SHAPES) break;

      const s = shape.state;
      const row = n * 4;

      p.shapesA[row] = s.x;
      p.shapesA[row + 1] = s.y;
      p.shapesA[row + 2] = s.halfWidth;
      p.shapesA[row + 3] = s.halfHeight;

      p.shapesB[row] = Math.max(s.radius, 0.01);
      p.shapesB[row + 1] = s.roundness;
      p.shapesB[row + 2] = s.scale;
      p.shapesB[row + 3] = s.offsetX;

      p.shapesC[row] = s.offsetY;
      p.shapesC[row + 1] = s.material.borderBlend ? 1 : 0;
      p.shapesC[row + 2] = s.material.shadowExpand;
      p.shapesC[row + 3] = s.material.shadow;

      p.shapeM0[row] = s.material.thickness;
      p.shapeM0[row + 1] = s.material.refraction;
      p.shapeM0[row + 2] = s.material.refractionDistance;
      p.shapeM0[row + 3] = s.material.dispersion;

      p.shapeM1[row] = s.material.fresnel;
      p.shapeM1[row + 1] = s.material.fresnelRange;
      p.shapeM1[row + 2] = s.material.fresnelHardness;
      p.shapeM1[row + 3] = s.material.glare;

      p.shapeM2[row] = s.material.glareRange;
      p.shapeM2[row + 1] = s.material.glareHardness;
      p.shapeM2[row + 2] = s.material.glareConvergence;
      p.shapeM2[row + 3] = s.material.glareOppositeFactor;

      p.shapeM3[row] = (s.material.glareAngle * Math.PI) / 180;
      p.shapeM3[row + 1] = s.material.shadowOffset.x;
      p.shapeM3[row + 2] = s.material.shadowOffset.y;
      p.shapeM3[row + 3] = s.material.merge;

      p.shapeTint[row] = s.material.tint.r / 255;
      p.shapeTint[row + 1] = s.material.tint.g / 255;
      p.shapeTint[row + 2] = s.material.tint.b / 255;
      p.shapeTint[row + 3] = s.material.tint.a;

      n++;
    }

    p.count = n;
  }
}
