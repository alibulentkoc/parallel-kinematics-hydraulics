/**
 * @file rubric.js
 * Per-task grading rubrics. Unlike the student self-check (binary, with hints),
 * a rubric awards weighted partial credit. Item types:
 *
 *   threshold     score ramps from 1 (at `good`) to 0 (at `bad`) on a metric.
 *                 direction 'below' = smaller is better (default); 'above' flips.
 *   binary        predicate(metrics, ctx) -> full or zero.
 *   no_fault      full credit iff no fault-level events occurred.
 *   fault_demo    full credit iff a required fault id (or any of a list) appears.
 *   completeness  full credit iff the trace has enough samples.
 *   reference_rms score from RMS pose deviation vs an answer-key trace; SKIPPED
 *                 (reweighted out) if no reference is supplied.
 *
 * Weights sum to 100 per task. reference_rms tasks renormalize when skipped.
 */

export const RUBRICS = {
  M1: {
    taskId: "M1",
    title: "Point positioning (2-DOF)",
    items: [
      { id: "accuracy", label: "Tracking accuracy (final error)", type: "threshold", metric: "finalErr", good: 3e-3, bad: 2e-2, weight: 50 },
      { id: "settle", label: "Settling time", type: "threshold", metric: "settleTime", good: 1.5, bad: 3.0, weight: 25 },
      { id: "clean", label: "No fault-level events", type: "no_fault", weight: 15 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 20, weight: 10 },
    ],
  },
  M2: {
    taskId: "M2",
    title: "Workspace limits (2-DOF)",
    items: [
      { id: "demo", label: "Unreachable command demonstrated", type: "fault_demo", faultId: "UNREACHABLE", weight: 50 },
      { id: "finite", label: "State stays finite (no NaN)", type: "binary", predicate: (m) => Number.isFinite(m.finalErr), weight: 30 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 15, weight: 20 },
    ],
  },
  M3: {
    taskId: "M3",
    title: "Tuning trade-off (2-DOF)",
    items: [
      { id: "settle", label: "Settling time", type: "threshold", metric: "settleTime", good: 1.3, bad: 2.5, weight: 40 },
      { id: "overshoot", label: "Overshoot", type: "threshold", metric: "overshoot", good: 0.1, bad: 0.4, weight: 40 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 20, weight: 20 },
    ],
  },
  F1: {
    taskId: "F1",
    title: "Pose + orientation (3-DOF)",
    items: [
      { id: "accuracy", label: "Pose accuracy (final error)", type: "threshold", metric: "finalErr", good: 5e-3, bad: 3e-2, weight: 50 },
      { id: "clean", label: "No fault-level events", type: "no_fault", weight: 25 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 20, weight: 25 },
    ],
  },
  F2: {
    taskId: "F2",
    title: "Orientation sweep (3-DOF)",
    items: [
      { id: "theta", label: "Orientation accuracy (final error)", type: "threshold", metric: "finalErr", good: 0.01, bad: 0.08, weight: 70 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 20, weight: 30 },
    ],
  },
  F3: {
    taskId: "F3",
    title: "Trajectory tracking (3-DOF)",
    items: [
      { id: "ref", label: "Deviation vs answer key (RMS)", type: "reference_rms", good: 5e-3, bad: 3e-2, weight: 50 },
      { id: "track", label: "Mean tracking error", type: "threshold", metric: "meanErr", good: 0.012, bad: 0.05, weight: 30 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 30, weight: 20 },
    ],
  },
  F4: {
    taskId: "F4",
    title: "Find a singularity (3-DOF)",
    items: [
      { id: "reach", label: "Reached near-singular pose (min w)", type: "threshold", metric: "minManip", good: 0.02, bad: 0.1, direction: "below", weight: 60 },
      { id: "flag", label: "Singularity flagged", type: "fault_demo", faultId: ["SINGULAR", "NEAR_SINGULAR"], weight: 20 },
      { id: "complete", label: "Submission completeness", type: "completeness", minRows: 15, weight: 20 },
    ],
  },
};

/** @param {string} taskId @returns {object|null} */
export function getRubric(taskId) {
  return RUBRICS[taskId] || null;
}
