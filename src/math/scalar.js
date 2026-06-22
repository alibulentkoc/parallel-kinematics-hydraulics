/**
 * @file scalar.js
 * Stateless scalar/array numeric helpers used across the simulator.
 *
 * Design notes
 * ------------
 * - Pure functions only. No hidden state, no mutation of inputs.
 * - Stateful constructs (hysteresis, PWM switching) deliberately live in the
 *   hydraulic engine, not here, so the math layer stays trivially testable.
 * - `deadband` is here (it is a memoryless map); hysteresis is NOT.
 */

/** Default tolerance for floating-point comparisons. */
export const EPS = 1e-9;

/**
 * Clamp a value to the inclusive range [lo, hi].
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
export function clamp(x, lo, hi) {
  if (x < lo) return lo;
  if (x > hi) return hi;
  return x;
}

/**
 * Linear interpolation. t is NOT clamped (caller decides if extrapolation is ok).
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Inverse lerp: where does x sit between a and b, as a fraction?
 * Returns 0 when a === b to avoid division by zero.
 * @param {number} a
 * @param {number} b
 * @param {number} x
 * @returns {number}
 */
export function invLerp(a, b, x) {
  const d = b - a;
  return Math.abs(d) < EPS ? 0 : (x - a) / d;
}

/**
 * Signum: -1, 0, or +1.
 * @param {number} x
 * @returns {-1|0|1}
 */
export function sign(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

/**
 * Symmetric deadband. Magnitudes within ±db map to 0.
 * @param {number} x
 * @param {number} db  half-width of the deadband (>= 0)
 * @param {object} [opts]
 * @param {boolean} [opts.continuous=false]  if true, output is shifted so it is
 *   continuous at the band edges (output starts at 0 just past ±db) rather than
 *   jumping by db. Use continuous=true for smooth proportional valves, false for
 *   raw spool-overlap modeling.
 * @returns {number}
 */
export function deadband(x, db, { continuous = false } = {}) {
  if (db <= 0) return x;
  if (Math.abs(x) <= db) return 0;
  return continuous ? x - sign(x) * db : x;
}

/** Degrees -> radians. */
export function deg2rad(d) {
  return (d * Math.PI) / 180;
}

/** Radians -> degrees. */
export function rad2deg(r) {
  return (r * 180) / Math.PI;
}

/**
 * Floating-point near-equality.
 * @param {number} a
 * @param {number} b
 * @param {number} [eps=EPS]
 * @returns {boolean}
 */
export function approxEqual(a, b, eps = EPS) {
  return Math.abs(a - b) <= eps;
}

/* ----------------------------------------------------------------------- */
/* Small statistics helpers (used by the grading engine and telemetry)     */
/* ----------------------------------------------------------------------- */

/** Sum of an array (0 for empty). @param {number[]} a */
export function sum(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s;
}

/** Arithmetic mean (0 for empty). @param {number[]} a */
export function mean(a) {
  return a.length ? sum(a) / a.length : 0;
}

/** Root-mean-square (0 for empty). @param {number[]} a */
export function rms(a) {
  if (!a.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s / a.length);
}

/** Maximum absolute value (0 for empty). @param {number[]} a */
export function maxAbs(a) {
  let m = 0;
  for (let i = 0; i < a.length; i++) {
    const v = Math.abs(a[i]);
    if (v > m) m = v;
  }
  return m;
}
