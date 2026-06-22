/**
 * @file faults.test.js
 * Validates the fault engine, debouncing, and both injection mechanisms.
 *
 * Run headless:   node test/faults.test.js
 * Run in browser: open test/run-faults.html
 */

import { defaultGeometry2DOF, defaultGeometry3DOF } from "../src/kinematics/index.js";
import { defaultHydraulics } from "../src/hydraulics/index.js";
import { defaultController } from "../src/control/index.js";
import { buildSimulation } from "../src/sim/index.js";
import { makeFaultEngine, FaultInjector } from "../src/faults/index.js";

/* --- harness ---------------------------------------------------------- */
let pass = 0,
  fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) pass++;
  else {
    fail++;
    failures.push(name);
    console.error("  ✗ " + name);
  }
}
const clone = (o) => JSON.parse(JSON.stringify(o));

/** Minimal synthetic snapshot (clean by default; override fields to inject conditions). */
function snap(over = {}, t = 0) {
  return Object.assign(
    {
      t,
      nLegs: 2,
      dof: 2,
      reachable: { ok: true, reasons: [] },
      manip: 0.5,
      pumpSaturated: false,
      pumpScale: 1,
      fkOk: true,
      strokeEnd: [false, false],
      sDot: [0, 0],
      pLoad: [0, 0],
      uEff: [0, 0],
      hydraulicFlags: {
        overPressure: [false, false],
        stall: [false, false],
        valveSaturated: [false, false],
        singularLoad: false,
      },
    },
    over
  );
}

/** Feed the same raw snapshot N times (advancing t) to satisfy debounce. */
function hold(fe, s, n) {
  let out = [];
  for (let i = 0; i < n; i++) out = fe.evaluate(snap(s, i * 1e-3));
  return out;
}
const hasFault = (faults, id) => faults.some((f) => f.id === id);

/* ===================== CLEAN STATE =================================== */
{
  const fe = makeFaultEngine();
  const out = hold(fe, {}, 30);
  check("no faults on a clean snapshot", out.length === 0);
  check("summary reports ok", fe.summary().level === "ok");
}

/* ===================== EACH FAULT CLASS ============================== */
{
  const fe = makeFaultEngine();
  check("UNREACHABLE", hasFault(hold(fe, { reachable: { ok: false, reasons: ["stroke-max:leg1"] } }, 5), "UNREACHABLE"));
}
{
  const fe = makeFaultEngine();
  check("SINGULAR (manip < manipFault)", hasFault(hold(fe, { manip: 0.005 }, 5), "SINGULAR"));
}
{
  const fe = makeFaultEngine();
  const out = hold(fe, { manip: 0.03 }, 10);
  check("NEAR_SINGULAR (warn band)", hasFault(out, "NEAR_SINGULAR"));
  check("NEAR_SINGULAR does not also fire SINGULAR", !hasFault(out, "SINGULAR"));
}
{
  const fe = makeFaultEngine();
  check("PUMP_SATURATED", hasFault(hold(fe, { pumpSaturated: true, pumpScale: 0.6 }, 5), "PUMP_SATURATED"));
}
{
  const fe = makeFaultEngine();
  check("STROKE_END per leg", hasFault(hold(fe, { strokeEnd: [false, true] }, 3), "STROKE_END"));
  check("STROKE_END tagged to correct leg", fe.active.find((f) => f.id === "STROKE_END").leg === 1);
}
{
  const fe = makeFaultEngine();
  const s = { hydraulicFlags: { overPressure: [true, false], stall: [false, false], valveSaturated: [false, false], singularLoad: false } };
  check("OVER_PRESSURE", hasFault(hold(fe, s, 3), "OVER_PRESSURE"));
}
{
  const fe = makeFaultEngine();
  const s = { hydraulicFlags: { overPressure: [false, false], stall: [false, false], valveSaturated: [false, false], singularLoad: true } };
  check("SINGULAR_LOAD", hasFault(hold(fe, s, 3), "SINGULAR_LOAD"));
}
{
  const fe = makeFaultEngine();
  check("FK_INVALID", hasFault(hold(fe, { fkOk: false }, 3), "FK_INVALID"));
}
{
  const fe = makeFaultEngine();
  const s = { sDot: [-0.2, 0], pLoad: [0, 0], uEff: [-1, 0] };
  check("CAVITATION_RISK heuristic", hasFault(hold(fe, s, 8), "CAVITATION_RISK"));
}

/* ===================== DEBOUNCING =================================== */
{
  const fe = makeFaultEngine(); // NEAR_SINGULAR onSteps=3
  // single blip should NOT activate
  fe.evaluate(snap({ manip: 0.03 }, 0));
  fe.evaluate(snap({}, 1e-3)); // clean
  check("single blip does not activate (debounce on)", !hasFault(fe.active, "NEAR_SINGULAR"));
  // sustained should activate
  check("sustained activates after onSteps", hasFault(hold(fe, { manip: 0.03 }, 5), "NEAR_SINGULAR"));
  // then clears after offSteps of clean
  const cleared = hold(fe, {}, 25);
  check("clears after offSteps of clean", !hasFault(cleared, "NEAR_SINGULAR"));
}

/* ===================== SEVERITY SORTING ============================= */
{
  const fe = makeFaultEngine();
  const s = {
    manip: 0.005, // SINGULAR (fault)
    pumpSaturated: true, // PUMP_SATURATED (limit)
    hydraulicFlags: { overPressure: [false, false], stall: [false, false], valveSaturated: [true, false], singularLoad: false }, // VALVE_SATURATED (warn)
  };
  const out = hold(fe, s, 8);
  check("most severe fault sorted first", out[0].severity === "fault");
  check("warn sorted last", out[out.length - 1].severity === "warn");
}

/* ===================== FLAG INJECTION ============================== */
{
  const fe = makeFaultEngine();
  fe.inject("OVER_PRESSURE", true); // force on even though raw is false
  check("forced fault appears active", hasFault(hold(fe, {}, 3), "OVER_PRESSURE"));
  fe.inject("OVER_PRESSURE", null); // back to auto
  check("released forced fault clears", !hasFault(hold(fe, {}, 12), "OVER_PRESSURE"));

  // force OFF suppresses a real condition
  const fe2 = makeFaultEngine();
  fe2.inject("PUMP_SATURATED", false);
  check("forced-off suppresses real condition", !hasFault(hold(fe2, { pumpSaturated: true }, 8), "PUMP_SATURATED"));
}

/* ===================== PHYSICAL INJECTION (real plant) ============= */
{
  // Pump derate should trigger PUMP_SATURATED on a coordinated move.
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: clone(defaultHydraulics),
    controller: { ...defaultController, Kp: 40 },
  });
  sim.faultEngine = makeFaultEngine();
  const inj = new FaultInjector(sim);
  inj.pumpDerate(0.2); // 20% capacity
  sim.setMode("step");
  sim.setTarget({ x: 0.3, y: 0.6 }); // demands fast coordinated motion
  let sawPump = false;
  for (let i = 0; i < 800; i++) {
    const snp = sim.step();
    if (snp.faults && snp.faults.some((f) => f.id === "PUMP_SATURATED")) sawPump = true;
  }
  check("pumpDerate triggers PUMP_SATURATED", sawPump);

  // Clear reverts pump capacity.
  const before = sim.hyd.cfg.pumpMaxFlow;
  inj.clearAll();
  check("clearAll restores pump capacity", sim.hyd.cfg.pumpMaxFlow > before);
}
{
  // Stuck valve overrides the controller command.
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: clone(defaultHydraulics),
    controller: { ...defaultController, Kp: 40 },
  });
  const inj = new FaultInjector(sim);
  inj.stuckValve(0, 1.0); // leg 1 jammed fully open (extend)
  sim.setMode("step");
  sim.setTarget(sim.kin.home()); // controller wants to hold, but leg 0 is stuck extending
  for (let i = 0; i < 200; i++) sim.step();
  check("stuck valve forces continuous extension (uEff≈+1)", sim.last.uEff[0] > 0.99);
  check("stuck valve drives that leg's stroke up", sim.s[0] > 0.01);
  inj.releaseValve(0);
  check("releaseValve restores controller authority", sim.valveOverride[0] === null);
}
{
  // Payload spike + low relief -> OVER_PRESSURE on the real plant.
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: clone(defaultHydraulics),
    controller: { ...defaultController, Kp: 40 },
  });
  sim.faultEngine = makeFaultEngine();
  const inj = new FaultInjector(sim);
  inj.reliefDrop(2e5); // 2 bar
  inj.payloadSpike(80);
  sim.setMode("step");
  sim.setTarget({ x: 0.05, y: 0.6 });
  let sawOP = false;
  for (let i = 0; i < 400; i++) {
    const snp = sim.step();
    if (snp.faults && snp.faults.some((f) => f.id === "OVER_PRESSURE")) sawOP = true;
  }
  check("payload spike + low relief triggers OVER_PRESSURE", sawOP);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nFault engine: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All fault tests passed. ✓");
}

export { pass, fail };
