/**
 * @file kinematics3dof.js
 * Planar 3-RPR rigid platform: pose q=(x,y,θ). Three cylinders connect base
 * anchors B_i to platform attachment points p_i (platform frame). World
 * attachment P_i = [x;y] + R(θ)·p_i.
 *
 * IK is closed form. FK has no general closed form (up to 6 assembly modes),
 * so it is solved by Newton–Raphson on the length residuals, warm-started from
 * the previous pose. The Newton Jacobian IS the kinematic Jacobian, since
 * dL_i/dq is exactly row i of J. See design spec §5 and §12.
 *
 * Jacobian row i = [ û_iˣ , û_iʸ , û_i · (dR/dθ · p_i) ]  with dR/dθ = E·R.
 */

import * as M from "../math/index.js";
import { KinematicsBase } from "./kinematics-base.js";

export class Kinematics3DOF extends KinematicsBase {
  /** @param {object} geometry */
  constructor(geometry) {
    super(geometry, 3, 3);
    this.anchors = (geometry.anchors ?? [
      [-0.8, 0],
      [0.8, 0],
      [0, 1.0],
    ]).map((a) => a.slice());
    this.attach = (geometry.attach ?? [
      [-0.12, -0.07],
      [0.12, -0.07],
      [0, 0.14],
    ]).map((a) => a.slice());
    if (this.anchors.length !== 3 || this.attach.length !== 3)
      throw new Error("3-DOF requires exactly 3 anchors and 3 attach points");
  }

  /** World-frame platform attachment points P_i = o + R(θ)p_i. */
  _worldAttach(pose) {
    const R = M.rot2(pose.theta);
    const o = [pose.x, pose.y];
    return this.attach.map((p) => M.add(o, M.matVec(R, p)));
  }

  /** @param {{x:number,y:number,theta:number}} pose @returns {{L:number[]}} */
  ik(pose) {
    const P = this._worldAttach(pose);
    return { L: P.map((Pi, i) => M.dist(Pi, this.anchors[i])) };
  }

  /** @param {{x:number,y:number,theta:number}} pose @returns {number[][]} 3x3 Jacobian */
  jacobian(pose) {
    const Rdot = M.rot2dot(pose.theta);
    const P = this._worldAttach(pose);
    const J = [];
    for (let i = 0; i < 3; i++) {
      const r = M.sub(P[i], this.anchors[i]);
      const u = M.normalize(r);
      const dPi = M.matVec(Rdot, this.attach[i]); // dP_i/dθ
      J.push([u[0], u[1], M.dot(u, dPi)]);
    }
    return J;
  }

  /** |det J| (3x3). Never throws — safe for per-frame conditioning checks. */
  manipulability(pose) {
    return Math.abs(M.det3(this.jacobian(pose)));
  }

  /**
   * Newton–Raphson forward kinematics.
   * @param {number[]} L  measured cylinder lengths
   * @param {object} [opts]
   * @param {Pose3}  [opts.seed]     warm start (default: home)
   * @param {number} [opts.tol=1e-10]
   * @param {number} [opts.maxIter=60]
   * @param {number} [opts.maxStep=0.5]  damping cap on |Δq| per iteration
   * @returns {{pose:(object|null), ok:boolean, reasons:string[], iterations:number, residual:number}}
   */
  fk(L, opts = {}) {
    const tol = opts.tol ?? 1e-10;
    const maxIter = opts.maxIter ?? 60;
    const maxStep = opts.maxStep ?? 0.5;
    let q = this._vec(opts.seed ?? this.home());
    let iterations = 0;
    let residual = Infinity;

    for (iterations = 0; iterations < maxIter; iterations++) {
      const pose = this._pose(q);
      const Lcur = this.ik(pose).L;
      const g = Lcur.map((v, i) => v - L[i]); // residual
      residual = M.norm(g);
      if (residual < tol)
        return { pose, ok: true, reasons: [], iterations, residual };

      let dq;
      try {
        dq = M.solve(this.jacobian(pose), g);
      } catch {
        return {
          pose: null,
          ok: false,
          reasons: ["singular"],
          iterations,
          residual,
        };
      }
      // Damped step improves robustness near ill-conditioned configurations.
      const sn = M.norm(dq);
      if (sn > maxStep) dq = M.scale(dq, maxStep / sn);
      q = [q[0] - dq[0], q[1] - dq[1], q[2] - dq[2]];
    }
    return {
      pose: this._pose(q),
      ok: false,
      reasons: ["no-convergence"],
      iterations,
      residual,
    };
  }

  /** Per-leg render/telemetry geometry. */
  legs(pose) {
    const P = this._worldAttach(pose);
    return this.anchors.map((B, i) => {
      const r = M.sub(P[i], B);
      return {
        anchor: B.slice(),
        tip: P[i].slice(),
        unit: M.normalize(r),
        length: M.norm(r),
      };
    });
  }

  /** Platform outline (world attach points in order) for rendering. */
  platformPolygon(pose) {
    return this._worldAttach(pose);
  }

  /** @returns {{x:number,y:number,theta:number}} */
  home() {
    return this.geometry.home ?? { x: 0, y: 0, theta: 0 };
  }

  _vec(pose) {
    return [pose.x, pose.y, pose.theta];
  }
  _pose(v) {
    return { x: v[0], y: v[1], theta: v[2] };
  }
}
