/**
 * Render-on-demand scheduler.
 *
 * The engine's rAF loop runs continuously but *skips GPU submission* when
 * nothing is in motion (no dirty shapes, springs settled, no video playing).
 * A page with five static LiquidButtons therefore costs one cheap dirty-check
 * per frame, not five render pipelines.
 */
export type FrameCallback = (dt: number) => void;

export class Scheduler {
  private rafId: number | null = null;
  private callbacks = new Set<FrameCallback>();
  private lastTime: number | null = null;
  private running = false;

  add(cb: FrameCallback): () => void {
    this.callbacks.add(cb);
    this.ensureRunning();
    return () => {
      this.callbacks.delete(cb);
      if (this.callbacks.size === 0) this.stop();
    };
  }

  private ensureRunning(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = null;
    const loop = (t: number) => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(loop);
      const dt = this.lastTime == null ? 16.7 : Math.min(t - this.lastTime, 100);
      this.lastTime = t;
      for (const cb of this.callbacks) {
        cb(dt / 1000);
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  get callbackCount(): number {
    return this.callbacks.size;
  }
}
