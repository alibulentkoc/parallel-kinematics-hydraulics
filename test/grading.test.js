/**
 * @file grading.test.js
 * Validates the grading engine: partial-credit scoring, reference comparison,
 * fault-demo detection, skip/reweight, and sim/hardware parity.
 *
 * Run headless:   node test/grading.test.js
 * Run in browser: open test/run-grading.html
 */

import { Logger, TwinTrace } from "../src/logger/index.js";
import { PresetManager } from "../src/presets/index.js";
import { buildSimulation } from "../src/sim/index.js";
import { makeFaultEngine } from "../src/faults/index.js";
import { getAssignment, makeSubmission } from "../src/student/index.js";
import { gradeSubmission, gradeBatch, getRubric, referenceRMS } from "../src/grading/index.js";

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
const pm = new PresetManager();

/** Run an assignment with a controller override, return a submission object. */
function submit(taskId, ctrl = {}, studentId = "stu") {
  const a = getAssignment(taskId);
  const b = pm.apply(a.presetId);
  const sim = buildSimulation({ geometry: b.geometry, hydraulics: b.hydraulics, controller: { ...b.controller, ...ctrl } });
  sim.faultEngine = makeFaultEngine(b.faultConfig);
  const log = new Logger({ sampleEvery: 4, maxRows: 1e6 });
  const sc = a.scenario;
  if (sc.mode === "circle") sim.setMode("circle", sc.params);
  else {
    sim.setMode("step");
    sim.setTarget(sc.target);
  }
  for (let i = 0; i < Math.round(sc.seconds / sim.dt); i++) log.capture(sim.step());
  return makeSubmission({ studentId, taskId }, log);
}

/* ===================== RUBRIC SANITY =============================== */
{
  let ok = true;
  for (const id of ["M1", "M2", "M3", "F1", "F2", "F3", "F4"]) {
    const r = getRubric(id);
    const sum = r.items.reduce((a, it) => a + it.weight, 0);
    if (sum !== 100) {
      ok = false;
      console.error(`    ${id} weights sum to ${sum}`);
    }
  }
  check("every rubric weights to 100", ok);
}

/* ===================== GOOD vs BAD M1 ============================= */
{
  const good = gradeSubmission(submit("M1", { Kp: 60 }));
  check("M1 good run scores high (≥ 85%)", good.percent >= 85);
  check("M1 accuracy item full credit", good.items.find((i) => i.id === "accuracy").score === 1);
  check("M1 report has grade letter", typeof good.grade === "string");

  const bad = gradeSubmission(submit("M1", { Kp: 3 })); // sluggish
  check("M1 sluggish run scores lower", bad.percent < good.percent);
  check("M1 sluggish settle item < full", bad.items.find((i) => i.id === "settle").score < 1);
}

/* ===================== FAULT DEMO (M2) =========================== */
{
  const r = gradeSubmission(submit("M2", { Kp: 40 })); // commands unreachable target
  check("M2 fault_demo full when unreachable shown", r.items.find((i) => i.id === "demo").score === 1);
  check("M2 finite item full (no NaN)", r.items.find((i) => i.id === "finite").score === 1);

  // a submission that never goes unreachable -> fault_demo zero
  const reachable = submit("M1", { Kp: 50 }); // M1 target is reachable
  const r2 = gradeSubmission(reachable, { rubric: getRubric("M2") });
  check("M2 fault_demo zero when unreachable not shown", r2.items.find((i) => i.id === "demo").score === 0);
}

/* ===================== TUNING TRADE-OFF (M3) ===================== */
{
  const r = gradeSubmission(submit("M3", { Kp: 45 }));
  const settle = r.items.find((i) => i.id === "settle");
  const os = r.items.find((i) => i.id === "overshoot");
  check("M3 produces partial-credit scores in [0,1]", settle.score >= 0 && settle.score <= 1 && os.score >= 0 && os.score <= 1);
}

/* ===================== REFERENCE RMS + SKIP/REWEIGHT (F3) ========= */
{
  const ref = TwinTrace.parse(JSON.parse(JSON.stringify(submit("F3", { Kp: 50, enableFF: true }))));
  // near-identical student -> low RMS -> high ref score
  const stuGood = submit("F3", { Kp: 50, enableFF: true });
  const rGood = gradeSubmission(stuGood, { reference: ref });
  check("F3 reference RMS item scores high for matching run", rGood.items.find((i) => i.id === "ref").score > 0.8);

  // divergent student -> higher RMS -> lower score
  const stuBad = submit("F3", { Kp: 12 });
  const rBad = gradeSubmission(stuBad, { reference: ref });
  check("F3 reference RMS lower for divergent run", rBad.items.find((i) => i.id === "ref").score < rGood.items.find((i) => i.id === "ref").score);

  // no reference -> ref item skipped & reweighted out (applicable < 100)
  const rNoRef = gradeSubmission(stuGood);
  check("F3 reference item skipped without reference", rNoRef.items.find((i) => i.id === "ref").skipped === true);
  check("F3 applicable total excludes skipped weight", rNoRef.applicableTotal === 50);
}

/* ===================== F4 SINGULARITY ============================ */
{
  const r = gradeSubmission(submit("F4", { Kp: 40 }));
  check("F4 reach item full (min w below 0.02)", r.items.find((i) => i.id === "reach").score === 1);
  check("F4 singularity flagged", r.items.find((i) => i.id === "flag").score === 1);
}

/* ===================== HARDWARE-CSV PARITY ======================= */
{
  // A minimal external rig log graded with the SAME path as a sim submission.
  const csv = [
    "t,mode,x_cmd,y_cmd,x_act,y_act,x_err,y_err,errNorm,manip,faultLevel,faults,pumpSaturated",
    "0.0,step,0.14,0.58,0.000,0.360,0.140,0.220,0.262,0.80,ok,,0",
    "0.5,step,0.14,0.58,0.110,0.540,0.030,0.040,0.050,0.70,ok,,0",
    "1.0,step,0.14,0.58,0.139,0.579,0.001,0.001,0.0014,0.69,ok,,0",
    "1.5,step,0.14,0.58,0.140,0.580,0.000,0.000,0.0005,0.69,ok,,0",
    "2.0,step,0.14,0.58,0.140,0.580,0.000,0.000,0.0004,0.69,ok,,0",
  ].join("\n");
  // pad to >=20 samples so completeness passes
  const rows = csv.split("\n");
  const header = rows[0];
  let body = rows.slice(1);
  while (body.length < 24) body.push(`${(2 + body.length * 0.1).toFixed(1)},step,0.14,0.58,0.140,0.580,0,0,0.0004,0.69,ok,,0`);
  const full = [header, ...body].join("\n");

  const report = gradeSubmission(full, { rubric: getRubric("M1") });
  check("hardware CSV grades through the same path", typeof report.percent === "number");
  check("hardware CSV (accurate, settled) scores well", report.percent >= 80);
  check("hardware CSV report exposes metrics", Number.isFinite(report.metrics.finalErr));
}

/* ===================== BATCH ==================================== */
{
  const subs = [submit("M1", { Kp: 60 }, "a"), submit("M1", { Kp: 30 }, "b"), submit("M1", { Kp: 8 }, "c")];
  const { reports, stats } = gradeBatch(subs);
  check("batch grades all submissions", reports.length === 3 && reports.every((r) => typeof r.percent === "number"));
  check("batch stats compute mean", stats.n === 3 && stats.mean >= 0 && stats.mean <= 100);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nGrading engine: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All grading tests passed. ✓");
}

export { pass, fail };
