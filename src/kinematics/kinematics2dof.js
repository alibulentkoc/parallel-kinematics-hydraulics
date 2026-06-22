/**
 * @file kinematics2dof.js
 * Planar 2-RPR point positioner. Two cylinders from symmetric base anchors
 * B1=(-b,0), B2=(+b,0) to a single platform node P=(x,y), working region y>0.
 *
 * Closed-form everything (see design spec §5.1–5.4):
 *   IK   L1=|P-B1|, L2=|P-B2|
 *   FK   x=(L1²-L2²)/4b ; y=+√(L1²-(x+b)²)  (upper assembly mode)
 *   J    rows are the unit leg vectors û_i  (L̇ = J·Ṗ)
 *   det(J) = 2by/(L1 L2)  → manipulability collapses as y→0.
 */

import * as M from "../math/index.js";
import { KinematicsBase } from "./kinematics-base.js";

export class Kinematics2DOF extends KinematicsBase {
  /** @param {object} geometry */
  constructor(geometry) {
    super(geometry, 2, 2);
    this.b = (geometry.baseSpacing ?? 1.2) / 2;
    /** @type {number[][]} base anchors */
    this.anchors = [
      [-this.b, 0],
      [this.b, 0],
    ];
  }

  /** @param {{x:number,y:number}} pose @returns {{L:number[]}} */
  ik(pose) {
    const { x, y } = pose;
    const b = this.b;
    return { L: [Math.hypot(x + b, y), Math.hypot(x - b, y)] };
  }

  /**
   * Forward kinematics. Guards against non-intersecting circles so the sim
   * never evaluates √(negative) and never emits NaN to the renderer.
   * @param {number[]} L
   * @returns {{pose:({x:number,y:number}|null), ok:boolean, reasons:string[]}}
   */
  fk(L) {
    const b = this.b;
    const [L1, L2] = L;
    const x = (L1 * L1 - L2 * L2) / (4 * b);
    const rad = L1 * L1 - (x + b) * (x + b);
    if (rad < 0) return { pose: null, ok: false, reasons: ["no-intersection"] };
    const y = Math.sqrt(rad); // upper assembly mode (y >= 0)
    return { pose: { x, y }, ok: true, reasons: [] };
  }

  /** @param {{x:number,y:number}} pose @returns {number[][]} 2x2 Jacobian (L̇ = J·Ṗ) */
  jacobian(pose) {
    const { x, y } = pose;
    const b = this.b;
    const r1 = [x + b, y];
    const r2 = [x - b, y];
    const L1 = Math.hypot(r1[0], r1[1]);
    const L2 = Math.hypot(r2[0], r2[1]);
    // Rows are unit leg vectors. Guard against the degenerate L→0 (P on anchor).
    const u1 = L1 < 1e-12 ? [0, 0] : [r1[0] / L1, r1[1] / L1];
    const u2 = L2 < 1e-12 ? [0, 0] : [r2[0] / L2, r2[1] / L2];
    return [u1, u2];
  }

  /** Closed-form manipulability |det J| = |2by/(L1 L2)|. Never throws. */
  manipulability(pose) {
    const { x, y } = pose;
    const b = this.b;
    const L1 = Math.hypot(x + b, y);
    const L2 = Math.hypot(x - b, y);
    if (L1 < 1e-12 || L2 < 1e-12) return 0;
    return Math.abs((2 * b * y) / (L1 * L2));
  }

  /** Per-leg render/telemetry geometry. @param {{x:number,y:number}} pose */
  legs(pose) {
    const P = [pose.x, pose.y];
    return this.anchors.map((B) => {
      const r = M.sub(P, B);
      return {
        anchor: B.slice(),
        tip: P.slice(),
        unit: M.normalize(r),
        length: M.norm(r),
      };
    });
  }

  /** Centered home pose at mid-stroke. @returns {{x:number,y:number}} */
  home() {
    if (this.geometry.home) return this.geometry.home;
    const { Lmin, Lmax } = this.lengthLimits(0);
    const Lmid = (Lmin + Lmax) / 2;
    const y = Math.sqrt(Math.max(1e-4, Lmid * Lmid - this.b * this.b));
    return { x: 0, y };
  }
}
