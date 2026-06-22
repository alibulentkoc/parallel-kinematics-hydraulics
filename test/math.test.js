/**
 * @file math.test.js
 * Dependency-free unit tests for the math module.
 *
 * Run headless:   node test/math.test.js   (from the pkm-sim/ root)
 * Run in browser: open test/run-math.html
 *
 * Exits with code 1 if any assertion fails, so it is CI-friendly.
 */

import * as M from "../src/math/index.js";

/* --- tiny assertion harness (no deps) --------------------------------- */
let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(name);
    console.error("  ✗ " + name);
  }
}
function approx(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}
function matApprox(A, B, eps = 1e-9) {
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++)
    for (let j = 0; j < A[i].length; j++)
      if (!approx(A[i][j], B[i][j], eps)) return false;
  return true;
}
function vecApprox(a, b, eps = 1e-9) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!approx(a[i], b[i], eps)) return false;
  return true;
}

/* --- scalar ----------------------------------------------------------- */
check("clamp below", M.clamp(-5, 0, 10) === 0);
check("clamp above", M.clamp(50, 0, 10) === 10);
check("clamp inside", M.clamp(7, 0, 10) === 7);
check("lerp midpoint", approx(M.lerp(0, 10, 0.5), 5));
check("invLerp", approx(M.invLerp(0, 10, 5), 0.5));
check("invLerp degenerate", M.invLerp(3, 3, 3) === 0);
check("sign", M.sign(-2) === -1 && M.sign(0) === 0 && M.sign(9) === 1);
check("deg2rad/rad2deg roundtrip", approx(M.rad2deg(M.deg2rad(123)), 123));
check("deadband zeros inside", M.deadband(0.05, 0.1) === 0);
check("deadband passes outside (raw)", M.deadband(0.5, 0.1) === 0.5);
check(
  "deadband continuous shift",
  approx(M.deadband(0.5, 0.1, { continuous: true }), 0.4)
);
check("mean", approx(M.mean([2, 4, 6]), 4));
check("rms", approx(M.rms([3, 4]), Math.sqrt(12.5)));
check("maxAbs", M.maxAbs([-7, 3, 5]) === 7);

/* --- vectors ---------------------------------------------------------- */
check("add", vecApprox(M.add([1, 2], [3, 4]), [4, 6]));
check("sub", vecApprox(M.sub([5, 5], [1, 2]), [4, 3]));
check("scale", vecApprox(M.scale([1, 2, 3], 2), [2, 4, 6]));
check("dot", approx(M.dot([1, 2, 3], [4, 5, 6]), 32));
check("norm 3-4-5", approx(M.norm([3, 4]), 5));
check("dist", approx(M.dist([0, 0], [3, 4]), 5));
check("normalize unit length", approx(M.norm(M.normalize([3, 4])), 1));
check("normalize zero -> zero", vecApprox(M.normalize([0, 0]), [0, 0]));
check("cross2", approx(M.cross2([1, 0], [0, 1]), 1));

/* --- matrices --------------------------------------------------------- */
const I3 = M.identity(3);
check("identity", matApprox(M.matMul(I3, I3), I3));
check(
  "transpose",
  matApprox(M.transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]])
);
check(
  "matMul",
  matApprox(M.matMul([[1, 2], [3, 4]], [[5, 6], [7, 8]]), [[19, 22], [43, 50]])
);
check("matVec", vecApprox(M.matVec([[1, 2], [3, 4]], [1, 1]), [3, 7]));
check("det2", approx(M.det2([[1, 2], [3, 4]]), -2));
check("det3 known=1", approx(M.det3([[1, 2, 3], [0, 1, 4], [5, 6, 0]]), 1));

// inv2 round-trip
const A2 = [[4, 7], [2, 6]];
check("inv2 -> I", matApprox(M.matMul(A2, M.inv2(A2)), M.identity(2)));
// inv3 round-trip
const A3 = [[1, 2, 3], [0, 1, 4], [5, 6, 0]];
check("inv3 -> I", matApprox(M.matMul(A3, M.inv3(A3)), M.identity(3), 1e-9));
// general inv (4x4) round-trip
const A4 = [
  [2, 0, 1, 3],
  [1, 1, 0, 2],
  [0, 3, 1, 1],
  [4, 1, 2, 0],
];
check("inv 4x4 -> I", matApprox(M.matMul(A4, M.inv(A4)), M.identity(4), 1e-8));
// singular detection
let threwSingular = false;
try {
  M.inv2([[1, 2], [2, 4]]);
} catch {
  threwSingular = true;
}
check("inv2 throws on singular", threwSingular);

// solve: A x = b
const As = [[3, 2, -1], [2, -2, 4], [-1, 0.5, -1]];
const bs = [1, -2, 0];
const xs = M.solve(As, bs);
check("solve residual ~ 0", vecApprox(M.matVec(As, xs), bs, 1e-9));
check("solve known answer", vecApprox(xs, [1, -2, -2], 1e-9));

/* --- rotations -------------------------------------------------------- */
const R = M.rot2(0.6);
check("rot2 orthonormal (R Rᵀ = I)", matApprox(M.matMul(R, M.transpose(R)), M.identity(2)));
check("rot2 det = 1", approx(M.det2(R), 1));
check("rot2dot == E2·R", matApprox(M.rot2dot(0.6), M.matMul(M.E2, R)));

/* --- finite-difference Jacobian vs analytic --------------------------- */
// f(x) = [x0^2 + x1, x0*x1] ; J = [[2x0, 1], [x1, x0]]
const f = (x) => [x[0] * x[0] + x[1], x[0] * x[1]];
const xTest = [2, 3];
const Jfd = M.jacobianFD(f, xTest);
const Jan = [[2 * xTest[0], 1], [xTest[1], xTest[0]]];
check("jacobianFD matches analytic", matApprox(Jfd, Jan, 1e-5));

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nMath module: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All math tests passed. ✓");
}

export { pass, fail };
