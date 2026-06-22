/**
 * @file valve.js
 * Directional control valve models. ONE per cylinder; each holds its own state.
 *
 * This is the deliberate home for the simulator's stateful nonlinearities — the
 * math module is pure, so PWM phase and bang-bang hysteresis live here. The
 * model selector is the pedagogical heart of the "why is on/off positioning so
 * hard?" lesson:
 *
 *   - 'proportional' : smooth spool, optional continuous deadband. The idealized
 *                      command the demo originally assumed.
 *   - 'pwm'          : a solenoid valve PWM-modulated toward a proportional-like
 *                      average; injects switching ripple at pwmFreq.
 *   - 'bangbang'     : raw solenoid DCV with overlap (deadband) + hysteresis.
 *                      Produces the limit-cycle "hunting" students see on the bench.
 *
 * meter(u, dt) maps a controller command u ∈ [-1,1] to an effective normalized
 * spool position, also in [-1,1].
 */

import * as M from "../math/index.js";

export class Valve {
  /**
   * @param {object} [cfg]
   * @param {'proportional'|'pwm'|'bangbang'} [cfg.model='proportional']
   * @param {number} [cfg.deadband=0]    spool overlap half-width (normalized)
   * @param {number} [cfg.hysteresis=0.02] switching hysteresis band (bangbang)
   * @param {number} [cfg.pwmFreq=60]     PWM carrier frequency [Hz] (pwm)
   */
  constructor(cfg = {}) {
    this.model = cfg.model ?? "proportional";
    this.deadband = cfg.deadband ?? 0;
    this.hysteresis = cfg.hysteresis ?? 0.02;
    this.pwmFreq = cfg.pwmFreq ?? 60;
    this.reset();
  }

  /** Clear internal state (last switch state, PWM phase). */
  reset() {
    this.last = 0; // bang-bang latched output ∈ {-1,0,1}
    this.phase = 0; // PWM carrier phase ∈ [0,1)
  }

  /**
   * @param {number} u   controller command in [-1,1]
   * @param {number} dt  timestep [s] (used by PWM)
   * @returns {number}   effective normalized spool position in [-1,1]
   */
  meter(u, dt) {
    u = M.clamp(u, -1, 1);
    switch (this.model) {
      case "proportional":
        return M.deadband(u, this.deadband, { continuous: true });
      case "bangbang":
        return this._bangbang(u);
      case "pwm":
        return this._pwm(u, dt);
      default:
        return u;
    }
  }

  /** Three-state output with overlap + hysteresis (latched). */
  _bangbang(u) {
    const db = this.deadband;
    const h = this.hysteresis;
    if (u > db + h) this.last = 1;
    else if (u < -(db + h)) this.last = -1;
    else if (Math.abs(u) < db) this.last = 0;
    // else: inside the hysteresis band -> hold previous state (this is the
    // mechanism that produces limit-cycle hunting in closed loop).
    return this.last;
  }

  /** Full-open/closed switching at pwmFreq; duty = |u|. */
  _pwm(u, dt) {
    const duty = M.clamp(Math.abs(u), 0, 1);
    this.phase = (this.phase + dt * this.pwmFreq) % 1;
    const on = this.phase < duty;
    return on ? Math.sign(u) : 0;
  }
}
