/**
 * @file hydraulics.js
 * Electrohydraulic actuation engine. Given controller spool commands and the
 * current kinematic Jacobian, it produces cylinder velocities and a rich set of
 * physical signals (flows, load pressures, drive pressures, saturation). It does
 * NOT classify faults — it exposes raw signals and boolean flags; the fault
 * engine (Module 5) maps those to graded fault states.
 *
 * Physics (design spec §5.5–5.6), kept at bench-instrumentable fidelity:
 *
 *   Areas        A_cap = πD²/4 ,  A_rod = π(D²−d²)/4 ,  asymmetry φ = A_cap/A_rod
 *   Motion area  A_eff = A_cap when extending (u>0), A_rod when retracting (u<0)
 *   Load force   J^T f = M·a − F_ext   ⇒   f = J^{-T}(M·a − F_ext)
 *                F_ext = gravity generalized force (CoM at platform origin)
 *   Load press.  P_load,i = |f_i| / A_eff,i
 *   Orifice flow Q_i = sign(u)·|u|·Q_rated · √(ΔP / ΔP_rated),  ΔP = max(0, P_sup_eff − P_load)
 *   Pump alloc   if Σ|Q_i| > Q_pump_max, scale all proportionally (shared supply)
 *   Velocity     ṡ_i = Q_i / A_eff,i
 *
 * Assumption (areas): the load-pressure estimate uses the motion-direction
 * effective area, matching the spec. For the dominant gravity-loaded case
 * (push-to-extend / hold) the force-bearing and motion areas coincide.
 *
 * Assumption (rated drop): ΔP_rated defaults to the supply pressure, so a leg at
 * full command under no load flows at exactly Q_rated, and flow falls off as the
 * load pressure approaches supply. Override `ratedPressureDrop` to change this.
 */

import * as M from "../math/index.js";
import { Valve } from "./valve.js";

/** Build per-leg cylinder area data from config. */
function makeCylinders(cfg, nLegs) {
  let arr = Array.isArray(cfg.cylinders)
    ? cfg.cylinders
    : Array.from({ length: nLegs }, () => ({ ...cfg.cylinder }));
  if (arr.length !== nLegs)
    throw new Error(`hydraulics: ${arr.length} cylinders but nLegs=${nLegs}`);
  return arr.map((c) => {
    const Acap = (Math.PI / 4) * c.bore * c.bore;
    const Arod = (Math.PI / 4) * (c.bore * c.bore - c.rod * c.rod);
    if (Arod <= 0) throw new Error("hydraulics: rod diameter >= bore");
    return { bore: c.bore, rod: c.rod, Acap, Arod, phi: Acap / Arod, ratedFlow: c.ratedFlow };
  });
}

export class HydraulicEngine {
  /**
   * @param {object} config  hydraulics config (see defaultHydraulics)
   * @param {number} nLegs
   */
  constructor(config, nLegs) {
    this.cfg = config;
    this.nLegs = nLegs;
    this.cylinders = makeCylinders(config, nLegs);
    this.valves = Array.from({ length: nLegs }, () => new Valve(config.valve ?? {}));
    this.pRated = config.ratedPressureDrop ?? config.supplyPressure;
  }

  /** Reset valve state (hysteresis/PWM phase). */
  reset() {
    this.valves.forEach((v) => v.reset());
  }

  /** @returns {{Acap:number,Arod:number,phi:number}[]} per-leg areas */
  areas() {
    return this.cylinders.map((c) => ({ Acap: c.Acap, Arod: c.Arod, phi: c.phi }));
  }

  /** Mean asymmetry ratio φ across legs. */
  asymmetry() {
    return M.mean(this.cylinders.map((c) => c.phi));
  }

  /**
   * Nominal max extend velocity per leg = ratedFlow / A_cap [m/s].
   * Used by the controller to normalize length-rate feedforward into spool units.
   * @returns {number[]}
   */
  nominalVelocities() {
    return this.cylinders.map((c) => c.ratedFlow / c.Acap);
  }

  /** Diagonal generalized mass [m,m] (2-DOF) or [m,m,I] (3-DOF). */
  _massDiag(dof) {
    const { platformMass, payloadMass, rotInertia } = this.cfg.load;
    const m = platformMass + (payloadMass ?? 0);
    return dof === 3 ? [m, m, rotInertia ?? 0.2] : [m, m];
  }

  /** Generalized gravity force F_ext (CoM at platform origin). */
  _gravity(dof) {
    const { platformMass, payloadMass, gravity } = this.cfg.load;
    const Fy = -(platformMass + (payloadMass ?? 0)) * gravity;
    return dof === 3 ? [0, Fy, 0] : [0, Fy];
  }

  /**
   * Solve one hydraulic step.
   * @param {object} args
   * @param {number[]} args.u          controller spool commands ∈[-1,1], per leg
   * @param {number[][]} args.jacobian current kinematic Jacobian (nLegs × dof)
   * @param {number} args.dt           timestep [s]
   * @param {number[]} [args.genAccel] optional generalized accel for inertia term
   * @returns {object} flows, velocities, pressures, and flags
   */
  solve({ u, jacobian, dt, genAccel = null }) {
    const J = jacobian;
    const dof = J[0].length;
    const n = this.nLegs;

    // 1) Valve shaping (stateful).
    const uEff = u.map((ui, i) => this.valves[i].meter(ui, dt));

    // 2) Required actuator leg forces: f = J^{-T}(M·a − F_ext).
    const Fext = this._gravity(dof);
    const Mdiag = this._massDiag(dof);
    const rhs = Fext.map((Fk, k) => (genAccel ? Mdiag[k] * genAccel[k] : 0) - Fk);
    let f;
    let singularLoad = false;
    if (M.norm(rhs) < 1e-9) {
      f = new Array(n).fill(0); // no load to support
    } else {
      try {
        f = M.matVec(M.invT(J), rhs);
      } catch {
        f = new Array(n).fill(Infinity); // singular under load ⇒ unbounded force
        singularLoad = true;
      }
    }

    // 3) Per-leg pressure & demanded flow.
    const pSupplyEff = Math.min(this.cfg.supplyPressure, this.cfg.reliefPressure);
    const perLeg = [];
    const qDemand = new Array(n);
    for (let i = 0; i < n; i++) {
      const cyl = this.cylinders[i];
      const dir = Math.sign(uEff[i]);
      const Aeff = dir < 0 ? cyl.Arod : cyl.Acap;
      const pLoad = Math.abs(f[i]) / Aeff; // may be Infinity near singular load
      const deltaP = Math.max(0, pSupplyEff - pLoad);
      const factor = Math.sqrt(deltaP / this.pRated); // orifice √ΔP law
      const qd = Math.sign(uEff[i]) * Math.abs(uEff[i]) * cyl.ratedFlow * factor;
      qDemand[i] = qd;
      perLeg.push({ uEff: uEff[i], dir, Aeff, Acap: cyl.Acap, Arod: cyl.Arod, force: f[i], pLoad, deltaP, qDemand: qd });
    }

    // 4) Shared-pump allocation.
    const pumpDemand = qDemand.reduce((s, q) => s + Math.abs(q), 0);
    const pumpScale = pumpDemand > this.cfg.pumpMaxFlow ? this.cfg.pumpMaxFlow / pumpDemand : 1;

    // 5) Velocities + raw flags.
    const Q = new Array(n);
    const sDot = new Array(n);
    const pLoad = new Array(n);
    const overPressure = new Array(n);
    const stall = new Array(n);
    const valveSaturated = new Array(n);
    for (let i = 0; i < n; i++) {
      const pl = perLeg[i];
      const q = pl.qDemand * pumpScale;
      Q[i] = q;
      sDot[i] = q / pl.Aeff;
      pLoad[i] = pl.pLoad;
      pl.q = q;
      pl.sDot = sDot[i];
      overPressure[i] = pl.pLoad > this.cfg.reliefPressure;
      stall[i] = pl.deltaP <= 0 && Math.abs(pl.uEff) > 1e-6; // commanded but cannot drive
      valveSaturated[i] = Math.abs(pl.uEff) > 0.999;
    }

    return {
      uEff,
      perLeg,
      Q,
      sDot,
      pLoad,
      force: f,
      pSupplyEff,
      pumpDemand,
      pumpScale,
      pumpSaturated: pumpScale < 1,
      fext: Fext,
      flags: {
        overPressure,
        stall,
        valveSaturated,
        pumpSaturated: pumpScale < 1,
        singularLoad,
      },
    };
  }
}

/* ============================ FACTORY + DEFAULTS ======================= */

/**
 * @param {object} config
 * @param {number} nLegs
 * @returns {HydraulicEngine}
 */
export function makeHydraulics(config, nLegs) {
  return new HydraulicEngine(config, nLegs);
}

/**
 * Baseline SI hydraulics. Pump capacity is sized so two cylinders at full
 * command fit, but three (3-DOF coordinated full-speed) saturate the pump —
 * the flow-starvation demo falls out for free.
 */
export const defaultHydraulics = {
  supplyPressure: 16e6, // Pa (160 bar)
  reliefPressure: 21e6, // Pa (210 bar)
  ratedPressureDrop: null, // null ⇒ use supplyPressure
  pumpMaxFlow: 6e-4, // m³/s (~36 L/min) shared
  fluidDensity: 850, // kg/m³ (informational)
  cylinder: { bore: 0.04, rod: 0.022, ratedFlow: 2.5e-4 }, // per leg; φ ≈ 1.43
  load: { platformMass: 12, payloadMass: 0, gravity: 9.81, rotInertia: 0.2 },
  valve: { model: "proportional", deadband: 0.0, hysteresis: 0.02, pwmFreq: 60 },
};
