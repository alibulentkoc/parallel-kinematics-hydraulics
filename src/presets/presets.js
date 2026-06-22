/**
 * @file presets.js
 * Preset management (requirement #13). A preset is a named, self-contained config
 * bundle — geometry + hydraulics + controller + fault thresholds — that puts the
 * whole testbed into a known teaching state. These are the scenarios from the
 * design spec §7.1, each chosen to expose one phenomenon.
 *
 * The PresetManager is the shared config layer both dashboards consume: the
 * instructor dashboard (Module 8) exposes all of it; the student dashboard
 * (Module 9) locks geometry and hands out a curated subset.
 */

import { defaultGeometry2DOF, defaultGeometry3DOF } from "../kinematics/index.js";
import { defaultHydraulics } from "../hydraulics/index.js";
import { defaultController } from "../control/index.js";
import { defaultFaultConfig } from "../faults/index.js";

/** Recursive merge: objects merge, arrays/primitives replace. */
function deepMerge(base, over = {}) {
  const out = structuredClone(base);
  for (const k in over) {
    const ov = over[k];
    if (ov && typeof ov === "object" && !Array.isArray(ov) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], ov);
    } else {
      out[k] = structuredClone(ov);
    }
  }
  return out;
}

/** Build a preset bundle from defaults + overrides. */
function preset(id, label, dof, description, notes, over = {}) {
  const geometry = over.geometry ? deepMerge(dof === 3 ? defaultGeometry3DOF : defaultGeometry2DOF, over.geometry) : structuredClone(dof === 3 ? defaultGeometry3DOF : defaultGeometry2DOF);
  return {
    id,
    label,
    dof,
    description,
    notes: notes || "",
    geometry,
    hydraulics: deepMerge(defaultHydraulics, over.hydraulics || {}),
    controller: deepMerge(defaultController, over.controller || {}),
    faultConfig: deepMerge(defaultFaultConfig, over.faultConfig || {}),
    defaultTarget: over.defaultTarget || null,
  };
}

/* ----------------------------- BUILT-INS ----------------------------- */

const BUILTINS = [
  preset("baseline_2dof", "Baseline (2-DOF)", 2, "Nominal point positioner.", "Start here. Clean proportional tracking; tune Kp and observe step response.", {
    controller: { Kp: 40 },
    defaultTarget: { x: 0.12, y: 0.55 },
  }),

  preset("asymmetry_demo", "Area asymmetry (2-DOF)", 2, "Large cap/rod area ratio φ.", "Retraction is ~φ× faster than extension for equal flow. Tune for extend, then watch retract overshoot.", {
    hydraulics: { cylinder: { bore: 0.04, rod: 0.03, ratedFlow: 2.5e-4 } }, // φ ≈ 2.3
    controller: { Kp: 40 },
  }),

  preset("weak_pump", "Flow starvation (2-DOF)", 2, "Undersized pump.", "A fast coordinated move exceeds pump capacity; both cylinders slow together.", {
    hydraulics: { pumpMaxFlow: 3e-4 },
    controller: { Kp: 60 },
    defaultTarget: { x: 0.35, y: 0.62 },
  }),

  preset("near_singular_2dof", "Near singularity (2-DOF)", 2, "Shallow workspace; manipulability drops.", "Drive toward the base line (low y) and watch det(J)→0, control conditioning collapse, and pressure spike.", {
    geometry: { baseSpacing: 1.4, cylinder: { Lclosed: 0.55, stroke: 0.5 } },
    faultConfig: { manipWarn: 0.12, manipFault: 0.03 },
    defaultTarget: { x: 0.0, y: 0.03 },
  }),

  preset("onoff_valve", "Solenoid on/off (2-DOF)", 2, "Bang-bang DCV with deadband.", "On/off valves park within their deadband — coarse positioning vs. the proportional case.", {
    hydraulics: { valve: { model: "bangbang", deadband: 0.06, hysteresis: 0.02 } },
    controller: { Kp: 50 },
    defaultTarget: { x: 0.1, y: 0.55 },
  }),

  preset("low_relief", "Over-pressure (2-DOF)", 2, "Low relief + payload.", "Load pressure exceeds the relief setting; relief opens and motion sags.", {
    hydraulics: { reliefPressure: 5e4, supplyPressure: 5e4, load: { payloadMass: 30 } },
    controller: { Kp: 50 },
    defaultTarget: { x: 0.05, y: 0.7 },
  }),

  preset("final_3dof", "Final platform (3-DOF)", 3, "Well-conditioned 3-RPR.", "Position and orientation control. Compare joint-space vs task-space tracking of a θ sweep.", {
    controller: { Kp: 40 },
    faultConfig: { manipWarn: 0.06, manipFault: 0.02 },
    defaultTarget: { x: 0.04, y: 0.03, theta: 0.06 },
  }),

  preset("singular_3rpr_diamond", "Singular diamond (3-DOF)", 3, "Deliberately broken geometry.", "A mirror-symmetric 3-RPR that is singular along θ=0. Hand this to students to discover why the rotation controller misbehaves.", {
    geometry: {
      anchors: [
        [-0.8, 0.0],
        [0.8, 0.0],
        [0.0, 1.0],
      ],
      attach: [
        [-0.12, -0.07],
        [0.12, -0.07],
        [0.0, 0.14],
      ],
      cylinder: { Lclosed: 0.3, stroke: 0.7 },
      requireUpperHalf: true,
      home: { x: 0, y: 0.45, theta: 0 },
    },
    faultConfig: { manipWarn: 0.06, manipFault: 0.02 },
    defaultTarget: { x: 0.0, y: 0.45, theta: 0.0 },
  }),
];

/* --------------------------- VALIDATION ------------------------------ */

/**
 * Validate a preset bundle's numeric sanity.
 * @param {object} b @returns {{ok:boolean, errors:string[]}}
 */
export function validatePreset(b) {
  const errors = [];
  if (!b || typeof b !== "object") return { ok: false, errors: ["not an object"] };
  if (b.dof !== 2 && b.dof !== 3) errors.push("dof must be 2 or 3");

  const g = b.geometry || {};
  const gcyls = Array.isArray(g.cylinders) ? g.cylinders : g.cylinder ? [g.cylinder] : [];
  for (const c of gcyls) {
    if (!(c.stroke > 0)) errors.push("geometry cylinder stroke must be > 0");
    if (!(c.Lclosed >= 0)) errors.push("geometry cylinder Lclosed must be ≥ 0");
  }
  if (b.dof === 2 && !(g.baseSpacing > 0)) errors.push("2-DOF needs baseSpacing > 0");
  if (b.dof === 3) {
    if (!(Array.isArray(g.anchors) && g.anchors.length === 3)) errors.push("3-DOF needs 3 anchors");
    if (!(Array.isArray(g.attach) && g.attach.length === 3)) errors.push("3-DOF needs 3 attach points");
  }

  const h = b.hydraulics || {};
  const hcyls = Array.isArray(h.cylinders) ? h.cylinders : h.cylinder ? [h.cylinder] : [];
  for (const c of hcyls) {
    if (!(c.bore > 0)) errors.push("hydraulics cylinder bore must be > 0");
    if (!(c.rod >= 0 && c.rod < c.bore)) errors.push("hydraulics rod must satisfy 0 ≤ rod < bore");
    if (!(c.ratedFlow > 0)) errors.push("hydraulics ratedFlow must be > 0");
  }
  if (!(h.supplyPressure > 0)) errors.push("supplyPressure must be > 0");
  if (!(h.reliefPressure > 0)) errors.push("reliefPressure must be > 0");
  if (!(h.pumpMaxFlow > 0)) errors.push("pumpMaxFlow must be > 0");

  const c = b.controller || {};
  if (!(c.Kp >= 0)) errors.push("Kp must be ≥ 0");

  return { ok: errors.length === 0, errors };
}

/* ------------------------- PRESET MANAGER ---------------------------- */

export class PresetManager {
  constructor() {
    this.map = new Map();
    for (const p of BUILTINS) this.map.set(p.id, p);
  }

  /** Lightweight listing for menus. */
  list() {
    return [...this.map.values()].map((p) => ({ id: p.id, label: p.label, dof: p.dof, description: p.description, notes: p.notes }));
  }

  has(id) {
    return this.map.has(id);
  }

  /** Get the live bundle (do not mutate; use apply() for a working copy). */
  get(id) {
    return this.map.get(id);
  }

  /** Deep-cloned working copy of a preset. */
  apply(id) {
    const p = this.map.get(id);
    if (!p) throw new Error(`unknown preset: ${id}`);
    return structuredClone(p);
  }

  /** Register a custom preset (validated). */
  register(bundle) {
    const v = validatePreset(bundle);
    if (!v.ok) throw new Error(`invalid preset: ${v.errors.join("; ")}`);
    this.map.set(bundle.id, structuredClone(bundle));
    return bundle.id;
  }

  remove(id) {
    return this.map.delete(id);
  }

  /** Serialize all presets to JSON (for export / localStorage). */
  serialize() {
    return JSON.stringify([...this.map.values()]);
  }

  /** Merge presets from a serialized JSON string (custom presets win). */
  loadJSON(json) {
    const arr = JSON.parse(json);
    for (const b of arr) if (validatePreset(b).ok) this.map.set(b.id, b);
    return this;
  }
}

export function makePresetManager() {
  return new PresetManager();
}
