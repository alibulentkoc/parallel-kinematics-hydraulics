/**
 * @file index.js
 * Public surface of the sim module, plus a convenience builder.
 */

import { makeKinematics } from "../kinematics/index.js";
import { makeHydraulics } from "../hydraulics/index.js";
import { Controller } from "../control/controller.js";
import { TargetGenerator } from "../control/trajectory.js";
import { Simulation } from "./simulation.js";

export { Simulation } from "./simulation.js";

/**
 * Build a fully-wired simulation from plain config objects.
 * @param {object} cfg
 * @param {object} cfg.geometry     kinematics geometry (includes dof)
 * @param {object} cfg.hydraulics   hydraulics config
 * @param {object} cfg.controller   controller config
 * @param {number} [cfg.dt=1e-3]
 * @returns {Simulation}
 */
export function buildSimulation({ geometry, hydraulics, controller, dt = 1e-3 }) {
  const kin = makeKinematics(geometry);
  const hyd = makeHydraulics(hydraulics, kin.nLegs);
  const ctrl = new Controller(kin.dof, kin.nLegs, controller);
  const gen = new TargetGenerator(kin.dof, kin.home());
  return new Simulation({ kin, hyd, ctrl, gen, dt });
}
