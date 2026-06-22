/**
 * @file linalg.js
 * Vector and small-matrix linear algebra for the PKM simulator.
 *
 * Conventions
 * -----------
 * - Vectors are plain `number[]` of any length.
 * - Matrices are row-major `number[][]` (M[row][col]).
 * - All functions are pure: inputs are never mutated; new arrays are returned.
 * - Fast closed-form paths exist for 2x2 and 3x3 (the only sizes the 2-DOF and
 *   3-DOF kinematics need). A general Gaussian-elimination `solve`/`inv` is
 *   provided for completeness and for the iterative 3-DOF forward kinematics.
 * - Inversion throws on a (numerically) singular matrix. This is intentional:
 *   the caller — e.g. velocity kinematics near a singularity — should decide how
 *   to degrade. `det` is provided separately so callers can test conditioning
 *   WITHOUT triggering an exception.
 *
 * @typedef {number[]}   Vec
 * @typedef {number[][]} Mat
 */

import { EPS } from "./scalar.js";

/** Tolerance below which a determinant is treated as singular. */
const SINGULAR_EPS = 1e-12;

/* ============================ VECTORS ================================== */

/** Element-wise add. @param {Vec} a @param {Vec} b @returns {Vec} */
export function add(a, b) {
  const r = new Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] + b[i];
  return r;
}

/** Element-wise subtract (a - b). @param {Vec} a @param {Vec} b @returns {Vec} */
export function sub(a, b) {
  const r = new Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] - b[i];
  return r;
}

/** Scalar multiply. @param {Vec} a @param {number} s @returns {Vec} */
export function scale(a, s) {
  const r = new Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] * s;
  return r;
}

/** Negate. @param {Vec} a @returns {Vec} */
export function neg(a) {
  return scale(a, -1);
}

/** Dot product. @param {Vec} a @param {Vec} b @returns {number} */
export function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** Euclidean norm. @param {Vec} a @returns {number} */
export function norm(a) {
  return Math.sqrt(dot(a, a));
}

/** Distance between two points. @param {Vec} a @param {Vec} b @returns {number} */
export function dist(a, b) {
  return norm(sub(a, b));
}

/**
 * Unit vector. Returns a zero vector (not NaN) for a (near-)zero input so the
 * sim never propagates NaN; callers needing strictness should check `norm` first.
 * @param {Vec} a @returns {Vec}
 */
export function normalize(a) {
  const n = norm(a);
  if (n < EPS) return a.map(() => 0);
  return scale(a, 1 / n);
}

/**
 * Scalar (z-component) of the 2D cross product a × b.
 * Equals |a||b| sin(theta); used directly in the 2-DOF manipulability term.
 * @param {Vec} a @param {Vec} b @returns {number}
 */
export function cross2(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

/* ============================ MATRICES ================================= */

/** n x n identity. @param {number} n @returns {Mat} */
export function identity(n) {
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) M[i][i] = 1;
  return M;
}

/** Transpose (supports non-square). @param {Mat} M @returns {Mat} */
export function transpose(M) {
  const rows = M.length;
  const cols = M[0].length;
  const T = Array.from({ length: cols }, () => new Array(rows));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) T[j][i] = M[i][j];
  return T;
}

/** Matrix product A·B. @param {Mat} A @param {Mat} B @returns {Mat} */
export function matMul(A, B) {
  const n = A.length;
  const m = B[0].length;
  const k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let p = 0; p < k; p++) {
      const aip = A[i][p];
      for (let j = 0; j < m; j++) C[i][j] += aip * B[p][j];
    }
  return C;
}

/** Matrix·vector M·v. @param {Mat} M @param {Vec} v @returns {Vec} */
export function matVec(M, v) {
  const r = new Array(M.length).fill(0);
  for (let i = 0; i < M.length; i++) {
    let s = 0;
    for (let j = 0; j < v.length; j++) s += M[i][j] * v[j];
    r[i] = s;
  }
  return r;
}

/** Determinant of a 2x2. @param {Mat} M @returns {number} */
export function det2(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

/** Determinant of a 3x3 (rule of Sarrus / cofactor expansion). @param {Mat} M @returns {number} */
export function det3(M) {
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/**
 * Determinant dispatcher for the sizes we use (2 and 3).
 * Provided separately from `inv` so conditioning can be checked safely.
 * @param {Mat} M @returns {number}
 */
export function det(M) {
  const n = M.length;
  if (n === 2) return det2(M);
  if (n === 3) return det3(M);
  throw new Error(`det: only 2x2 and 3x3 supported (got ${n}x${n})`);
}

/** Inverse of a 2x2. Throws if singular. @param {Mat} M @returns {Mat} */
export function inv2(M) {
  const d = det2(M);
  if (Math.abs(d) < SINGULAR_EPS) throw new Error("inv2: singular matrix");
  const id = 1 / d;
  return [
    [M[1][1] * id, -M[0][1] * id],
    [-M[1][0] * id, M[0][0] * id],
  ];
}

/**
 * Inverse of a 3x3 via adjugate / cofactors. Throws if singular.
 * @param {Mat} M @returns {Mat}
 */
export function inv3(M) {
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  // Cofactors (signs built in).
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;
  const dt = a * A + b * B + c * C;
  if (Math.abs(dt) < SINGULAR_EPS) throw new Error("inv3: singular matrix");
  const id = 1 / dt;
  // inverse = adjugate / det ; adjugate = transpose of the cofactor matrix.
  return [
    [A * id, D * id, G * id],
    [B * id, E * id, H * id],
    [C * id, F * id, I * id],
  ];
}

/**
 * Solve A·x = b by Gaussian elimination with partial pivoting.
 * General n; used by the iterative 3-DOF forward kinematics. Throws if singular.
 * @param {Mat} A @param {Vec} b @returns {Vec}
 */
export function solve(A, b) {
  const n = A.length;
  // Augmented working copy (no input mutation).
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Partial pivot: largest magnitude in this column.
    let piv = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < SINGULAR_EPS)
      throw new Error("solve: singular matrix");
    if (piv !== col) {
      const tmp = M[col];
      M[col] = M[piv];
      M[piv] = tmp;
    }
    // Eliminate below the pivot.
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      if (factor === 0) continue;
      for (let cc = col; cc <= n; cc++) M[r][cc] -= factor * M[col][cc];
    }
  }
  // Back substitution.
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let cc = r + 1; cc < n; cc++) s -= M[r][cc] * x[cc];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * General inverse. Uses closed forms for 2x2/3x3, else column-wise solve.
 * @param {Mat} M @returns {Mat}
 */
export function inv(M) {
  const n = M.length;
  if (n === 2) return inv2(M);
  if (n === 3) return inv3(M);
  const I = identity(n);
  const R = Array.from({ length: n }, () => new Array(n));
  for (let j = 0; j < n; j++) {
    const colVec = solve(M, I.map((row) => row[j]));
    for (let i = 0; i < n; i++) R[i][j] = colVec[i];
  }
  return R;
}

/** Inverse-transpose (J^{-T}); used for the Jacobian force mapping. @param {Mat} M @returns {Mat} */
export function invT(M) {
  return transpose(inv(M));
}

/* ===================== ROTATIONS (planar) ============================== */

/** Fixed 90-degree rotation matrix E = [[0,-1],[1,0]]. (dR/dθ = E·R.) */
export const E2 = [
  [0, -1],
  [1, 0],
];

/** Planar rotation matrix R(theta). @param {number} theta radians @returns {Mat} */
export function rot2(theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s],
    [s, c],
  ];
}

/** Derivative dR/dθ = E·R(theta) = [[-s,-c],[c,-s]]. @param {number} theta @returns {Mat} */
export function rot2dot(theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [-s, -c],
    [c, -s],
  ];
}

/* ===================== TEST / DIAGNOSTIC HELPERS ======================= */

/**
 * Central-difference Jacobian of a vector function f: R^n -> R^m.
 * Used by unit tests to validate analytic Jacobians from the kinematics engine.
 * @param {(x: Vec) => Vec} f
 * @param {Vec} x
 * @param {number} [h=1e-6]
 * @returns {Mat} m x n
 */
export function jacobianFD(f, x, h = 1e-6) {
  const m = f(x).length;
  const n = x.length;
  const J = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const xp = x.slice();
    const xm = x.slice();
    xp[j] += h;
    xm[j] -= h;
    const fp = f(xp);
    const fm = f(xm);
    for (let i = 0; i < m; i++) J[i][j] = (fp[i] - fm[i]) / (2 * h);
  }
  return J;
}
