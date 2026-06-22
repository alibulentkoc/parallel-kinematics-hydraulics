/**
 * @file assignments.js
 * Student assignment definitions and self-check. Each task pins a locked preset
 * (geometry/hydraulics the student may NOT edit), a submission scenario the
 * student runs, and a set of formative criteria. The criteria are the student's
 * private hints — the graded rubric (Module 10) is separate, so students tune
 * against feedback without seeing their score.
 */

import { traceMetrics } from "./metrics.js";

/** Midterm = 2-DOF point positioner; Final = 3-DOF platform. (Design spec §8–§9.) */
export const ASSIGNMENTS = [
  {
    id: "M1",
    level: "midterm",
    dof: 2,
    title: "Point positioning",
    presetId: "baseline_2dof",
    objective: "Command the node to a target and hold it on the crosshair. Tune Kp until it settles cleanly.",
    deliverable: "Submission log of a 3 s step response.",
    scenario: { mode: "step", target: { x: 0.14, y: 0.58 }, seconds: 3 },
    criteria: [
      { id: "converge", label: "Settles within 3 mm", hint: "raise Kp", test: (m) => m.finalErr < 3e-3 },
      { id: "settle", label: "Settling time < 2.0 s", hint: "raise Kp", test: (m) => m.settleTime < 2.0 },
      { id: "clean", label: "No fault-level events", hint: "stay inside the workspace", test: (m) => !m.faultLevels.has("fault") },
    ],
  },
  {
    id: "M2",
    level: "midterm",
    dof: 2,
    title: "Workspace limits",
    presetId: "baseline_2dof",
    objective: "Command a target beyond the reachable workspace. Show the controller holds at the boundary without producing NaN.",
    deliverable: "Submission log of an unreachable command handled gracefully.",
    scenario: { mode: "step", target: { x: 0.0, y: 1.05 }, seconds: 2.5 },
    criteria: [
      { id: "flagged", label: "Target flagged unreachable", hint: "command further out", test: (m) => m.faultLevels.has("limit") },
      { id: "finite", label: "State stays finite (no NaN)", hint: "", test: (m) => Number.isFinite(m.finalErr) },
    ],
  },
  {
    id: "M3",
    level: "midterm",
    dof: 2,
    title: "Tuning trade-off",
    presetId: "baseline_2dof",
    objective: "Tune for a fast step with little overshoot — both targets at once. This is the gain trade-off.",
    deliverable: "Submission log of a tuned step response.",
    scenario: { mode: "step", target: { x: 0.18, y: 0.5 }, seconds: 3 },
    criteria: [
      { id: "fast", label: "Settling time < 1.3 s", hint: "raise Kp", test: (m) => m.settleTime < 1.3 },
      { id: "overshoot", label: "Overshoot < 20%", hint: "add Kd or lower Kp", test: (m) => m.overshoot < 0.2 },
    ],
  },
  {
    id: "F1",
    level: "final",
    dof: 3,
    title: "Pose + orientation",
    presetId: "final_3dof",
    objective: "Drive the platform to a commanded (x, y, θ). Settle on all three axes.",
    deliverable: "Submission log of a 3-DOF step response.",
    scenario: { mode: "step", target: { x: 0.05, y: 0.04, theta: 0.1 }, seconds: 4 },
    criteria: [
      { id: "converge", label: "Settles within 5 mm/rad", hint: "raise Kp", test: (m) => m.finalErr < 5e-3 },
      { id: "clean", label: "No fault-level events", hint: "avoid singular poses", test: (m) => !m.faultLevels.has("fault") },
    ],
  },
  {
    id: "F2",
    level: "final",
    dof: 3,
    title: "Orientation sweep",
    presetId: "final_3dof",
    objective: "Hold (x, y) at center and rotate to a commanded θ. Show orientation is independently controllable.",
    deliverable: "Submission log of a θ step at fixed position.",
    scenario: { mode: "step", target: { x: 0.0, y: 0.0, theta: 0.18 }, seconds: 4 },
    criteria: [{ id: "theta", label: "Settles within 0.01 rad", hint: "raise Kp", test: (m) => m.finalErr < 0.01 }],
  },
  {
    id: "F3",
    level: "final",
    dof: 3,
    title: "Trajectory tracking",
    presetId: "final_3dof",
    objective: "Track a circular path with low mean error. Feedforward helps.",
    deliverable: "Submission log of one circle traversal.",
    scenario: { mode: "circle", params: { cx: 0, cy: 0, r: 0.12, omega: 1.3 }, seconds: 5 },
    criteria: [{ id: "track", label: "Mean tracking error < 12 mm", hint: "enable feedforward / raise Kp", test: (m) => m.meanErr < 0.012 }],
  },
  {
    id: "F4",
    level: "final",
    dof: 3,
    title: "Find a singularity",
    presetId: "singular_3rpr_diamond",
    objective: "This geometry is singular along θ=0. Command θ=0 and observe det(J)→0 — the rotation DOF becomes uncontrollable.",
    deliverable: "Submission log demonstrating the singular configuration.",
    scenario: { mode: "step", target: { x: 0, y: 0.45, theta: 0 }, seconds: 3 },
    criteria: [{ id: "found", label: "Reached a near-singular pose (min w < 0.02)", hint: "command θ exactly 0", test: (m) => m.minManip < 0.02 }],
  },
];

export function listAssignments(level) {
  return ASSIGNMENTS.filter((a) => !level || a.level === level);
}
export function getAssignment(id) {
  return ASSIGNMENTS.find((a) => a.id === id);
}

/**
 * Formative self-check: run the assignment's criteria against a submission trace.
 * @returns {{id,label,hint,pass}[]}
 */
export function selfCheck(assignment, trace) {
  const m = traceMetrics(trace);
  return assignment.criteria.map((c) => ({ id: c.id, label: c.label, hint: c.hint, pass: !!c.test(m, trace) }));
}

/**
 * Build a submission bundle in the canonical schema for grading.
 * @param {object} meta {studentId, taskId, ...}
 * @param {import("../logger/logger.js").Logger} logger
 * @returns {{meta:object, columns:string[], rows:any[][]}}
 */
export function makeSubmission(meta, logger) {
  const j = logger.toJSON();
  return {
    meta: { ...meta, schemaVersion: j.meta.schemaVersion, dof: j.meta.dof, createdAt: new Date().toISOString() },
    columns: j.columns,
    rows: j.rows,
  };
}
