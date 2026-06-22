/**
 * @file kinematics-base.js
 * Kinematics strategy interface + abstract base class.
 *
 * Lives in its own file so the concrete strategies depend ONLY on the base,
 * and the factory (kinematics.js) depends on the strategies — an acyclic graph.
 *
 * Interface (all strategies implement):
 *   dof            : 2 | 3
 *   nLegs          : number of cylinders
 *   ik(pose)       -> { L:number[] }                 required cylinder lengths
 *   fk(L, opts?)   -> { pose|null, ok, reasons, iterations?, residual? }
 *   jacobian(pose) -> Mat   (L_dot = J · pose_dot ; rows = legs, cols = pose dims)
 *   manipulability(pose) -> number  (|det J|, never throws)
 *   reachable(pose)-> { ok, reasons:string[], L:number[] }
 *   legs(pose)     -> [{ anchor, tip, unit, length }]
 *   strokeOf(L)    -> number[]
 *   lengthLimits(leg?) -> { Lmin, Lmax }
 *   home()         -> pose
 *
 * Pose: {x,y} (2-DOF) | {x,y,theta} (3-DOF, radians)
 * @typedef {{x:number,y:number}} Pose2
 * @typedef {{x:number,y:number,theta:number}} Pose3
 * @typedef {Pose2|Pose3} Pose
 */

import * as M from "../math/index.js";

/** @abstract */
export class KinematicsBase {
  /** @param {object} geometry @param {2|3} dof @param {number} nLegs */
  constructor(geometry, dof, nLegs) {
    this.dof = dof;
    this.nLegs = nLegs;
    this.geometry = geometry;
    this.requireUpperHalf = geometry.requireUpperHalf ?? true;
    this.cylinders = this._normalizeCylinders(geometry, nLegs);
  }

  _normalizeCylinders(geometry, nLegs) {
    let arr;
    if (Array.isArray(geometry.cylinders)) arr = geometry.cylinders;
    else if (geometry.cylinder)
      arr = Array.from({ length: nLegs }, () => ({ ...geometry.cylinder }));
    else arr = Array.from({ length: nLegs }, () => ({ Lclosed: 0.4, stroke: 0.6 }));
    if (arr.length !== nLegs)
      throw new Error(`geometry: ${arr.length} cylinders but nLegs=${nLegs}`);
    return arr.map((c) => ({
      Lclosed: c.Lclosed,
      stroke: c.stroke,
      Lmin: c.Lclosed,
      Lmax: c.Lclosed + c.stroke,
    }));
  }

  /** @param {number} [leg=0] @returns {{Lmin:number, Lmax:number}} */
  lengthLimits(leg = 0) {
    const c = this.cylinders[leg];
    return { Lmin: c.Lmin, Lmax: c.Lmax };
  }

  /** Stroke positions s_i ∈ [0, stroke] from absolute lengths. @param {number[]} L */
  strokeOf(L) {
    return L.map((Li, i) =>
      M.clamp(Li - this.cylinders[i].Lmin, 0, this.cylinders[i].stroke)
    );
  }

  /**
   * Stroke-bound + working-side reachability. Singularity proximity is a
   * separate (fault-engine) concern, not decided here.
   * @param {Pose} pose
   * @returns {{ok:boolean, reasons:string[], L:number[]}}
   */
  reachable(pose) {
    const { L } = this.ik(pose);
    const reasons = [];
    for (let i = 0; i < this.nLegs; i++) {
      const c = this.cylinders[i];
      if (L[i] < c.Lmin - 1e-9) reasons.push(`stroke-min:leg${i + 1}`);
      else if (L[i] > c.Lmax + 1e-9) reasons.push(`stroke-max:leg${i + 1}`);
    }
    if (this.requireUpperHalf && pose.y <= 0) reasons.push("below-base");
    return { ok: reasons.length === 0, reasons, L };
  }

  /* abstract */
  ik() { throw new Error("ik() not implemented"); }
  fk() { throw new Error("fk() not implemented"); }
  jacobian() { throw new Error("jacobian() not implemented"); }
  manipulability() { throw new Error("manipulability() not implemented"); }
  legs() { throw new Error("legs() not implemented"); }
  home() { throw new Error("home() not implemented"); }
}
