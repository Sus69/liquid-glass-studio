/**
 * Spring interaction — extracted from Liquid Glass Studio's App.tsx
 * mouse-spring controller. Uses @react-spring/web's frame-loop-free internal
 * Controller, updating via rAF-time deltas, and derives pointer velocity the
 * same way the Studio did (velocity → material response coupling).
 */
import { Controller } from '@react-spring/web';

export interface SpringVec2 {
  x: number;
  y: number;
}

export class PointerSpring {
  private controller: Controller<{ x: number; y: number }>;
  private lastValue: SpringVec2 = { x: 0, y: 0 };
  private lastTime: number | null = null;
  /** px/ms, same semantics as the Studio's mouseSpringSpeed. */
  speed: SpringVec2 = { x: 0, y: 0 };

  constructor() {
    this.controller = new Controller<{ x: number; y: number }>({
      x: 0,
      y: 0,
      onChange: (c) => {
        if (this.lastTime == null) {
          this.lastTime = Date.now();
          this.lastValue = c.value;
          return;
        }

        const now = Date.now();
        const dt = now - this.lastTime;
        const dx = { x: c.value.x - this.lastValue.x, y: c.value.y - this.lastValue.y };
        const speed = { x: dx.x / dt, y: dx.y / dt };

        // Guard against clock jumps (same as the Studio's 1e10 clamp).
        if (Math.abs(speed.x) > 1e10 || Math.abs(speed.y) > 1e10) {
          speed.x = 0;
          speed.y = 0;
        }

        this.speed = speed;
        this.lastValue = c.value;
        this.lastTime = now;
      },
    });
  }

  start(target: SpringVec2, config?: { stiffness?: number; damping?: number }): void {
    this.controller.start({
      to: { x: target.x, y: target.y },
      config: config ? { tension: config.stiffness ?? 170, friction: config.damping ?? 26 } : undefined,
    });
  }

  get value(): SpringVec2 {
    return this.controller.get();
  }
}

/**
 * One-dimensional critically-damped-ish spring used for press compression.
 * Integrated manually in the scheduler — no React re-renders.
 */
export class ScalarSpring {
  value: number;
  velocity = 0;
  target: number;
  stiffness: number;
  damping: number;

  constructor(opts: { value?: number; target?: number; stiffness?: number; damping?: number } = {}) {
    this.value = opts.value ?? 1;
    this.target = opts.target ?? 1;
    this.stiffness = opts.stiffness ?? 300;
    this.damping = opts.damping ?? 22;
  }

  setTarget(target: number): void {
    this.target = target;
  }

  /** Semi-implicit Euler integration. Returns true while still in motion. */
  step(dt: number): boolean {
    const delta = this.target - this.value;
    const acceleration = this.stiffness * delta - this.damping * this.velocity;
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;
    return Math.abs(delta) > 0.0001 || Math.abs(this.velocity) > 0.0001;
  }
}

/** Has this spring settled? (velocity + delta both below epsilon) */
export function springSettled(speed: SpringVec2, position: SpringVec2, target: SpringVec2, eps = 0.05): boolean {
  return (
    Math.abs(speed.x) < eps &&
    Math.abs(speed.y) < eps &&
    Math.abs(position.x - target.x) < eps &&
    Math.abs(position.y - target.y) < eps
  );
}
