/**
 * @file controller.js
 * Closed-loop controller. Two modes share one interface:
 *
 *   'jointspace' (default): decentralized PID per cylinder on length error
 *      e_i = L_cmd_i − L_act_i. This mirrors the realistic bench wiring (one
 *      loop per valve) and is what the original demo's proportional gain did.
 *
 *   'taskspace': proportional outer loop on pose error, mapped to leg-rate
 *      commands through the Jacobian (L̇_des = J·Kp_task·e_pose), then converted
 *      to spool commands via the nominal velocity scale. Because the plant
 *      integrates flow, this P-only outer loop has zero steady-state error.
 *
 * Robustness details that matter pedagogically:
 *   - Derivative acts on the MEASUREMENT (−Kd·dL_act/dt), not the error, to
 *     avoid derivative kick on step setpoints.
 *   - Integral uses CONDITIONAL anti-windup + clamping: it stops integrating
 *     while the output is saturated and the error would wind it further in.
 *   - Output is clamped to [-1,1] (control saturation); the rest of the
 *     saturation chain (valve model, orifice, pump) lives in the hydraulics.
 */

import * as M from "../math/index.js";

export class Controller {
  /**
   * @param {2|3} dof
   * @param {number} nLegs
   * @param {object} [cfg]
   */
  constructor(dof, nLegs, cfg = {}) {
    this.dof = dof;
    this.n = nLegs;
    this.setConfig(cfg);
    this.vMax = new Array(nLegs).fill(0.2); // overwritten via setActuatorRef
    this.reset();
  }

  /** @param {object} cfg */
  setConfig(cfg = {}) {
    this.mode = cfg.mode ?? "jointspace";
    this.Kp = cfg.Kp ?? 30;
    this.Ki = cfg.Ki ?? 0;
    this.Kd = cfg.Kd ?? 0;
    this.enableFF = cfg.enableFF ?? false;
    this.KpTask = cfg.KpTask ?? 8;
    this.integLimit = cfg.integLimit ?? 0.5;
  }

  /** Provide per-leg nominal max velocities (from hydraulics) for FF/task-space scaling. */
  setActuatorRef(vMax) {
    this.vMax = vMax.slice();
  }

  /** Clear integrator + derivative memory. */
  reset() {
    this.integ = new Array(this.n).fill(0);
    this.LactPrev = null;
  }

  /**
   * @param {object} args
   * @param {number[]} args.Lcmd      commanded lengths (IK of target)
   * @param {number[]} args.Lact      actual lengths (from stroke state)
   * @param {number[]} [args.Lcmddot] commanded length rate (FF)
   * @param {object}   [args.targetPose] (task-space)
   * @param {object}   [args.poseAct]    (task-space)
   * @param {number[][]} [args.J]        Jacobian (task-space)
   * @param {object}   [args.targetVel]  feedforward pose velocity (task-space)
   * @param {number}   args.dt
   * @returns {{u:number[], e:number[], integ:number[], saturated:boolean[]}}
   */
  update(args) {
    return this.mode === "taskspace" ? this._taskspace(args) : this._jointspace(args);
  }

  _jointspace({ Lcmd, Lact, Lcmddot = null, dt }) {
    const n = this.n;
    const u = new Array(n);
    const e = new Array(n);
    const saturated = new Array(n);
    if (!this.LactPrev) this.LactPrev = Lact.slice();
    for (let i = 0; i < n; i++) {
      const err = Lcmd[i] - Lact[i];
      e[i] = err;
      const dMeas = (Lact[i] - this.LactPrev[i]) / dt; // derivative on measurement
      const P = this.Kp * err;
      const D = -this.Kd * dMeas;
      const I = this.Ki * this.integ[i];
      const FF = this.enableFF && Lcmddot ? Lcmddot[i] / (this.vMax[i] || 1) : 0;
      const uUnsat = P + I + D + FF;
      const uSat = M.clamp(uUnsat, -1, 1);
      const isSat = uUnsat !== uSat;
      saturated[i] = isSat;
      // Conditional anti-windup: integrate unless saturated AND error winds further in.
      if (!isSat || Math.sign(err) !== Math.sign(uUnsat)) {
        this.integ[i] = M.clamp(this.integ[i] + err * dt, -this.integLimit, this.integLimit);
      }
      u[i] = uSat;
    }
    this.LactPrev = Lact.slice();
    return { u, e, integ: this.integ.slice(), saturated };
  }

  _taskspace({ Lcmd, Lact, targetPose, poseAct, J, targetVel = null, dt }) {
    const n = this.n;
    const ev = this._poseErr(targetPose, poseAct); // size dof
    const vdes = ev.map((x) => this.KpTask * x);
    if (targetVel) {
      const tv = this._vec(targetVel);
      for (let k = 0; k < this.dof; k++) vdes[k] += tv[k];
    }
    const Ldot = M.matVec(J, vdes); // desired leg rates
    const u = new Array(n);
    const e = new Array(n);
    const saturated = new Array(n);
    for (let i = 0; i < n; i++) {
      e[i] = Lcmd[i] - Lact[i];
      const raw = Ldot[i] / (this.vMax[i] || 1);
      u[i] = M.clamp(raw, -1, 1);
      saturated[i] = raw !== u[i];
    }
    return { u, e, integ: this.integ.slice(), saturated };
  }

  _vec(p) {
    return this.dof === 3 ? [p.x, p.y, p.theta] : [p.x, p.y];
  }
  _poseErr(a, b) {
    const va = this._vec(a);
    const vb = this._vec(b);
    return va.map((x, i) => x - vb[i]);
  }
}

/** Baseline controller config. */
export const defaultController = {
  mode: "jointspace",
  Kp: 30,
  Ki: 0,
  Kd: 0,
  enableFF: false,
  KpTask: 8,
  integLimit: 0.5,
};
