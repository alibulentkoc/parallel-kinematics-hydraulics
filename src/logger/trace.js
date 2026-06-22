/**
 * @file trace.js
 * TwinTrace — the digital-twin data interface (requirement #15).
 *
 * A TwinTrace is a parsed, schema-aligned time series. It is the common currency
 * between three sources:
 *   - the simulator's own Logger export (CSV or JSON),
 *   - an answer-key reference run, and
 *   - external HARDWARE logs (a student's bench rig), as long as they emit the
 *     same column names.
 *
 * The grading engine (Module 10) consumes TwinTrace via channel() and at(t),
 * so it never cares whether a trace came from sim or steel.
 */

function maybeNum(s) {
  if (s === "" || s == null) return "";
  const n = Number(s);
  return Number.isNaN(n) ? s : n;
}

export class TwinTrace {
  /** @param {{meta?:object, columns:string[], records:object[]}} parts */
  constructor({ meta = {}, columns, records }) {
    this.meta = meta;
    this.columns = columns;
    this.records = records;
    this._t = records.map((r) => +r.t);
  }

  /** Parse a JSON object of the Logger.toJSON() shape. */
  static fromJSON(obj) {
    const columns = obj.columns;
    const records = (obj.rows || []).map((arr) => {
      const o = {};
      columns.forEach((c, i) => (o[c] = arr[i]));
      return o;
    });
    return new TwinTrace({ meta: obj.meta || {}, columns, records });
  }

  /** Parse CSV text (header row + comma-separated values). */
  static fromCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const columns = lines[0].split(",");
    const records = lines
      .slice(1)
      .filter((l) => l.length)
      .map((line) => {
        const vals = line.split(",");
        const o = {};
        columns.forEach((c, i) => (o[c] = maybeNum(vals[i])));
        return o;
      });
    return new TwinTrace({ meta: {}, columns, records });
  }

  /** Auto-detect: JSON object, JSON string, or CSV string. */
  static parse(input) {
    if (typeof input !== "string") return TwinTrace.fromJSON(input);
    const s = input.trim();
    if (s[0] === "{") return TwinTrace.fromJSON(JSON.parse(s));
    return TwinTrace.fromCSV(s);
  }

  get length() {
    return this.records.length;
  }
  times() {
    return this._t;
  }
  duration() {
    const T = this._t;
    return T.length ? T[T.length - 1] - T[0] : 0;
  }

  /** Inferred DOF / leg count from the columns. */
  dof() {
    return this.columns.includes("theta_act") ? 3 : 2;
  }
  nLegs() {
    let n = 0;
    while (this.columns.includes(`L${n + 1}_act`)) n++;
    return n;
  }

  /** Extract one channel as an array. @param {string} name */
  channel(name) {
    return this.records.map((r) => r[name]);
  }

  /**
   * Sample the trace at time t, linearly interpolating numeric channels between
   * the two bracketing records (nearest for non-numeric like mode/faults).
   * @param {number} t @returns {object|null}
   */
  at(t) {
    const T = this._t;
    if (!T.length) return null;
    if (t <= T[0]) return this.records[0];
    if (t >= T[T.length - 1]) return this.records[T.length - 1];
    let lo = 0;
    let hi = T.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (T[mid] <= t) lo = mid;
      else hi = mid;
    }
    const a = this.records[lo];
    const b = this.records[hi];
    const span = T[hi] - T[lo] || 1;
    const f = (t - T[lo]) / span;
    const o = {};
    for (const c of this.columns) {
      const va = a[c];
      const vb = b[c];
      o[c] = typeof va === "number" && typeof vb === "number" ? va + (vb - va) * f : va;
    }
    return o;
  }
}
