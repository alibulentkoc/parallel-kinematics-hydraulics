/**
 * @file schema.js
 * The canonical, versioned telemetry schema. One ordering of named columns,
 * derived from (dof, nLegs), used by BOTH the simulator's export and any
 * external/hardware "digital twin" import — so a student rig log and an
 * answer-key sim log are directly comparable.
 *
 * Column groups (in order):
 *   t, mode
 *   <pose>_cmd ... | <pose>_act ... | <pose>_err ... | errNorm
 *   per leg i:  L{i}_cmd L{i}_act e{i} u{i} uEff{i} Q{i} P{i} sDot{i} stroke{i} F{i}
 *   manip pumpScale pumpSaturated fkOk reachable
 *   faultLevel faults
 *
 * cmd = commanded (from IK of the target); act = actual (FK of integrated state);
 * err = cmd − act. P{i} is leg load pressure; F{i} is leg force; faults is a
 * '|'-joined list of active fault keys (comma-free by construction).
 */

export const SCHEMA_VERSION = 1;

const SEVERITY_RANK = { ok: 0, warn: 1, limit: 2, fault: 3 };

/** Pose component keys for a given DOF. */
export function poseKeys(dof) {
  return dof === 3 ? ["x", "y", "theta"] : ["x", "y"];
}

/** Per-leg channel suffixes, in order. */
const LEG_FIELDS = ["L%_cmd", "L%_act", "e%", "u%", "uEff%", "Q%", "P%", "sDot%", "stroke%", "F%"];

/**
 * Ordered column names for a (dof, nLegs) configuration.
 * @param {2|3} dof @param {number} nLegs @returns {string[]}
 */
export function schemaColumns(dof, nLegs) {
  const pk = poseKeys(dof);
  const cols = ["t", "mode"];
  for (const k of pk) cols.push(`${k}_cmd`);
  for (const k of pk) cols.push(`${k}_act`);
  for (const k of pk) cols.push(`${k}_err`);
  cols.push("errNorm");
  for (let i = 1; i <= nLegs; i++)
    for (const f of LEG_FIELDS) cols.push(f.replace("%", String(i)));
  cols.push("manip", "pumpScale", "pumpSaturated", "fkOk", "reachable", "faultLevel", "faults");
  return cols;
}

/** Highest active severity label across a faults array ('ok' if none). */
export function faultLevelOf(faults) {
  if (!faults || !faults.length) return "ok";
  let label = "ok";
  let rank = 0;
  for (const f of faults) {
    const r = SEVERITY_RANK[f.severity] ?? 0;
    if (r > rank) {
      rank = r;
      label = f.severity;
    }
  }
  return label;
}

/**
 * Flatten a Simulation snapshot into one schema-keyed row object.
 * @param {object} s snapshot
 * @returns {Object<string, number|string>}
 */
export function flattenSnapshot(s) {
  const pk = poseKeys(s.dof);
  const row = { t: s.t, mode: s.mode };
  pk.forEach((k) => (row[`${k}_cmd`] = s.targetPose[k]));
  pk.forEach((k) => (row[`${k}_act`] = s.poseAct[k]));
  pk.forEach((k, idx) => (row[`${k}_err`] = s.poseErr[idx]));
  row.errNorm = s.poseErrNorm;
  for (let i = 0; i < s.nLegs; i++) {
    const n = i + 1;
    row[`L${n}_cmd`] = s.Lcmd[i];
    row[`L${n}_act`] = s.Lact[i];
    row[`e${n}`] = s.e[i];
    row[`u${n}`] = s.u[i];
    row[`uEff${n}`] = s.uEff[i];
    row[`Q${n}`] = s.Q[i];
    row[`P${n}`] = s.pLoad[i];
    row[`sDot${n}`] = s.sDot[i];
    row[`stroke${n}`] = s.stroke[i];
    row[`F${n}`] = s.force[i];
  }
  row.manip = s.manip;
  row.pumpScale = s.pumpScale;
  row.pumpSaturated = s.pumpSaturated ? 1 : 0;
  row.fkOk = s.fkOk ? 1 : 0;
  row.reachable = s.reachable.ok ? 1 : 0;
  row.faultLevel = faultLevelOf(s.faults);
  row.faults = s.faults && s.faults.length ? s.faults.map((f) => f.key).join("|") : "";
  return row;
}
