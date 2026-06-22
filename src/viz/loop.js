/**
 * @file loop.js
 * Render loop. Bridges wall-clock animation frames to the simulation's fixed-dt
 * physics: each frame advances `speed × realDt` seconds via sim.advance() (which
 * sub-steps at the fixed dt internally), then calls onRender(snapshot). Physics
 * stays deterministic and frame-rate independent (requirements #4, #5).
 *
 * tick(realDt) is exposed so the loop is testable without requestAnimationFrame.
 */

export class RenderLoop {
  /**
   * @param {object} sim Simulation
   * @param {(snap:object)=>void} onRender
   * @param {object} [opts]
   * @param {number} [opts.speed=1] simulation speed multiplier
   */
  constructor(sim, onRender, { speed = 1 } = {}) {
    this.sim = sim;
    this.onRender = onRender;
    this.speed = speed;
    this.running = false;
    this._raf = null;
    this._last = 0;
  }

  /** Advance physics by speed×realDt and render once. Returns the snapshot. */
  tick(realDt) {
    const snap = this.sim.advance(realDt * this.speed);
    this.onRender(snap);
    return snap;
  }

  start() {
    if (this.running || typeof requestAnimationFrame === "undefined") return;
    this.running = true;
    this._last = performance.now();
    const frame = (now) => {
      if (!this.running) return;
      const realDt = (now - this._last) / 1000;
      this._last = now;
      this.tick(realDt);
      this._raf = requestAnimationFrame(frame);
    };
    this._raf = requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
    if (this._raf && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this._raf);
  }

  toggle() {
    this.running ? this.stop() : this.start();
  }
}
