import { describe, it, expect, vi } from 'vitest';
import { ShapeRegistry } from './shapes';
import { computeGaussianKernelByRadius } from './LiquidEngine';
import { ScalarSpring, springSettled } from './interaction';
import { Scheduler } from './scheduler';
import { LIQUID_PRESETS } from '../materials/presets';

describe('computeGaussianKernelByRadius', () => {
  it('produces a normalized kernel (weights sum to 1)', () => {
    for (const radius of [1, 4, 12, 40]) {
      const kernel = computeGaussianKernelByRadius(radius);
      const sum = kernel.reduce((acc, w, i) => acc + (i === 0 ? w : w * 2), 0);
      expect(sum).toBeCloseTo(1, 5);
    }
  });

  it('clamps radius into the engine-supported range', () => {
    // Must not throw and must stay normalized for extreme inputs.
    const kernel = computeGaussianKernelByRadius(10000);
    const sum = kernel.reduce((acc, w, i) => acc + (i === 0 ? w : w * 2), 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('kernel[0] is the largest weight (Gaussian profile)', () => {
    const kernel = computeGaussianKernelByRadius(8);
    for (let i = 1; i < kernel.length; i++) {
      expect(kernel[0]).toBeGreaterThanOrEqual(kernel[i]);
    }
  });
});

describe('ShapeRegistry', () => {
  const material = { ...LIQUID_PRESETS.strong };

  it('registers and unregisters shapes with unique ids', () => {
    const reg = new ShapeRegistry();
    const a = reg.register(material);
    const b = reg.register(material);
    expect(a).not.toBe(b);
    expect(reg.size).toBe(2);
    reg.unregister(a);
    expect(reg.size).toBe(1);
  });

  it('packs visible shapes into the vec4 uniform arrays', () => {
    const reg = new ShapeRegistry();
    const id = reg.register(material);
    reg.update(id, {
      x: 100,
      y: 50,
      halfWidth: 40,
      halfHeight: 20,
      radius: 12,
      roundness: 5,
      material,
      scale: 1,
      offsetX: 3,
      offsetY: -2,
    });
    reg.pack();

    const p = reg.packed;
    expect(p.count).toBe(1);
    // shapesA row 0: center + half-size (CSS px)
    expect(p.shapesA[0]).toBe(100);
    expect(p.shapesA[1]).toBe(50);
    expect(p.shapesA[2]).toBe(40);
    expect(p.shapesA[3]).toBe(20);
    // shapesB row 0: radius, roundness, scale, offsetX (Float32Array packing)
    expect(p.shapesB[0]).toBe(12);
    expect(p.shapesB[1]).toBe(5);
    expect(p.shapesB[2]).toBe(1);
    expect(p.shapesB[3]).toBeCloseTo(3, 5);
    // shapesC row 0: offsetY, blurEdge, shadowExpand, shadowFactor
    expect(p.shapesC[0]).toBe(-2);
    expect(p.shapesC[1]).toBe(1); // borderBlend default true in strong
    expect(p.shapesC[2]).toBe(material.shadowExpand);
    // shapeM0: thickness, refraction, refractionDistance, dispersion
    expect(p.shapeM0[0]).toBe(material.thickness);
    expect(p.shapeM0[1]).toBeCloseTo(material.refraction, 5);
    // tint is normalized to 0-1
    expect(p.shapeTint[0]).toBeCloseTo(material.tint.r / 255, 5);
  });

  it('skips invisible shapes when packing', () => {
    const reg = new ShapeRegistry();
    const id = reg.register(material);
    reg.setVisible(id, false);
    reg.pack();
    expect(reg.packed.count).toBe(0);
  });

  it('caps packing at MAX_SHAPES (48) and reports dropped shapes', () => {
    const reg = new ShapeRegistry();
    for (let i = 0; i < 56; i++) reg.register(material);
    reg.pack();
    expect(reg.packed.count).toBe(48);
    expect(reg.droppedInLastPack).toBe(8);
    // Pack again unchanged: the drop count is stable, not cumulative.
    reg.pack();
    expect(reg.droppedInLastPack).toBe(8);
  });

  it('tracks dirty state', () => {
    const reg = new ShapeRegistry();
    const id = reg.register(material);
    expect(reg.isDirty()).toBe(true);
    reg.pack();
    reg.clearDirty();
    expect(reg.isDirty()).toBe(false);
    reg.update(id, {
      x: 0, y: 0, halfWidth: 10, halfHeight: 10, radius: 4, roundness: 5,
      material, scale: 1, offsetX: 0, offsetY: 0,
    });
    expect(reg.isDirty()).toBe(true);
  });
});

describe('ScalarSpring', () => {
  it('settles at the target value', () => {
    const s = new ScalarSpring({ value: 0, target: 1, stiffness: 300, damping: 22 });
    for (let i = 0; i < 600; i++) s.step(1 / 60);
    expect(s.value).toBeCloseTo(1, 2);
  });

  it('overshoots with low damping (bounce)', () => {
    const s = new ScalarSpring({ value: 0, target: 1, stiffness: 420, damping: 8 });
    let maxOvershoot = 0;
    for (let i = 0; i < 120; i++) {
      s.step(1 / 60);
      maxOvershoot = Math.max(maxOvershoot, s.value);
    }
    expect(maxOvershoot).toBeGreaterThan(1.01);
  });

  it('is a critical-ish spring with strong damping', () => {
    const s = new ScalarSpring({ value: 0, target: 1, stiffness: 300, damping: 60 });
    let max = 0;
    for (let i = 0; i < 600; i++) {
      s.step(1 / 60);
      max = Math.max(max, s.value);
    }
    expect(max).toBeLessThan(1.02);
  });
});

describe('springSettled', () => {
  it('detects a settled spring', () => {
    expect(
      springSettled({ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 5, y: 5 }),
    ).toBe(true);
  });

  it('detects motion', () => {
    expect(
      springSettled({ x: 3, y: 0 }, { x: 5, y: 5 }, { x: 5, y: 5 }),
    ).toBe(false);
  });
});

describe('Scheduler', () => {
  it('runs callbacks on rAF and stops when the last one is removed', async () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    const cafSpy = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cafSpy);

    const sched = new Scheduler();
    const calls: number[] = [];
    const remove = sched.add((dt) => calls.push(dt));

    // Fire a frame manually (rAF is mocked).
    for (const cb of rafCallbacks.splice(0)) cb(16);

    expect(calls.length).toBeGreaterThan(0);
    expect(sched.isRunning).toBe(true);

    remove();
    expect(sched.isRunning).toBe(false);
    expect(cafSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
