/**
 * @file faults.js
 * Fault engine. Consumes a Simulation telemetry snapshot, evaluates a registry
 * of detectors against configurable thresholds, debounces them, and returns
 * graded fault objects. It classifies — it does not compute physics (that is the
 * hydraulic/sim layers). Physical fault injection lives in injection.js; this
 * file provides FLAG injection (force a fault's display on/off) for TA workflow.
 *
 * Severity ladder:  'warn' (1) < 'limit' (2) < 'fault' (3).
 * Scope:            'global' or 'leg' (evaluated per cylinder).
 *
 * Debouncing: each fault activates only after `onSteps` consecutive raw-true
 * ticks and clears after `offSteps` consecutive raw-false ticks, so transient
 * blips don't flicker the UI.
 */

export const SEVERITY_RANK = { warn: 1, limit: 2, fault: 3 };

/** Default thresholds + debounce. Presets (Module 13) override per geometry. */
export const defaultFaultConfig = {
  manipWarn: 0.05, // below ⇒ NEAR_SINGULAR (warn)
  manipFault: 0.01, // below ⇒ SINGULAR (fault)
  cavitation: { vThresh: 0.05, pThresh: 5e4, uThresh: 0.9 },
  debounce: { onSteps: 3, offSteps: 20 }, // fallback if a def omits its own
};

/**
 * Fault registry. Each def: { id, label, severity, scope, onSteps?, offSteps?,
 * test(snap,cfg,leg?) -> bool, detail(snap,cfg,leg?) -> string }.
 */
function buildRegistry() {
  return [
    // --- global ---
    {
      id: "UNREACHABLE",
      label: "Target unreachable",
      severity: "limit",
      scope: "global",
      onSteps: 1,
      offSteps: 5,
      test: (s) => !s.reachable.ok,
      detail: (s) => `Commanded pose outside workspace (${s.reachable.reasons.join(", ")}).`,
    },
    {
      id: "SINGULAR",
      label: "Singular configuration",
      severity: "fault",
      scope: "global",
      onSteps: 2,
      offSteps: 15,
      test: (s, cfg) => s.manip < cfg.manipFault,
      detail: (s) => `Manipulability ${s.manip.toExponential(2)} below singular limit.`,
    },
    {
      id: "NEAR_SINGULAR",
      label: "Near singularity (ill-conditioned)",
      severity: "warn",
      scope: "global",
      onSteps: 3,
      offSteps: 20,
      // Warn band only (don't double-fire when already SINGULAR).
      test: (s, cfg) => s.manip < cfg.manipWarn && s.manip >= cfg.manipFault,
      detail: (s) => `Manipulability ${s.manip.toFixed(3)} — control conditioning degraded.`,
    },
    {
      id: "PUMP_SATURATED",
      label: "Pump flow saturated",
      severity: "limit",
      scope: "global",
      onSteps: 2,
      offSteps: 20,
      test: (s) => s.pumpSaturated,
      detail: (s) => `Combined flow demand exceeds pump capacity (scale ${s.pumpScale.toFixed(2)}).`,
    },
    {
      id: "SINGULAR_LOAD",
      label: "Unbounded load (singular Jacobian)",
      severity: "fault",
      scope: "global",
      onSteps: 1,
      offSteps: 5,
      test: (s) => s.hydraulicFlags && s.hydraulicFlags.singularLoad,
      detail: () => "Leg forces unbounded — Jᵀ is singular under load.",
    },
    {
      id: "FK_INVALID",
      label: "Forward kinematics invalid",
      severity: "fault",
      scope: "global",
      onSteps: 1,
      offSteps: 5,
      test: (s) => s.fkOk === false,
      detail: () => "FK did not produce a valid pose (no intersection / no convergence).",
    },

    // --- per leg ---
    {
      id: "STROKE_END",
      label: "Cylinder at stroke end",
      severity: "limit",
      scope: "leg",
      onSteps: 1,
      offSteps: 10,
      test: (s, cfg, i) => s.strokeEnd[i],
      detail: (s, cfg, i) => `Leg ${i + 1} hit a stroke limit while commanded further.`,
    },
    {
      id: "OVER_PRESSURE",
      label: "Over relief pressure",
      severity: "fault",
      scope: "leg",
      onSteps: 1,
      offSteps: 10,
      test: (s, cfg, i) => s.hydraulicFlags && s.hydraulicFlags.overPressure[i],
      detail: (s, cfg, i) => `Leg ${i + 1} load pressure exceeds relief setting — relief opens.`,
    },
    {
      id: "STALL",
      label: "Actuator stalled",
      severity: "limit",
      scope: "leg",
      onSteps: 2,
      offSteps: 20,
      test: (s, cfg, i) => s.hydraulicFlags && s.hydraulicFlags.stall[i],
      detail: (s, cfg, i) => `Leg ${i + 1} cannot drive (ΔP ≤ 0) — supply below load pressure.`,
    },
    {
      id: "VALVE_SATURATED",
      label: "Valve fully open",
      severity: "warn",
      scope: "leg",
      onSteps: 5,
      offSteps: 30,
      test: (s, cfg, i) => s.hydraulicFlags && s.hydraulicFlags.valveSaturated[i],
      detail: (s, cfg, i) => `Leg ${i + 1} spool at full command.`,
    },
    {
      id: "CAVITATION_RISK",
      label: "Cavitation risk (heuristic)",
      severity: "warn",
      scope: "leg",
      onSteps: 5,
      offSteps: 30,
      // Heuristic: fast retraction at a wide-open valve with little load pressure
      // (overrunning fill side). Not a rigorous cavitation model.
      test: (s, cfg, i) =>
        s.sDot[i] < -cfg.cavitation.vThresh &&
        s.pLoad[i] < cfg.cavitation.pThresh &&
        Math.abs(s.uEff[i]) > cfg.cavitation.uThresh,
      detail: (s, cfg, i) => `Leg ${i + 1} retracting fast at low pressure — possible cavitation.`,
    },
  ];
}

export class FaultEngine {
  /** @param {object} [config] merged over defaultFaultConfig */
  constructor(config = {}) {
    this.cfg = { ...defaultFaultConfig, ...config };
    this.defs = buildRegistry();
    this.forced = {}; // id or "id:leg" -> true|false (override raw detection)
    this.reset();
  }

  reset() {
    this.counters = {}; // key -> {onC, offC, active, since}
    this.active = [];
  }

  /** Force a fault flag on (true), off (false), or back to auto (null). */
  inject(id, state) {
    if (state === null || state === undefined) delete this.forced[id];
    else this.forced[id] = !!state;
  }
  clearForced() {
    this.forced = {};
  }

  _forced(id, key) {
    if (key in this.forced) return this.forced[key];
    if (id in this.forced) return this.forced[id];
    return undefined;
  }

  _debounce(key, def, raw, t) {
    let c = this.counters[key];
    if (!c) c = this.counters[key] = { onC: 0, offC: 0, active: false, since: 0 };
    const onN = def.onSteps ?? this.cfg.debounce.onSteps;
    const offN = def.offSteps ?? this.cfg.debounce.offSteps;
    if (raw) {
      c.onC++;
      c.offC = 0;
      if (!c.active && c.onC >= onN) {
        c.active = true;
        c.since = t;
      }
    } else {
      c.offC++;
      c.onC = 0;
      if (c.active && c.offC >= offN) c.active = false;
    }
    return c.active;
  }

  _make(def, snap, leg) {
    const detail = def.detail ? def.detail(snap, this.cfg, leg) : def.label;
    const key = leg == null ? def.id : `${def.id}:${leg}`;
    return {
      id: def.id,
      key,
      label: def.label,
      severity: def.severity,
      scope: def.scope,
      leg: leg ?? null,
      message: detail,
      since: this.counters[key].since,
      t: snap.t,
    };
  }

  /**
   * Evaluate all faults for a snapshot.
   * @param {object} snap Simulation telemetry snapshot
   * @returns {object[]} active faults, most-severe first
   */
  evaluate(snap) {
    const out = [];
    for (const def of this.defs) {
      if (def.scope === "leg") {
        for (let i = 0; i < snap.nLegs; i++) {
          const key = `${def.id}:${i}`;
          const forced = this._forced(def.id, key);
          const raw = forced !== undefined ? forced : !!def.test(snap, this.cfg, i);
          if (this._debounce(key, def, raw, snap.t)) out.push(this._make(def, snap, i));
        }
      } else {
        const forced = this._forced(def.id, def.id);
        const raw = forced !== undefined ? forced : !!def.test(snap, this.cfg);
        if (this._debounce(def.id, def, raw, snap.t)) out.push(this._make(def, snap));
      }
    }
    out.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
    this.active = out;
    return out;
  }

  /** Highest active severity and counts, for headline UI. */
  summary() {
    if (!this.active.length) return { level: "ok", count: 0, ids: [] };
    const level = this.active[0].severity;
    return { level, count: this.active.length, ids: this.active.map((f) => f.key) };
  }
}

/** @param {object} [config] @returns {FaultEngine} */
export function makeFaultEngine(config) {
  return new FaultEngine(config);
}
