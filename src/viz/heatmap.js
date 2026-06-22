/**
 * @file heatmap.js
 * Workspace manipulability heatmap (requirements #9, #10).
 *
 * sampleField() is pure (no canvas): it evaluates manipulability over a grid,
 * marking unreachable cells, and returns min/max for normalization — so it is
 * unit-testable and reproduces the kinematics singularity structure (e.g. the
 * 2-DOF base-line dead zone). renderFieldToCanvas() turns a sampled field into
 * an offscreen image the workspace renderer scales up as a soft wash.
 */

import { manipWash } from "./theme.js";

/**
 * @param {object} kin   kinematics strategy
 * @param {{minX,maxX,minY,maxY}} bounds
 * @param {number} nx @param {number} ny
 * @param {number} [theta=0] orientation slice for 3-DOF
 * @returns {{data:Float32Array, nx:number, ny:number, min:number, max:number, bounds:object}}
 */
export function sampleField(kin, bounds, nx, ny, theta = 0) {
  const data = new Float32Array(nx * ny);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < ny; j++) {
    const wy = bounds.minY + ((bounds.maxY - bounds.minY) * j) / (ny - 1);
    for (let i = 0; i < nx; i++) {
      const wx = bounds.minX + ((bounds.maxX - bounds.minX) * i) / (nx - 1);
      const pose = kin.dof === 3 ? { x: wx, y: wy, theta } : { x: wx, y: wy };
      const reach = kin.reachable(pose).ok;
      const w = reach ? kin.manipulability(pose) : -1;
      data[j * nx + i] = w;
      if (reach) {
        if (w < min) min = w;
        if (w > max) max = w;
      }
    }
  }
  if (!isFinite(min)) {
    min = 0;
    max = 1;
  }
  return { data, nx, ny, min, max, bounds };
}

/**
 * Paint a sampled field into an offscreen canvas (nx × ny image), returning it.
 * Unreachable cells are transparent. Browser only (needs a canvas factory).
 * @param {object} field result of sampleField
 * @param {() => HTMLCanvasElement} [makeCanvas]
 * @returns {HTMLCanvasElement|null}
 */
export function renderFieldToCanvas(field, makeCanvas) {
  const factory = makeCanvas || (typeof document !== "undefined" ? () => document.createElement("canvas") : null);
  if (!factory) return null;
  const { data, nx, ny, min, max } = field;
  const cv = factory();
  cv.width = nx;
  cv.height = ny;
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(nx, ny);
  const span = max - min || 1;
  for (let idx = 0; idx < nx * ny; idx++) {
    const w = data[idx];
    const o = idx * 4;
    if (w < 0) {
      img.data[o + 3] = 0; // unreachable -> transparent
      continue;
    }
    const norm = (w - min) / span;
    const { rgb, alpha } = manipWash(norm);
    img.data[o] = rgb[0];
    img.data[o + 1] = rgb[1];
    img.data[o + 2] = rgb[2];
    img.data[o + 3] = Math.round(alpha * 255);
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
