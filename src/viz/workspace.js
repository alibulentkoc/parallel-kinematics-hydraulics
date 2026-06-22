/**
 * @file workspace.js
 * The signature instrument view. Render-only: it reads a Simulation snapshot and
 * the kinematics strategy and paints the workspace. It owns pointer input
 * (mapping screen drags to world target poses) but never advances physics — it
 * emits an onTargetDrag(pose) callback the host wires to sim.setTarget.
 *
 * Layers (back to front): metric grid, manipulability heatmap, stroke-limit
 * envelope, base anchors, pressure-lit legs, platform (ghost = commanded,
 * solid = actual), reachability-colored target handle, per-leg stroke gauges,
 * scale bar.
 */

import { THEME, pressureColor, rgbToCss, severityColor } from "./theme.js";
import { ViewTransform, computeWorldBounds } from "./transform.js";
import { sampleField, renderFieldToCanvas } from "./heatmap.js";

const DPR = () => (typeof window !== "undefined" && window.devicePixelRatio) || 1;

export class WorkspaceRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} kin kinematics strategy
   * @param {object} [opts]
   * @param {number} [opts.reliefPressure=21e6]
   * @param {number} [opts.manipWarn=0.05]
   * @param {boolean} [opts.heatmap=true]
   */
  constructor(canvas, kin, opts = {}) {
    this.canvas = canvas;
    this.kin = kin;
    this.opts = { reliefPressure: 21e6, manipWarn: 0.05, heatmap: true, ...opts };
    this.ctx = canvas.getContext("2d");
    this.onTargetDrag = null;
    this.dragging = false;
    this._heatCanvas = null;
    this._heatTheta = null;
    this.bounds = computeWorldBounds(kin);
    this.resize();
    this._bindPointer();
  }

  /** Re-read CSS size and configure the backing store for crisp lines on HiDPI. */
  resize() {
    const cssW = this.canvas.clientWidth || this.canvas.width || 600;
    const cssH = this.canvas.clientHeight || this.canvas.height || 480;
    const dpr = DPR();
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    this.view = new ViewTransform({ world: this.bounds, screen: { x: 0, y: 0, w: cssW, h: cssH } });
    this._heatCanvas = null; // force heatmap rebuild at new size
  }

  setKinematics(kin) {
    this.kin = kin;
    this.bounds = computeWorldBounds(kin);
    this.view = new ViewTransform({ world: this.bounds, screen: { x: 0, y: 0, w: this.cssW, h: this.cssH } });
    this._heatCanvas = null;
    this._heatTheta = null;
  }

  /* ----- pointer: drag the target ------------------------------------ */
  _bindPointer() {
    if (!this.canvas.addEventListener) return;
    const getWorld = (ev) => {
      const r = this.canvas.getBoundingClientRect();
      return this.view.toWorld([ev.clientX - r.left, ev.clientY - r.top]);
    };
    const emit = (ev) => {
      const [wx, wy] = getWorld(ev);
      if (this.onTargetDrag) this.onTargetDrag(this.kin.dof === 3 ? { x: wx, y: wy } : { x: wx, y: wy });
    };
    this.canvas.addEventListener("pointerdown", (ev) => {
      this.dragging = true;
      this.canvas.setPointerCapture?.(ev.pointerId);
      emit(ev);
    });
    this.canvas.addEventListener("pointermove", (ev) => {
      if (this.dragging) emit(ev);
    });
    const end = (ev) => {
      this.dragging = false;
      this.canvas.releasePointerCapture?.(ev.pointerId);
    };
    this.canvas.addEventListener("pointerup", end);
    this.canvas.addEventListener("pointercancel", end);
  }

  /* ----- heatmap cache ------------------------------------------------ */
  _ensureHeatmap(theta) {
    if (!this.opts.heatmap) return null;
    const stale = this._heatCanvas == null || (this.kin.dof === 3 && Math.abs((this._heatTheta ?? 1e9) - theta) > 0.05);
    if (stale) {
      const field = sampleField(this.kin, this.bounds, 96, 96, theta);
      this._heatCanvas = renderFieldToCanvas(field);
      this._heatTheta = theta;
    }
    return this._heatCanvas;
  }

  /* ----- main draw ---------------------------------------------------- */
  /** @param {object} snap Simulation snapshot */
  draw(snap) {
    const ctx = this.ctx;
    const v = this.view;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    // background
    ctx.fillStyle = THEME.panel;
    ctx.fillRect(0, 0, this.cssW, this.cssH);

    this._drawGrid(ctx, v);

    // heatmap wash
    const theta = snap && snap.poseAct && this.kin.dof === 3 ? snap.poseAct.theta : 0;
    const heat = this._ensureHeatmap(theta);
    if (heat) {
      const tl = v.toScreen([this.bounds.minX, this.bounds.maxY]);
      const br = v.toScreen([this.bounds.maxX, this.bounds.minY]);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(heat, tl[0], tl[1], br[0] - tl[0], br[1] - tl[1]);
    }

    this._drawEnvelope(ctx, v);
    this._drawAnchors(ctx, v);

    if (snap) {
      this._drawLegs(ctx, v, snap);
      this._drawPlatform(ctx, v, snap);
      this._drawTarget(ctx, v, snap);
      this._drawStrokeGauges(ctx, snap);
    }
    this._drawScaleBar(ctx, v);
    ctx.restore();
  }

  _drawGrid(ctx, v) {
    ctx.strokeStyle = THEME.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    const step = 0.2; // 20 cm grid
    const b = this.bounds;
    ctx.beginPath();
    for (let gx = Math.ceil(b.minX / step) * step; gx <= b.maxX; gx += step) {
      const a = v.toScreen([gx, b.minY]);
      const c = v.toScreen([gx, b.maxY]);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(c[0], c[1]);
    }
    for (let gy = Math.ceil(b.minY / step) * step; gy <= b.maxY; gy += step) {
      const a = v.toScreen([b.minX, gy]);
      const c = v.toScreen([b.maxX, gy]);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(c[0], c[1]);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _drawEnvelope(ctx, v) {
    // 2-DOF: stroke-limit circles (Lmin/Lmax) about each anchor make the
    // reachable annuli explicit. 3-DOF relies on the heatmap.
    if (this.kin.dof !== 2) return;
    ctx.strokeStyle = THEME.rule;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < this.kin.anchors.length; i++) {
      const a = this.kin.anchors[i];
      const c = v.toScreen(a);
      const { Lmin, Lmax } = this.kin.lengthLimits(i);
      ctx.lineWidth = 1;
      for (const L of [Lmin, Lmax]) {
        ctx.beginPath();
        ctx.arc(c[0], c[1], v.len(L), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  _drawAnchors(ctx, v) {
    ctx.fillStyle = THEME.inkDim;
    for (const a of this.kin.anchors) {
      const s = v.toScreen(a);
      ctx.beginPath();
      // ground-anchor triangle
      ctx.moveTo(s[0], s[1] - 7);
      ctx.lineTo(s[0] - 7, s[1] + 6);
      ctx.lineTo(s[0] + 7, s[1] + 6);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawLegs(ctx, v, snap) {
    const legs = this.kin.legs(snap.poseAct);
    const relief = this.opts.reliefPressure;
    for (let i = 0; i < legs.length; i++) {
      const a = v.toScreen(legs[i].anchor);
      const t = v.toScreen(legs[i].tip);
      const pn = Math.max(0, Math.min(1, (snap.pLoad?.[i] ?? 0) / relief));
      ctx.strokeStyle = rgbToCss(pressureColor(pn));
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(t[0], t[1]);
      ctx.stroke();
      // stroke-end highlight
      if (snap.strokeEnd?.[i]) {
        ctx.strokeStyle = THEME.fault;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t[0], t[1], 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  _platformPoints(pose) {
    if (this.kin.dof === 3 && this.kin.platformPolygon) return this.kin.platformPolygon(pose);
    return [[pose.x, pose.y]];
  }

  _drawPlatform(ctx, v, snap) {
    // ghost = commanded
    const ghost = this._platformPoints(snap.targetPose);
    ctx.strokeStyle = THEME.accent;
    ctx.globalAlpha = 0.55;
    ctx.setLineDash([5, 4]);
    this._poly(ctx, v, ghost, true);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // actual
    const act = this._platformPoints(snap.poseAct);
    if (act.length > 1) {
      ctx.fillStyle = "rgba(63,224,160,0.12)";
      ctx.strokeStyle = THEME.ok;
      ctx.lineWidth = 2;
      this._poly(ctx, v, act, true, true);
    } else {
      const s = v.toScreen(act[0]);
      ctx.fillStyle = THEME.ok;
      ctx.beginPath();
      ctx.arc(s[0], s[1], 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _poly(ctx, v, pts, close, fill) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const s = v.toScreen(p);
      if (i === 0) ctx.moveTo(s[0], s[1]);
      else ctx.lineTo(s[0], s[1]);
    });
    if (close) ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
  }

  _drawTarget(ctx, v, snap) {
    const tp = snap.targetPose;
    const reach = this.kin.reachable(tp);
    const manip = this.kin.manipulability(tp);
    let color = THEME.ok;
    if (!reach.ok) color = THEME.fault;
    else if (manip < this.opts.manipWarn) color = THEME.warn;
    const s = v.toScreen([tp.x, tp.y]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s[0], s[1], 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath(); // crosshair
    ctx.moveTo(s[0] - 14, s[1]);
    ctx.lineTo(s[0] + 14, s[1]);
    ctx.moveTo(s[0], s[1] - 14);
    ctx.lineTo(s[0], s[1] + 14);
    ctx.stroke();
  }

  _drawStrokeGauges(ctx, snap) {
    // compact per-leg stroke bars, stacked top-left
    const n = snap.nLegs;
    const x = 12;
    let y = 12;
    const w = 90;
    const hgt = 8;
    ctx.font = `10px ${THEME.fontMono}`;
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const stroke = this.kin.cylinders[i].stroke;
      const frac = Math.max(0, Math.min(1, snap.stroke[i] / stroke));
      ctx.fillStyle = THEME.panel2;
      ctx.fillRect(x, y, w, hgt);
      ctx.fillStyle = snap.strokeEnd?.[i] ? THEME.fault : THEME.accent;
      ctx.fillRect(x, y, w * frac, hgt);
      ctx.strokeStyle = THEME.rule;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, hgt - 1);
      ctx.fillStyle = THEME.inkDim;
      ctx.fillText(`L${i + 1}`, x + w + 6, y + hgt / 2);
      y += hgt + 5;
    }
  }

  _drawScaleBar(ctx, v) {
    const meters = 0.2;
    const px = v.len(meters);
    const x = this.cssW - px - 18;
    const y = this.cssH - 18;
    ctx.strokeStyle = THEME.inkDim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + px, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.moveTo(x + px, y - 4);
    ctx.lineTo(x + px, y + 4);
    ctx.stroke();
    ctx.fillStyle = THEME.inkDim;
    ctx.font = `10px ${THEME.fontMono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("20 cm", x + px / 2, y - 6);
    ctx.textAlign = "left";
  }
}
