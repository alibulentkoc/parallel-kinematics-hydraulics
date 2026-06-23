/**
 * @file student.test.js
 * Validates trace metrics, assignment integrity, self-check, and submissions.
 *
 * Run headless:   node test/student.test.js
 * Run in browser: open test/run-student.html
 */

import { TwinTrace, Logger } from "../src/logger/index.js";
import { traceMetrics, twinAccuracy, dutyCycleOf, ASSIGNMENTS, getAssignment, listAssignments, selfCheck, makeSubmission } from "../src/student/index.js";
import { PresetManager } from "../src/presets/index.js";
import { buildSimulation } from "../src/sim/index.js";
import { makeFaultEngine } from "../src/faults/index.js";

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

/* synthetic trace helper: 2-DOF step along x, optional overshoot */
function stepTrace({ target = 1, peak = null, settleAt = 1.0, dur = 2.0, dt = 0.1 } = {}) {
  const cols = "t,mode,x_cmd,y_cmd,x_act,y_act,x_err,y_err,errNorm,manip,faultLevel,pumpSaturated";
  const rows = [cols];
  for (let t = 0; t <= dur + 1e-9; t += dt) {
    let x;
    if (t < settleAt) x = (target * t) / settleAt; // ramp to target by settleAt
    else if (peak != null && t < settleAt + 0.3) x = peak; // brief overshoot
    else x = target;
    const err = Math.abs(target - x);
    rows.push(`${t.toFixed(2)},step,${target},0,${x.toFixed(4)},0,${(target - x).toFixed(4)},0,${err.toFixed(4)},0.5,ok,0`);
  }
  return TwinTrace.fromCSV(rows.join("\n"));
}

/* ===================== METRICS ===================================== */
{
  const tr = stepTrace({ target: 1, settleAt: 1.0, dur: 2.0 });
  const m = traceMetrics(tr);
  check("metrics finalErr ~ 0 for settled step", m.finalErr < 1e-6);
  check("metrics stepSize ~ 1", approx(m.stepSize, 1, 1e-6));
  check("metrics settleTime ~ 1.0", Math.abs(m.settleTime - 1.0) < 0.2);
  check("metrics no overshoot on clean step", m.overshoot < 1e-6);
  check("metrics meanErr positive", m.meanErr > 0);

  const ov = stepTrace({ target: 1, peak: 1.25, settleAt: 1.0, dur: 2.0 });
  const mo = traceMetrics(ov);
  check("metrics detects overshoot (~25%)", mo.overshoot > 0.2 && mo.overshoot < 0.35);
}

/* ===================== ASSIGNMENT INTEGRITY ======================== */
{
  const pm = new PresetManager();
  let ok = true;
  for (const a of ASSIGNMENTS) {
    if (!pm.has(a.presetId)) {
      ok = false;
      console.error(`    ${a.id} references missing preset ${a.presetId}`);
    }
    if (pm.get(a.presetId).dof !== a.dof) {
      ok = false;
      console.error(`    ${a.id} dof mismatch with preset`);
    }
    if (!a.criteria.length) ok = false;
  }
  check("every assignment references a valid preset with matching dof", ok);
  check("listAssignments filters by level", listAssignments("midterm").every((a) => a.level === "midterm") && listAssignments("final").length >= 3);
  check("getAssignment returns by id", getAssignment("M1").title === "Point positioning");
}

/* ===================== SELF-CHECK ON REAL RUNS ===================== */
function runTask(assignment, controllerOverride = {}) {
  const pm = new PresetManager();
  const b = pm.apply(assignment.presetId);
  const sim = buildSimulation({ geometry: b.geometry, hydraulics: b.hydraulics, controller: { ...b.controller, ...controllerOverride } });
  sim.faultEngine = makeFaultEngine(b.faultConfig);
  const log = new Logger({ sampleEvery: 5, maxRows: 1e6 });
  const sc = assignment.scenario;
  if (sc.mode === "circle") sim.setMode("circle", sc.params);
  else {
    sim.setMode("step");
    sim.setTarget(sc.target);
  }
  for (let i = 0; i < Math.round(sc.seconds / sim.dt); i++) log.capture(sim.step());
  return TwinTrace.parse(log.toJSON());
}

{
  const a = getAssignment("M1");
  const good = selfCheck(a, runTask(a, { Kp: 60 }));
  check("M1 converge passes with good Kp", good.find((c) => c.id === "converge").pass);

  const bad = selfCheck(a, runTask(a, { Kp: 3 })); // sluggish
  check("M1 settle fails with tiny Kp (formative)", !bad.find((c) => c.id === "settle").pass);
}
{
  const a = getAssignment("M2"); // unreachable
  const r = selfCheck(a, runTask(a, { Kp: 40 }));
  check("M2 flags unreachable + stays finite", r.find((c) => c.id === "flagged").pass && r.find((c) => c.id === "finite").pass);
}
{
  const a = getAssignment("F1");
  const r = selfCheck(a, runTask(a, { Kp: 50 }));
  check("F1 converges (3-DOF)", r.find((c) => c.id === "converge").pass);
}
{
  const a = getAssignment("F4"); // singular diamond
  const r = selfCheck(a, runTask(a, { Kp: 40 }));
  check("F4 detects near-singular pose", r.find((c) => c.id === "found").pass);
}

/* ===================== SUBMISSION SHAPE ============================ */
{
  const a = getAssignment("M1");
  const pm = new PresetManager();
  const b = pm.apply(a.presetId);
  const sim = buildSimulation({ geometry: b.geometry, hydraulics: b.hydraulics, controller: { ...b.controller, Kp: 50 } });
  const log = new Logger({ sampleEvery: 5, maxRows: 1e6 });
  sim.setMode("step");
  sim.setTarget(a.scenario.target);
  for (let i = 0; i < 200; i++) log.capture(sim.step());
  const sub = makeSubmission({ studentId: "stu-123", taskId: a.id }, log);
  check("submission has meta with student + task + dof", sub.meta.studentId === "stu-123" && sub.meta.taskId === "M1" && sub.meta.dof === 2);
  check("submission carries canonical columns + rows", Array.isArray(sub.columns) && sub.columns.includes("errNorm") && sub.rows.length > 0);
  // and it round-trips back into a TwinTrace the grader can read
  const tr = TwinTrace.fromJSON({ meta: sub.meta, columns: sub.columns, rows: sub.rows });
  check("submission re-parses as a TwinTrace", tr.length === sub.rows.length && tr.dof() === 2);
}

/* ===================== TWIN ACCURACY METRICS (C15) ===================== */
{
  const a = getAssignment("M1");
  const twin = runTask(a); // reference twin run
  const same = runTask(a); // identical run → near-perfect agreement
  const off = runTask(a, { Kp: 8 }); // detuned run → measurable divergence

  // single-trace additions
  const m = traceMetrics(twin);
  check("traceMetrics exposes rmsErr ≥ meanErr", Number.isFinite(m.rmsErr) && m.rmsErr >= m.meanErr - 1e-9);
  check("traceMetrics dutyCycle in [0,1]", Number.isFinite(m.dutyCycle) && m.dutyCycle >= 0 && m.dutyCycle <= 1);

  // twin vs identical reference
  const id = twinAccuracy(twin, same);
  check("twinAccuracy posRMSE ~ 0 for identical traces", id.posRMSE < 1e-9);
  check("twinAccuracy pressureRMSE ~ 0 for identical traces", !(id.pressureRMSE > 1e-6));
  check("twinAccuracy settleTimeDiff ~ 0 for identical traces", id.settleTimeDiff < 1e-9);
  check("twinAccuracy reports pressurePctErr (finite or NaN, not negative)", Number.isNaN(id.pressurePctErr) || id.pressurePctErr >= 0);

  // twin vs detuned reference → divergence is detected
  const dv = twinAccuracy(twin, off);
  check("twinAccuracy posRMSE > 0 for divergent traces", dv.posRMSE > id.posRMSE);

  // duty cycle is well-defined on a real run
  check("dutyCycleOf finite on a real trace", Number.isFinite(dutyCycleOf(twin)));
}


if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All student tests passed. ✓");
}

export { pass, fail };
