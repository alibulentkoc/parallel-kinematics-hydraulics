/**
 * @file kinematics.test.js
 * Validates the kinematics engine for both DOF configurations.
 *
 * Run headless:   node test/kinematics.test.js
 * Run in browser: open test/run-kinematics.html
 */

import * as M from "../src/math/index.js";
import {
  makeKinematics,
  defaultGeometry2DOF,
  defaultGeometry3DOF,
} from "../src/kinematics/index.js";

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
const approx = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
function matApprox(A, B, e = 1e-9) {
  for (let i = 0; i < A.length; i++)
    for (let j = 0; j < A[i].length; j++)
      if (!approx(A[i][j], B[i][j], e)) return false;
  return true;
}

/* ===================== 2-DOF ========================================= */
const k2 = makeKinematics(defaultGeometry2DOF);

// IK/FK round-trip over a grid of reachable poses.
let rtMax2 = 0;
let gridCount = 0;
for (let x = -0.5; x <= 0.5; x += 0.1) {
  for (let y = 0.25; y <= 0.85; y += 0.1) {
    const pose = { x, y };
    if (!k2.reachable(pose).ok) continue;
    gridCount++;
    const L = k2.ik(pose).L;
    const f = k2.fk(L);
    if (!f.ok) {
      rtMax2 = Infinity;
      break;
    }
    rtMax2 = Math.max(rtMax2, Math.hypot(f.pose.x - x, f.pose.y - y));
  }
}
check("2DOF grid had reachable poses", gridCount > 20);
check("2DOF FK(IK(P)) round-trip < 1e-9", rtMax2 < 1e-9);

// Analytic Jacobian vs finite difference.
{
  const pose = { x: 0.15, y: 0.55 };
  const Jan = k2.jacobian(pose);
  const Jfd = M.jacobianFD((v) => k2.ik({ x: v[0], y: v[1] }).L, [pose.x, pose.y]);
  check("2DOF Jacobian == finite-difference", matApprox(Jan, Jfd, 1e-5));
  // Closed-form det matches det2(J).
  check(
    "2DOF det2(J) == 2by/(L1 L2)",
    approx(M.det2(Jan), k2.manipulability(pose), 1e-9)
  );
}

// Manipulability collapses toward the base line (y -> 0).
{
  const wHi = k2.manipulability({ x: 0, y: 0.6 });
  const wLo = k2.manipulability({ x: 0, y: 0.02 });
  check("2DOF manipulability decreases near base line", wLo < wHi);
  check("2DOF manipulability == 0 on base line", k2.manipulability({ x: 0, y: 0 }) === 0);
}

// Reachability + NaN guards.
{
  const far = k2.reachable({ x: 5, y: 0.5 });
  check("2DOF far target unreachable (stroke-max)", !far.ok && far.reasons.some((r) => r.startsWith("stroke-max")));
  const below = k2.reachable({ x: 0, y: -0.1 });
  check("2DOF below-base flagged", below.reasons.includes("below-base"));
  // Non-intersecting circles => FK fails cleanly, no NaN.
  const bad = k2.fk([0.4, 0.4]); // centers 1.2 apart, radii 0.4 -> no intersection
  check("2DOF FK no-intersection -> ok:false", bad.ok === false && bad.pose === null);
  check("2DOF FK never emits NaN", bad.pose === null);
}

/* ===================== 3-DOF ========================================= */
const k3 = makeKinematics(defaultGeometry3DOF);

// IK/FK round-trip via Newton, warm-started from a small perturbation
// (guarantees convergence to the correct assembly mode).
{
  const poses = [
    { x: 0.0, y: 0.0, theta: 0.0 },
    { x: 0.08, y: 0.05, theta: 0.12 },
    { x: -0.06, y: 0.04, theta: -0.1 },
  ];
  let maxErr = 0;
  let allOk = true;
  for (const p of poses) {
    const L = k3.ik(p).L;
    const seed = { x: p.x + 0.03, y: p.y - 0.02, theta: p.theta + 0.04 };
    const f = k3.fk(L, { seed });
    if (!f.ok) {
      allOk = false;
      continue;
    }
    maxErr = Math.max(
      maxErr,
      Math.hypot(f.pose.x - p.x, f.pose.y - p.y, f.pose.theta - p.theta)
    );
  }
  check("3DOF Newton FK converged for all test poses", allOk);
  check("3DOF FK(IK(q)) round-trip < 1e-7", maxErr < 1e-7);
}

// Analytic 3x3 Jacobian vs finite difference (includes the orientation column).
{
  const pose = { x: 0.05, y: 0.04, theta: 0.15 };
  const Jan = k3.jacobian(pose);
  const Jfd = M.jacobianFD(
    (v) => k3.ik({ x: v[0], y: v[1], theta: v[2] }).L,
    [pose.x, pose.y, pose.theta]
  );
  check("3DOF Jacobian == finite-difference", matApprox(Jan, Jfd, 1e-5));
  check("3DOF manipulability > 0 at home-ish pose", k3.manipulability(pose) > 1e-4);
}

// Stroke reachability still works in 3-DOF.
{
  const r = k3.reachable({ x: 0, y: 3.0, theta: 0 });
  check("3DOF far target unreachable", !r.ok);
}

// FK singular path returns cleanly (no throw escaping the engine).
{
  // Feed lengths that cannot be satisfied; expect ok:false, never a thrown error.
  let threw = false;
  let res;
  try {
    res = k3.fk([10, 10, 10], { seed: k3.home(), maxIter: 10 });
  } catch {
    threw = true;
  }
  check("3DOF FK never throws", !threw);
  check("3DOF unsatisfiable FK -> ok:false", res && res.ok === false);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nKinematics engine: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All kinematics tests passed. ✓");
}

export { pass, fail };
