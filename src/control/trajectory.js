/**
 * @file trajectory.js
 * Target (setpoint) generator. Produces a commanded pose — and its velocity for
 * feedforward — as a function of time, for each input mode:
 *
 *   'hold' / 'step' : constant setpoint (a step is just setTarget()).
 *   'ramp'          : rate-limited slew from the current commanded pose toward
 *                     the setpoint (well-posed motion students can track).
 *   'circle'        : parametric circle (center, radius, ω).
 *   'line'          : raised-cosine oscillation between A and B (smooth ends).
 *   'figure8'       : Lissajous figure-eight.
 *
 * Pose objects are dof-aware: {x,y} (2-DOF) or {x,y,theta} (3-DOF).
 */

export class TargetGenerator {
  /** @param {2|3} dof @param {object} home */
  constructor(dof, home) {
    this.dof = dof;
    this.home = { ...home };
    this.reset(home);
  }

  reset(home = this.home) {
    this.setpoint = { ...home };
    this.cmd = { ...home };
    this.mode = "hold";
    this.params = {};
    this.localT = 0;
  }

  /** Set the steady setpoint (also the target the ramp slews toward). */
  setTarget(pose) {
    this.setpoint = { ...this.setpoint, ...pose };
    if (this.mode === "hold" || this.mode === "step")
      this.cmd = { ...this.cmd, ...pose };
  }

  /** Switch input mode; params depend on mode (see file header). */
  setMode(mode, params = {}) {
    this.mode = mode;
    this.params = params;
    this.localT = 0;
    if (mode !== "ramp") this.cmd = { ...this.setpoint };
  }

  /** @returns {{pose:object, poseDot:object}} */
  update(t, dt) {
    this.localT += dt;
    switch (this.mode) {
      case "ramp":
        return this._ramp(dt);
      case "circle":
        return this._circle();
      case "line":
        return this._line();
      case "figure8":
        return this._fig8();
      case "step":
      case "hold":
      default:
        return { pose: { ...this.setpoint }, poseDot: this._zero() };
    }
  }

  _zero() {
    return this.dof === 3 ? { x: 0, y: 0, theta: 0 } : { x: 0, y: 0 };
  }
  _keys() {
    return this.dof === 3 ? ["x", "y", "theta"] : ["x", "y"];
  }

  _ramp(dt) {
    const rate = this.params.rate ?? 0.3; // m/s and rad/s
    const pose = { ...this.cmd };
    const dot = this._zero();
    for (const k of this._keys()) {
      const d = this.setpoint[k] - this.cmd[k];
      const step = Math.sign(d) * Math.min(Math.abs(d), rate * dt);
      pose[k] = this.cmd[k] + step;
      dot[k] = dt > 0 ? step / dt : 0;
    }
    this.cmd = pose;
    return { pose: { ...pose }, poseDot: dot };
  }

  _circle() {
    const { cx = 0, cy = 0.55, r = 0.15, omega = 1.0, theta = 0 } = this.params;
    const t = this.localT;
    const x = cx + r * Math.cos(omega * t);
    const y = cy + r * Math.sin(omega * t);
    const dx = -r * omega * Math.sin(omega * t);
    const dy = r * omega * Math.cos(omega * t);
    const pose = this.dof === 3 ? { x, y, theta } : { x, y };
    const poseDot = this.dof === 3 ? { x: dx, y: dy, theta: 0 } : { x: dx, y: dy };
    this.cmd = pose;
    return { pose, poseDot };
  }

  _line() {
    const { ax = -0.2, ay = 0.5, bx = 0.2, by = 0.5, omega = 1.0, theta = 0 } = this.params;
    const t = this.localT;
    const s = 0.5 * (1 - Math.cos(omega * t)); // 0 → 1 → 0, smooth ends
    const sdot = 0.5 * omega * Math.sin(omega * t);
    const x = ax + (bx - ax) * s;
    const y = ay + (by - ay) * s;
    const dx = (bx - ax) * sdot;
    const dy = (by - ay) * sdot;
    const pose = this.dof === 3 ? { x, y, theta } : { x, y };
    const poseDot = this.dof === 3 ? { x: dx, y: dy, theta: 0 } : { x: dx, y: dy };
    this.cmd = pose;
    return { pose, poseDot };
  }

  _fig8() {
    const { cx = 0, cy = 0.55, ax = 0.18, ay = 0.12, omega = 1.0, theta = 0 } = this.params;
    const t = this.localT;
    const x = cx + ax * Math.sin(omega * t);
    const y = cy + ay * Math.sin(2 * omega * t);
    const dx = ax * omega * Math.cos(omega * t);
    const dy = 2 * ay * omega * Math.cos(2 * omega * t);
    const pose = this.dof === 3 ? { x, y, theta } : { x, y };
    const poseDot = this.dof === 3 ? { x: dx, y: dy, theta: 0 } : { x: dx, y: dy };
    this.cmd = pose;
    return { pose, poseDot };
  }
}
