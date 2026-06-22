/**
 * @file logger.test.js
 * Validates the logger, schema, and the TwinTrace digital-twin interface.
 *
 * Run headless:   node test/logger.test.js
 * Run in browser: open test/run-logger.html
 */

import { defaultGeometry2DOF, defaultGeometry3DOF } from "../src/kinematics/index.js";
import { defaultHydraulics } from "../src/hydraulics/index.js";
import { defaultController } from "../src/control/index.js";
import { buildSimulation } from "../src/sim/index.js";
import { makeFaultEngine, FaultInjector } from "../src/faults/index.js";
import { Logger, TwinTrace, schemaColumns } from "../src/logger/index.js";

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
const approx = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const rel = (a, b, r = 1e-4) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ===================== SCHEMA ======================================= */
{
  const c2 = schemaColumns(2, 2);
  check("2DOF schema has t & mode first", c2[0] === "t" && c2[1] === "mode");
  check("2DOF schema has cmd/act/err pose cols", c2.includes("x_cmd") && c2.includes("y_act") && c2.includes("x_err"));
  check("2DOF schema has leg + fault cols", c2.includes("L1_cmd") && c2.includes("L2_act") && c2.includes("faults") && c2.includes("faultLevel"));
  check("2DOF schema has NO theta", !c2.includes("theta_cmd"));

  const c3 = schemaColumns(3, 3);
  check("3DOF schema has theta cols", c3.includes("theta_cmd") && c3.includes("theta_act") && c3.includes("theta_err"));
  check("3DOF schema has 3 legs", c3.includes("L3_act") && c3.includes("F3"));
}

/* ===================== SAMPLE-RATE CONTROL ========================== */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: defaultHydraulics, controller: defaultController });
  sim.setMode("step");
  sim.setTarget({ x: 0.1, y: 0.55 });
  const log = new Logger({ sampleEvery: 10, maxRows: 1e6 });
  for (let i = 0; i < 1000; i++) log.capture(sim.step());
  check("sampleEvery=10 keeps ~1/10 of ticks", Math.abs(log.size() - 100) <= 1);
}

/* ===================== DECIMATION PRESERVES DURATION ================ */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: defaultHydraulics, controller: defaultController });
  sim.setMode("circle", { cx: 0, cy: 0.55, r: 0.1, omega: 2 });
  const log = new Logger({ sampleEvery: 1, maxRows: 100 });
  let lastT = 0;
  for (let i = 0; i < 2000; i++) {
    const s = sim.step();
    log.capture(s);
    lastT = s.t;
  }
  check("decimation keeps rows under cap", log.size() <= 100);
  check("decimation keeps some rows", log.size() > 10);
  const tLastLogged = log.rows[log.rows.length - 1].t;
  check("decimation preserves run duration", rel(tLastLogged, lastT, 0.05));
}

/* ===================== CSV ROUND-TRIP =============================== */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: defaultHydraulics, controller: { ...defaultController, Kp: 40 } });
  sim.setMode("step");
  sim.setTarget({ x: 0.12, y: 0.55 });
  const log = new Logger({ sampleEvery: 5, maxRows: 1e6 });
  for (let i = 0; i < 600; i++) log.capture(sim.step());

  const csv = log.toCSV();
  const trace = TwinTrace.parse(csv);
  check("CSV trace row count matches", trace.length === log.size());
  check("CSV trace infers dof=2, nLegs=2", trace.dof() === 2 && trace.nLegs() === 2);
  // compare a mid record
  const k = Math.floor(log.size() / 2);
  const orig = log.rows[k];
  const got = trace.records[k];
  check("CSV round-trip preserves x_act", rel(got.x_act, orig.x_act, 1e-5));
  check("CSV round-trip preserves L1_act", rel(got.L1_act, orig.L1_act, 1e-5));
  // cmd/act/err integrity: x_cmd - x_act == x_err
  check("cmd − act == err (x)", approx(got.x_cmd - got.x_act, got.x_err, 1e-4));
  check("channel() extracts a column", trace.channel("y_act").length === trace.length);
}

/* ===================== JSON ROUND-TRIP ============================= */
{
  const sim = buildSimulation({ geometry: defaultGeometry3DOF, hydraulics: defaultHydraulics, controller: { ...defaultController, Kp: 40 } });
  sim.setMode("step");
  sim.setTarget({ x: 0.03, y: 0.02, theta: 0.05 });
  const log = new Logger({ sampleEvery: 5, maxRows: 1e6 });
  for (let i = 0; i < 800; i++) log.capture(sim.step());

  const json = log.toJSON();
  check("JSON meta has version & dof", json.meta.schemaVersion === 1 && json.meta.dof === 3);
  const trace = TwinTrace.parse(json);
  check("JSON trace infers dof=3, nLegs=3", trace.dof() === 3 && trace.nLegs() === 3);
  const k = Math.floor(trace.length / 2);
  check("JSON round-trip preserves theta_act", rel(trace.records[k].theta_act, log.rows[k].theta_act, 1e-9));
}

/* ===================== FAULT ENCODING ============================== */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: clone(defaultHydraulics), controller: { ...defaultController, Kp: 40 } });
  sim.faultEngine = makeFaultEngine();
  const inj = new FaultInjector(sim);
  inj.reliefDrop(2e5);
  inj.payloadSpike(80);
  sim.setMode("step");
  sim.setTarget({ x: 0.05, y: 0.6 });
  const log = new Logger({ sampleEvery: 2, maxRows: 1e6 });
  for (let i = 0; i < 400; i++) log.capture(sim.step());

  const levels = new Set(log.rows.map((r) => r.faultLevel));
  check("fault level recorded (some non-ok rows)", [...levels].some((l) => l !== "ok"));
  const anyFaultKeys = log.rows.some((r) => r.faults && r.faults.includes("OVER_PRESSURE"));
  check("fault keys encoded in 'faults' column", anyFaultKeys);
  // survives CSV round-trip as a string
  const trace = TwinTrace.parse(log.toCSV());
  check("faults column round-trips as string", trace.records.some((r) => typeof r.faults === "string" && r.faults.includes("OVER_PRESSURE")));
}

/* ===================== TWINTRACE INTERPOLATION ===================== */
{
  // Hand-built trace: x_act linear in t.
  const csv = ["t,mode,x_act,y_act", "0,step,0,1", "1,step,10,1", "2,step,20,1"].join("\n");
  const tr = TwinTrace.fromCSV(csv);
  const mid = tr.at(0.5);
  check("interpolation midpoint", approx(mid.x_act, 5, 1e-9));
  const q = tr.at(1.25);
  check("interpolation between later samples", approx(q.x_act, 12.5, 1e-9));
  check("clamp before start", tr.at(-1).x_act === 0);
  check("clamp after end", tr.at(99).x_act === 20);
  check("duration", approx(tr.duration(), 2, 1e-9));
}

/* ===================== EXTERNAL HARDWARE IMPORT ==================== */
{
  // A minimal external rig log using the same schema (subset of columns is OK).
  const hw = [
    "t,mode,x_cmd,y_cmd,x_act,y_act,L1_act,L2_act,faultLevel,faults",
    "0.00,step,0.10,0.55,0.000,0.360,0.700,0.700,ok,",
    "0.50,step,0.10,0.55,0.080,0.520,0.860,0.690,warn,NEAR_SINGULAR",
    "1.00,step,0.10,0.55,0.099,0.549,0.889,0.742,ok,",
  ].join("\n");
  const tr = TwinTrace.parse(hw);
  check("external import parses rows", tr.length === 3);
  check("external import infers nLegs from columns", tr.nLegs() === 2);
  check("external import time interpolation works", approx(tr.at(0.25).x_act, 0.04, 1e-9));
  check("external import keeps fault strings", tr.records[1].faults === "NEAR_SINGULAR");
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nLogger + digital twin: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All logger tests passed. ✓");
}

export { pass, fail };
