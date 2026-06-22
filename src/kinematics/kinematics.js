/**
 * @file kinematics.js
 * Factory + default geometries. Depends on the concrete strategies (acyclic:
 * strategies depend on kinematics-base.js, this file depends on strategies).
 *
 * Re-exports KinematicsBase for convenience so consumers can import everything
 * kinematics-related from here or from index.js.
 */

import { Kinematics2DOF } from "./kinematics2dof.js";
import { Kinematics3DOF } from "./kinematics3dof.js";

export { KinematicsBase } from "./kinematics-base.js";

/**
 * Build the kinematics strategy for a geometry config.
 * @param {object} geometry  must include `dof` (2 or 3)
 * @returns {import("./kinematics-base.js").KinematicsBase}
 */
export function makeKinematics(geometry) {
  const dof = geometry.dof ?? 2;
  if (dof === 2) return new Kinematics2DOF(geometry);
  if (dof === 3) return new Kinematics3DOF(geometry);
  throw new Error(`makeKinematics: unsupported dof ${dof}`);
}

/* ===================== DEFAULT GEOMETRIES ============================== */
/* Sane non-degenerate starting points for tests and baseline presets.      */
/* The full preset system (Module 13) supersedes these.                     */

/** 2-DOF: symmetric base, equal cylinders. b = 0.6 m, L ∈ [0.4, 1.0]. */
export const defaultGeometry2DOF = {
  dof: 2,
  baseSpacing: 1.2,
  cylinder: { Lclosed: 0.4, stroke: 0.6 },
  requireUpperHalf: true,
};

/**
 * 3-DOF (3-RPR): canonical equilateral arrangement, both triangles centered at
 * the origin, platform triangle rotated 30° relative to the base. This is
 * well-conditioned at the centered home q=(0,0,0) (manipulability ≈ 0.25),
 * unlike a mirror-symmetric "diamond" layout which is singular along θ=0.
 * Base circumradius 0.8 m, platform circumradius 0.16 m, L ∈ [0.3, 1.2] m.
 * The workspace is centered (platform orbits the base centroid), so
 * requireUpperHalf is false.
 */
export const defaultGeometry3DOF = {
  dof: 3,
  // Base: equilateral triangle, vertices at 90°, 210°, 330°, circumradius 0.8.
  anchors: [
    [0.0, 0.8],
    [-0.6928203230275509, -0.4],
    [0.6928203230275509, -0.4],
  ],
  // Platform: equilateral triangle, rotated 30° (vertices at 120°,240°,0°), circumradius 0.16.
  attach: [
    [-0.08, 0.1385640646055102],
    [-0.08, -0.1385640646055102],
    [0.16, 0.0],
  ],
  cylinder: { Lclosed: 0.3, stroke: 0.9 },
  requireUpperHalf: false,
  home: { x: 0, y: 0, theta: 0 },
};
