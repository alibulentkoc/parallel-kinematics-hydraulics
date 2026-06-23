/**
 * @file metrics.js
 * Quantitative metrics extracted from a TwinTrace. These are the numbers both
 * the student self-check (Module 9) and the grading engine (Module 10) reason
 * about, so they live in one place and operate purely on a trace.
 */

import * as M from "../math/index.js";

const vget = (rec, keys, suf) => keys.map((k) => Number(rec[k + suf]));

/**
 * @param {import("../logger/trace.js").TwinTrace} trace
 * @returns {object} metrics
 */
export function traceMetrics(trace) {
  const dof = trace.dof();
  const keys = dof === 3 ? ["x", "y", "theta"] : ["x", "y"];
  const recs = trace.records;
  const n = recs.length;
  if (!n) return { dof, n: 0, finalErr: NaN, maxErr: NaN, meanErr: NaN, rmsErr: NaN, minManip: NaN, overshoot: 0, settleTime: 0, stepSize: 0, dutyCycle: NaN, faultLevels: new Set(), pumpSatFrac: 0 };

  const errN = recs.map((r) => Number(r.errNorm));
  const manip = recs.map((r) => Number(r.manip));
  const t0 = Number(recs[0].t);

  let finalErr = errN[n - 1];
  let maxErr = -Infinity;
  let meanErr = 0;
  let sumSqErr = 0;
  let minManip = Infinity;
  for (let i = 0; i < n; i++) {
    if (errN[i] > maxErr) maxErr = errN[i];
    meanErr += errN[i];
    sumSqErr += errN[i] * errN[i];
    if (Number.isFinite(manip[i]) && manip[i] < minManip) minManip = manip[i];
  }
  meanErr /= n;
  const rmsErr = Math.sqrt(sumSqErr / n);
  if (!Number.isFinite(minManip)) minManip = NaN;

  // Overshoot (step assumption): how far past the target the actual pose travels,
  // projected onto the start→target axis, as a fraction of step size.
  const start = vget(recs[0], keys, "_act");
  const target = vget(recs[n - 1], keys, "_cmd");
  const D = M.dist(start, target);
  let beyond = 0;
  if (D > 1e-9) {
    const dir = M.scale(M.sub(target, start), 1 / D);
    for (const r of recs) {
      const proj = M.dot(M.sub(vget(r, keys, "_act"), start), dir);
      if (proj - D > beyond) beyond = proj - D;
    }
  }
  const overshoot = D > 1e-6 ? beyond / D : 0;

  // Settling time: last instant errNorm exceeds a tolerance band.
  const tol = Math.max(2e-3, 0.02 * D);
  let settleTime = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (errN[i] > tol) {
      settleTime = (i + 1 < n ? Number(recs[i + 1].t) : Number(recs[i].t)) - t0;
      break;
    }
  }

  const faultLevels = new Set(recs.map((r) => r.faultLevel).filter((l) => l && l !== "ok"));
  const pumpSatFrac = recs.reduce((s, r) => s + (Number(r.pumpSaturated) ? 1 : 0), 0) / n;

  return { dof, n, finalErr, maxErr, meanErr, rmsErr, minManip, overshoot, settleTime, stepSize: D, dutyCycle: dutyCycleOf(trace), faultLevels, pumpSatFrac };
}

/* ===================================================================== *
 * Twin Accuracy metrics (competency C15). Quantify how well the digital
 * twin reproduces a reference ("rig") log. Because schema.js fixes one
 * column ordering for both sim export and hardware import, a twin trace
 * and a rig trace are directly row-comparable.
 * ===================================================================== */

/** Effective-spool magnitude above which an on/off valve counts as energized. */
const EPS_ON = 1e-3;

/** Number of legs for this machine (2-RPR → 2, 3-RPR → 3). */
function nLegsOf(trace) {
  return trace.dof() === 3 ? 3 : 2;
}

/**
 * Mean energized fraction across legs over a trace — the realized PWM/on-off
 * duty cycle. Uses uEff{i} (post-valve-model effective spool), so PWM ripple
 * and bang-bang switching are reflected. NaN if no uEff channels are present.
 */
export function dutyCycleOf(trace) {
  const recs = trace.records;
  const n = recs.length;
  if (!n) return NaN;
  const nl = nLegsOf(trace);
  let on = 0,
    tot = 0;
  for (const r of recs) {
    for (let i = 1; i <= nl; i++) {
      const u = Number(r["uEff" + i]);
      if (Number.isFinite(u)) {
        tot++;
        if (Math.abs(u) > EPS_ON) on++;
      }
    }
  }
  return tot ? on / tot : NaN;
}

/**
 * Compare a twin trace against a reference/rig trace.
 * @param {import("../logger/trace.js").TwinTrace} twin
 * @param {import("../logger/trace.js").TwinTrace} ref
 * @returns {{n:number, posRMSE:number, settleTimeDiff:number,
 *   settleTimeTwin:number, settleTimeRef:number,
 *   dutyCycleTwin:number, dutyCycleRef:number,
 *   pressureRMSE:number, pressurePctErr:number}}
 *   posRMSE [m] (planar; theta included for 3-DOF in mixed units, document in report),
 *   pressureRMSE [Pa], pressurePctErr [%] of mean |reference pressure|.
 */
export function twinAccuracy(twin, ref) {
  const tr = twin.records,
    rr = ref.records;
  const n = Math.min(tr.length, rr.length);
  const dof = twin.dof();
  const keys = dof === 3 ? ["x", "y", "theta"] : ["x", "y"];
  const nl = nLegsOf(twin);
  if (!n)
    return { n: 0, posRMSE: NaN, settleTimeDiff: NaN, settleTimeTwin: NaN, settleTimeRef: NaN, dutyCycleTwin: NaN, dutyCycleRef: NaN, pressureRMSE: NaN, pressurePctErr: NaN };

  let sumPos = 0;
  let sumP = 0,
    cntP = 0,
    sumRefAbsP = 0,
    cntRefP = 0;
  for (let i = 0; i < n; i++) {
    const a = keys.map((k) => Number(tr[i][k + "_act"]));
    const b = keys.map((k) => Number(rr[i][k + "_act"]));
    let d2 = 0;
    for (let j = 0; j < a.length; j++) {
      const d = a[j] - b[j];
      d2 += d * d;
    }
    sumPos += d2;
    for (let L = 1; L <= nl; L++) {
      const pt = Number(tr[i]["P" + L]),
        pr = Number(rr[i]["P" + L]);
      if (Number.isFinite(pt) && Number.isFinite(pr)) {
        const dp = pt - pr;
        sumP += dp * dp;
        cntP++;
      }
      if (Number.isFinite(pr)) {
        sumRefAbsP += Math.abs(pr);
        cntRefP++;
      }
    }
  }

  const posRMSE = Math.sqrt(sumPos / n);
  const pressureRMSE = cntP ? Math.sqrt(sumP / cntP) : NaN;
  const meanRefP = cntRefP ? sumRefAbsP / cntRefP : NaN;
  const pressurePctErr = cntP && meanRefP > 1e-9 ? (100 * pressureRMSE) / meanRefP : NaN;

  const settleTimeTwin = traceMetrics(twin).settleTime;
  const settleTimeRef = traceMetrics(ref).settleTime;

  return {
    n,
    posRMSE,
    settleTimeDiff: Math.abs(settleTimeTwin - settleTimeRef),
    settleTimeTwin,
    settleTimeRef,
    dutyCycleTwin: dutyCycleOf(twin),
    dutyCycleRef: dutyCycleOf(ref),
    pressureRMSE,
    pressurePctErr,
  };
}
