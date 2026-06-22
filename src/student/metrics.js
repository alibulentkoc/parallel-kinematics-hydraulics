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
  if (!n) return { dof, n: 0, finalErr: NaN, maxErr: NaN, meanErr: NaN, minManip: NaN, overshoot: 0, settleTime: 0, stepSize: 0, faultLevels: new Set(), pumpSatFrac: 0 };

  const errN = recs.map((r) => Number(r.errNorm));
  const manip = recs.map((r) => Number(r.manip));
  const t0 = Number(recs[0].t);

  let finalErr = errN[n - 1];
  let maxErr = -Infinity;
  let meanErr = 0;
  let minManip = Infinity;
  for (let i = 0; i < n; i++) {
    if (errN[i] > maxErr) maxErr = errN[i];
    meanErr += errN[i];
    if (Number.isFinite(manip[i]) && manip[i] < minManip) minManip = manip[i];
  }
  meanErr /= n;
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

  return { dof, n, finalErr, maxErr, meanErr, minManip, overshoot, settleTime, stepSize: D, faultLevels, pumpSatFrac };
}
