/**
 * @file grader.js
 * The grading engine (requirement #14). It scores a submission against a rubric,
 * optionally comparing to an answer-key reference. Because it consumes a
 * TwinTrace and the shared traceMetrics, a simulator submission and a real bench
 * log grade through exactly the same path.
 */

import { TwinTrace } from "../logger/index.js";
import { traceMetrics } from "../student/index.js";
import { getRubric } from "./rubric.js";

/* --- input normalization --------------------------------------------- */
/** Accept a TwinTrace, a submission object {meta,columns,rows}, or CSV/JSON text. */
function toTrace(input) {
  if (input instanceof TwinTrace) return input;
  if (typeof input === "string") return TwinTrace.parse(input);
  if (input && Array.isArray(input.columns) && Array.isArray(input.rows)) return TwinTrace.fromJSON(input);
  throw new Error("grader: unrecognized submission format");
}

/** Distinct base fault ids that appear anywhere in a trace's `faults` column. */
function faultIdsOf(trace) {
  const set = new Set();
  for (const r of trace.records) {
    const f = r.faults;
    if (f && typeof f === "string" && f.length) for (const k of f.split("|")) set.add(k.split(":")[0]);
  }
  return set;
}

/** RMS pose deviation (actual) between a submission and a reference, over overlap. */
export function referenceRMS(trace, ref) {
  const dof = trace.dof();
  const keys = dof === 3 ? ["x", "y", "theta"] : ["x", "y"];
  const T = trace.times();
  const R = ref.times();
  const t0 = Math.max(T[0], R[0]);
  const t1 = Math.min(T[T.length - 1], R[R.length - 1]);
  if (!(t1 > t0)) return Infinity;
  let se = 0;
  let n = 0;
  for (let t = t0; t <= t1; t += 0.02) {
    const a = trace.at(t);
    const b = ref.at(t);
    let s = 0;
    for (const k of keys) {
      const d = Number(a[k + "_act"]) - Number(b[k + "_act"]);
      s += d * d;
    }
    se += s;
    n++;
  }
  return Math.sqrt(se / Math.max(1, n));
}

/* --- scoring ---------------------------------------------------------- */
function scoreThreshold(value, good, bad, dir = "below") {
  if (!Number.isFinite(value)) return 0;
  if (dir === "below") {
    if (value <= good) return 1;
    if (value >= bad) return 0;
    return (bad - value) / (bad - good);
  }
  if (value >= good) return 1;
  if (value <= bad) return 0;
  return (value - bad) / (good - bad);
}

function evalItem(item, ctx) {
  const base = { id: item.id, label: item.label, weight: item.weight, type: item.type };
  const done = (score, detail) => ({ ...base, score: Math.max(0, Math.min(1, score)), points: Math.max(0, Math.min(1, score)) * item.weight, detail, skipped: false });
  const skip = (detail) => ({ ...base, score: 0, points: 0, detail, skipped: true });

  switch (item.type) {
    case "threshold": {
      const v = ctx.metrics[item.metric];
      const s = scoreThreshold(v, item.good, item.bad, item.direction || "below");
      const fmt = Number.isFinite(v) ? (Math.abs(v) < 1e-2 ? v.toExponential(2) : v.toFixed(3)) : "—";
      return done(s, `${item.metric} = ${fmt} (full ≤ ${item.good}, zero ≥ ${item.bad})`);
    }
    case "binary": {
      const ok = !!item.predicate(ctx.metrics, ctx);
      return done(ok ? 1 : 0, ok ? "met" : "not met");
    }
    case "no_fault": {
      const ok = !ctx.metrics.faultLevels.has("fault");
      return done(ok ? 1 : 0, ok ? "no fault-level events" : `fault-level events present (${[...ctx.metrics.faultLevels].join(",")})`);
    }
    case "fault_demo": {
      const ids = Array.isArray(item.faultId) ? item.faultId : [item.faultId];
      const ok = ids.some((id) => ctx.faultIds.has(id));
      return done(ok ? 1 : 0, ok ? `${ids.find((id) => ctx.faultIds.has(id))} demonstrated` : `${ids.join("/")} not observed`);
    }
    case "completeness": {
      const ok = ctx.metrics.n >= (item.minRows || 10);
      return done(ok ? 1 : 0, `${ctx.metrics.n} samples (need ≥ ${item.minRows || 10})`);
    }
    case "reference_rms": {
      if (!ctx.reference) return skip("no reference provided — item reweighted out");
      const rms = referenceRMS(ctx.trace, ctx.reference);
      const s = scoreThreshold(rms, item.good, item.bad, "below");
      return done(s, `RMS ${(rms * 1000).toFixed(1)} mm vs reference`);
    }
    default:
      return skip(`unknown item type ${item.type}`);
  }
}

function letter(p) {
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

/**
 * Grade a submission.
 * @param {object|string} input submission (TwinTrace | {meta,columns,rows} | CSV/JSON text)
 * @param {object} [opts]
 * @param {object} [opts.rubric]    explicit rubric (else derived from taskId)
 * @param {object} [opts.assignment] assignment (provides id if rubric omitted)
 * @param {object|string} [opts.reference] answer-key trace for reference_rms items
 * @returns {object} grade report
 */
export function gradeSubmission(input, opts = {}) {
  const trace = toTrace(input);
  const meta = input && typeof input === "object" && input.meta ? input.meta : {};
  const taskId = (opts.rubric && opts.rubric.taskId) || (opts.assignment && opts.assignment.id) || meta.taskId;
  const rubric = opts.rubric || getRubric(taskId);
  if (!rubric) throw new Error(`grader: no rubric for task '${taskId}'`);

  const reference = opts.reference ? toTrace(opts.reference) : null;
  const metrics = traceMetrics(trace);
  const faultIds = faultIdsOf(trace);
  const ctx = { metrics, trace, reference, faultIds };

  const items = rubric.items.map((it) => evalItem(it, ctx));
  let earned = 0;
  let applicable = 0;
  for (const r of items) {
    if (r.skipped) continue;
    earned += r.points;
    applicable += r.weight;
  }
  const percent = applicable > 0 ? (100 * earned) / applicable : 0;

  return {
    taskId,
    title: rubric.title || taskId,
    studentId: meta.studentId || null,
    dof: metrics.dof,
    earned: +earned.toFixed(2),
    applicableTotal: applicable,
    percent: +percent.toFixed(1),
    grade: letter(percent),
    items,
    faults: [...faultIds],
    metrics: {
      finalErr: metrics.finalErr,
      settleTime: metrics.settleTime,
      overshoot: metrics.overshoot,
      meanErr: metrics.meanErr,
      minManip: metrics.minManip,
      samples: metrics.n,
    },
  };
}

/** Grade a batch of submissions; returns reports + simple class stats. */
export function gradeBatch(submissions, opts = {}) {
  const reports = submissions.map((s) => {
    try {
      return gradeSubmission(s, opts);
    } catch (e) {
      return { error: e.message, studentId: s?.meta?.studentId || null };
    }
  });
  const scored = reports.filter((r) => !r.error);
  const mean = scored.length ? scored.reduce((a, r) => a + r.percent, 0) / scored.length : 0;
  return { reports, stats: { n: scored.length, mean: +mean.toFixed(1) } };
}
