/**
 * @file injection.js
 * Physical fault injection. Where FaultEngine.inject() forces the DISPLAY of a
 * fault, FaultInjector perturbs the actual PLANT so detection responds for real
 * — the compelling instructor demo (derate the pump → watch PUMP_SATURATED light
 * up; spike the payload → watch OVER_PRESSURE appear near a singularity).
 *
 * Every perturbation saves the original value once and can be reverted, so an
 * instructor can inject and clear faults non-destructively during a session.
 */

export class FaultInjector {
  /** @param {object} sim a Simulation instance */
  constructor(sim) {
    this.sim = sim;
    this.saved = {}; // original values, captured on first injection
    this.active = new Set();
  }

  _save(key, value) {
    if (!(key in this.saved)) this.saved[key] = value;
  }

  /** Force a cylinder's spool to a fixed value (e.g., +1 stuck open, 0 jammed shut). */
  stuckValve(leg, spool = 0) {
    this.sim.valveOverride[leg] = spool;
    this.active.add(`stuckValve:${leg}`);
  }
  releaseValve(leg) {
    this.sim.valveOverride[leg] = null;
    this.active.delete(`stuckValve:${leg}`);
  }

  /** Scale pump capacity by `factor` (e.g., 0.4 ⇒ 40% flow available). */
  pumpDerate(factor) {
    this._save("pumpMaxFlow", this.sim.hyd.cfg.pumpMaxFlow);
    this.sim.hyd.cfg.pumpMaxFlow = this.saved.pumpMaxFlow * factor;
    this.active.add("pumpDerate");
  }

  /** Add payload mass [kg] (raises load pressure). */
  payloadSpike(massKg) {
    this._save("payloadMass", this.sim.hyd.cfg.load.payloadMass ?? 0);
    this.sim.hyd.cfg.load.payloadMass = massKg;
    this.active.add("payloadSpike");
  }

  /** Drop relief pressure [Pa] (makes over-pressure easy to trigger). */
  reliefDrop(pa) {
    this._save("reliefPressure", this.sim.hyd.cfg.reliefPressure);
    this.sim.hyd.cfg.reliefPressure = pa;
    this.active.add("reliefDrop");
  }

  /** Swap the valve model on every leg (e.g., to 'bangbang' to show coarse positioning). */
  valveModel(model, params = {}) {
    if (!("valve" in this.saved)) {
      this.saved.valve = this.sim.hyd.valves.map((v) => ({
        model: v.model,
        deadband: v.deadband,
        hysteresis: v.hysteresis,
        pwmFreq: v.pwmFreq,
      }));
    }
    this.sim.hyd.valves.forEach((v) => {
      v.model = model;
      if (params.deadband != null) v.deadband = params.deadband;
      if (params.hysteresis != null) v.hysteresis = params.hysteresis;
      if (params.pwmFreq != null) v.pwmFreq = params.pwmFreq;
      v.reset();
    });
    this.active.add("valveModel");
  }

  /** Revert every active injection to the saved originals. */
  clearAll() {
    if ("pumpMaxFlow" in this.saved) this.sim.hyd.cfg.pumpMaxFlow = this.saved.pumpMaxFlow;
    if ("payloadMass" in this.saved) this.sim.hyd.cfg.load.payloadMass = this.saved.payloadMass;
    if ("reliefPressure" in this.saved) this.sim.hyd.cfg.reliefPressure = this.saved.reliefPressure;
    if ("valve" in this.saved) {
      this.sim.hyd.valves.forEach((v, i) => {
        const s = this.saved.valve[i];
        v.model = s.model;
        v.deadband = s.deadband;
        v.hysteresis = s.hysteresis;
        v.pwmFreq = s.pwmFreq;
        v.reset();
      });
    }
    for (let i = 0; i < this.sim.valveOverride.length; i++) this.sim.valveOverride[i] = null;
    if (this.sim.faultEngine) this.sim.faultEngine.clearForced();
    this.saved = {};
    this.active.clear();
  }

  /** List of active injection keys. */
  list() {
    return [...this.active];
  }
}
