/**
 * @file stripchart.js
 * Rolling time-series strip chart (oscilloscope-style). The data layer is a pure
 * ring buffer (testable headless); draw() is a thin canvas pass.
 */

import { THEME } from "./theme.js";

export class StripChart {
  /**
   * @param {object} opts
   * @param {{key,label,color}[]} opts.series  channels to plot
   * @param {number} [opts.capacity=900]       ring buffer length
   * @param {number} [opts.window=8]           seconds visible
   * @param {string} [opts.title]
   * @param {boolean} [opts.symmetric=false]   center y-axis on 0
   */
  constructor({ series, capacity = 900, window = 8, title = "", symmetric = false }) {
    this.series = series;
    this.capacity = capacity;
    this.window = window;
    this.title = title;
    this.symmetric = symmetric;
    this.reset();
  }

  reset() {
    this.t = [];
    this.data = this.series.map(() => []);
  }

  /**
   * Push one sample. @param {number} t time @param {number[]} values per-series
   */
  push(t, values) {
    this.t.push(t);
    for (let i = 0; i < this.series.length; i++) this.data[i].push(values[i]);
    if (this.t.length > this.capacity) {
      this.t.shift();
      for (const d of this.data) d.shift();
    }
  }

  /** Current visible y-range across all series within the time window. */
  _range(tMax) {
    let lo = Infinity,
      hi = -Infinity;
    const tMin = tMax - this.window;
    for (let s = 0; s < this.series.length; s++) {
      const d = this.data[s];
      for (let k = 0; k < this.t.length; k++) {
        if (this.t[k] < tMin) continue;
        const v = d[k];
        if (!Number.isFinite(v)) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!isFinite(lo)) {
      lo = -1;
      hi = 1;
    }
    if (this.symmetric) {
      const m = Math.max(Math.abs(lo), Math.abs(hi), 1e-9);
      lo = -m;
      hi = m;
    }
    if (hi - lo < 1e-9) {
      hi += 1;
      lo -= 1;
    }
    const pad = (hi - lo) * 0.1;
    return [lo - pad, hi + pad];
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{x,y,w,h}} rect
   */
  draw(ctx, rect) {
    const { x, y, w, h } = rect;
    ctx.save();
    // frame
    ctx.fillStyle = THEME.panel2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = THEME.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    const tMax = this.t.length ? this.t[this.t.length - 1] : 0;
    const tMin = tMax - this.window;
    const [lo, hi] = this._range(tMax);
    const sx = (t) => x + ((t - tMin) / this.window) * w;
    const sy = (v) => y + h - ((v - lo) / (hi - lo)) * h;

    // zero line
    if (lo < 0 && hi > 0) {
      ctx.strokeStyle = THEME.grid;
      ctx.beginPath();
      ctx.moveTo(x, sy(0));
      ctx.lineTo(x + w, sy(0));
      ctx.stroke();
    }

    // series
    for (let s = 0; s < this.series.length; s++) {
      const d = this.data[s];
      ctx.strokeStyle = this.series[s].color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let k = 0; k < this.t.length; k++) {
        if (this.t[k] < tMin) continue;
        const px = sx(this.t[k]);
        const py = sy(d[k]);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // labels
    ctx.fillStyle = THEME.inkDim;
    ctx.font = `11px ${THEME.fontMono}`;
    ctx.textBaseline = "top";
    if (this.title) {
      ctx.fillStyle = THEME.ink;
      ctx.fillText(this.title, x + 6, y + 5);
    }
    ctx.fillStyle = THEME.inkFaint;
    ctx.textAlign = "right";
    ctx.fillText(hi.toPrecision(3), x + w - 6, y + 5);
    ctx.fillText(lo.toPrecision(3), x + w - 6, y + h - 16);
    // legend
    ctx.textAlign = "left";
    let lx = x + 6;
    const ly = y + h - 16;
    for (const s of this.series) {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, ly + 4, 10, 3);
      ctx.fillStyle = THEME.inkDim;
      ctx.fillText(s.label, lx + 14, ly);
      lx += 14 + ctx.measureText(s.label).width + 14;
    }
    ctx.restore();
  }
}
