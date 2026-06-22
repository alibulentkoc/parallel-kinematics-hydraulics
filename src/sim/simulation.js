/**
 * @file simulation.js
 * Fixed-timestep simulation orchestrator — the "physics engine" that closes the
 * loop and stays completely separate from rendering (requirement #4, #5).
 *
 * State: per-leg stroke s_i ∈ [0, stroke_i]. Everything else is derived each
 * step. The plant update is:
 *
 *   target → IK → L_cmd                         (commanded lengths)
 *   stroke → L_act → FK → poseAct               (actual pose estimate)
 *   controller(L_cmd, L_act, J) → u             (spool commands)
 *   hydraulics(u, J) → ṡ                         (cylinder velocities)
 *   s += ṡ·dt, clamped to stroke ends           (integration + stroke limit)
 *
 * step(dt) advances exactly one physics tick and returns a telemetry snapshot.
 * advance(realDt) runs an accumulator of fixed dt sub-steps so the render layer
 * (Module 7) can call it once per animation frame without changing the physics.
 */

import * as M from "../math/index.js";

export class Simulation {
  /**
   * @param {object} parts
   * @param {object} parts.kin   kinematics strategy
   * @param {object} parts.hyd   hydraulic engine
   * @param {object} parts.ctrl  controller
   * @param {object} parts.gen   target generator
   * @param {number} [parts.dt=1e-3] fixed physics timestep [s]
   */
  constructor({ kin, hyd, ctrl, gen, dt = 1e-3 }) {
    this.kin = kin;
    this.hyd = hyd;
    this.ctrl = ctrl;
    this.gen = gen;
    this.dt = dt;
    this.n = kin.nLegs;
    this.dof = kin.dof;
    this.faultEngine = null; // set by Module 5; if present, called each step
    this.valveOverride = new Array(this.n).fill(null); // per-leg spool override (fault injection)
    this.ctrl.setActuatorRef(hyd.nominalVelocities());
    this.acc = 0;
    this.reset();
  }

  /** Re-home the plant and clear all controller/valve state. */
  reset() {
    const home = this.kin.home();
    const Lh = this.kin.ik(home).L;
    this.s = Lh.map((Li, i) =>
      M.clamp(Li - this.kin.cylinders[i].Lmin, 0, this.kin.cylinders[i].stroke)
    );
    this.t = 0;
    this.acc = 0;
    this.lastPose = { ...home };
    this.ctrl.reset();
    this.hyd.reset();
    this.gen.reset(home);
    if (this.faultEngine && this.faultEngine.reset) this.faultEngine.reset();
    this.last = this._snapshot({});
    return this.last;
  }

  setTarget(pose) {
    this.gen.setTarget(pose);
  }
  setMode(mode, params) {
    this.gen.setMode(mode, params);
  }

  _Lact() {
    return this.s.map((si, i) => this.kin.cylinders[i].Lmin + si);
  }

  /** Advance exactly one fixed timestep. @returns {object} snapshot */
  step(dt = this.dt) {
    const tg = this.gen.update(this.t, dt);
    const targetPose = tg.pose;
    const Lcmd = this.kin.ik(targetPose).L;
    const Lact = this._Lact();

    const fk = this.kin.fk(Lact, { seed: this.lastPose });
    const poseAct = fk.ok ? fk.pose : this.lastPose;
    this.lastPose = poseAct;
    const J = this.kin.jacobian(poseAct);

    // Feedforward: commanded length-rate from target pose velocity through J(target).
    let Lcmddot = null;
    if (tg.poseDot) {
      const Jt = this.kin.jacobian(targetPose);
      Lcmddot = M.matVec(Jt, this._vec(tg.poseDot));
    }

    const co = this.ctrl.update({ Lcmd, Lact, Lcmddot, targetPose, poseAct, J, targetVel: tg.poseDot, dt });
    // Fault injection: a stuck/overridden valve replaces the controller command.
    const u = co.u.map((ui, i) => (this.valveOverride[i] == null ? ui : this.valveOverride[i]));
    const hy = this.hyd.solve({ u, jacobian: J, dt });

    // Integrate stroke with end-stop clamping; detect stroke-end pushing.
    const strokeEnd = new Array(this.n).fill(false);
    for (let i = 0; i < this.n; i++) {
      const stroke = this.kin.cylinders[i].stroke;
      const ns = this.s[i] + hy.sDot[i] * dt;
      if (ns <= 0 && hy.sDot[i] < 0) strokeEnd[i] = true;
      if (ns >= stroke && hy.sDot[i] > 0) strokeEnd[i] = true;
      this.s[i] = M.clamp(ns, 0, stroke);
    }

    this.t += dt;
    this.last = this._snapshot({ targetPose, Lcmd, co, hy, strokeEnd });
    if (this.faultEngine) this.last.faults = this.faultEngine.evaluate(this.last);
    return this.last;
  }

  /**
   * Render-frame entry point: integrate `realDt` of wall-clock time in fixed
   * sub-steps so physics stays deterministic regardless of frame rate.
   * @param {number} realDt seconds since last frame
   * @returns {object} most recent snapshot
   */
  advance(realDt) {
    this.acc += Math.min(realDt, 0.25); // clamp to avoid spiral-of-death after a stall
    let last = this.last;
    while (this.acc >= this.dt) {
      last = this.step(this.dt);
      this.acc -= this.dt;
    }
    return last;
  }

  _vec(p) {
    return this.dof === 3 ? [p.x, p.y, p.theta] : [p.x, p.y];
  }
  _poseErr(a, b) {
    const va = this._vec(a);
    const vb = this._vec(b);
    return va.map((x, i) => x - vb[i]);
  }

  /** Assemble the unified telemetry snapshot consumed by logger/viz/grader. */
  _snapshot(d) {
    const targetPose = d.targetPose ?? this.gen.setpoint;
    const Lact = this._Lact();
    const fk = this.kin.fk(Lact, { seed: this.lastPose });
    const poseAct = fk.ok ? fk.pose : this.lastPose;
    const e = this._poseErr(targetPose, poseAct);
    const reach = this.kin.reachable(targetPose);
    const z = new Array(this.n).fill(0);
    return {
      t: this.t,
      dof: this.dof,
      nLegs: this.n,
      mode: this.gen.mode,
      targetPose: { ...targetPose },
      poseAct: { ...poseAct },
      poseErr: e,
      poseErrNorm: M.norm(e),
      Lcmd: d.Lcmd ?? this.kin.ik(targetPose).L,
      Lact,
      e: d.co ? d.co.e : z.slice(),
      u: d.co ? d.co.u : z.slice(),
      uEff: d.hy ? d.hy.uEff : z.slice(),
      Q: d.hy ? d.hy.Q : z.slice(),
      sDot: d.hy ? d.hy.sDot : z.slice(),
      pLoad: d.hy ? d.hy.pLoad : z.slice(),
      force: d.hy ? d.hy.force : z.slice(),
      stroke: this.s.slice(),
      manip: this.kin.manipulability(poseAct),
      pumpScale: d.hy ? d.hy.pumpScale : 1,
      pumpSaturated: d.hy ? d.hy.pumpSaturated : false,
      strokeEnd: d.strokeEnd ?? new Array(this.n).fill(false),
      fkOk: fk.ok,
      reachable: reach,
      hydraulicFlags: d.hy ? d.hy.flags : null,
    };
  }
}
