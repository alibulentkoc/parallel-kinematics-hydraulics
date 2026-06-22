/**
 * @file logger.js
 * Time-series logger. Captures Simulation snapshots into flat schema rows and
 * exports CSV/JSON. Memory is bounded two ways:
 *   - `sampleEvery`: record 1 of every N physics ticks (rate control).
 *   - decimation: when row count hits `maxRows`, drop every other row and
 *     double the effective stride. This PRESERVES the full run duration at
 *     coarser resolution (better for grading whole trajectories) instead of
 *     dropping the oldest history.
 *
 * The logger is standalone: a dashboard's loop calls logger.capture(sim.step()).
 */

import { schemaColumns, flattenSnapshot, SCHEMA_VERSION } from "./schema.js";

function fmt(v) {
  if (typeof v === "string") return v;
  if (v == null || !Number.isFinite(v)) return "";
  // 7 significant digits keeps CSV diffs reproducible without bloating size.
  return String(+Number(v).toPrecision(7));
}

export class Logger {
  /**
   * @param {object} [opts]
   * @param {number} [opts.sampleEvery=10] record 1 of every N ticks
   * @param {number} [opts.maxRows=20000]  decimation threshold
   */
  constructor({ sampleEvery = 10, maxRows = 20000 } = {}) {
    this.sampleEvery = Math.max(1, sampleEvery);
    this.maxRows = Math.max(2, maxRows);
    this.reset();
  }

  reset() {
    this.rows = [];
    this._count = 0;
    this._effEvery = this.sampleEvery;
    this.dof = null;
    this.nLegs = null;
    this.recording = true;
  }

  start() {
    this.recording = true;
  }
  stop() {
    this.recording = false;
  }

  /** Capture a snapshot (respects rate control + decimation). */
  capture(snapshot) {
    if (!this.recording) return;
    if (this.dof == null) {
      this.dof = snapshot.dof;
      this.nLegs = snapshot.nLegs;
    }
    const take = this._count % this._effEvery === 0;
    this._count++;
    if (!take) return;
    this.rows.push(flattenSnapshot(snapshot));
    if (this.rows.length >= this.maxRows) this._decimate();
  }

  _decimate() {
    this.rows = this.rows.filter((_, i) => i % 2 === 0);
    this._effEvery *= 2;
  }

  /** Ordered column names for the captured configuration. */
  columns() {
    return schemaColumns(this.dof ?? 2, this.nLegs ?? 2);
  }

  size() {
    return this.rows.length;
  }

  /** @returns {string} CSV text (header + rows). */
  toCSV() {
    const cols = this.columns();
    const head = cols.join(",");
    const lines = this.rows.map((r) => cols.map((c) => fmt(r[c])).join(","));
    return [head, ...lines].join("\n");
  }

  /** @returns {object} compact JSON: {meta, columns, rows:[[...]]} */
  toJSON() {
    const cols = this.columns();
    return {
      meta: {
        schemaVersion: SCHEMA_VERSION,
        dof: this.dof,
        nLegs: this.nLegs,
        rows: this.rows.length,
        effSampleEvery: this._effEvery,
        createdAt: new Date().toISOString(),
        units: { length: "m", pressure: "Pa", flow: "m^3/s", angle: "rad", time: "s" },
      },
      columns: cols,
      rows: this.rows.map((r) => cols.map((c) => r[c])),
    };
  }

  /** Trigger a browser download (no-op outside the browser). */
  download(filename = "pkm_log.csv") {
    if (typeof document === "undefined") return;
    const blob = new Blob([this.toCSV()], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

/** @param {object} [opts] @returns {Logger} */
export function makeLogger(opts) {
  return new Logger(opts);
}
