/**
 * @file transform.js
 * World <-> screen coordinate mapping. Pure and unit-testable: no canvas.
 *
 * World units are meters, y-up (physics convention). Screen is pixels, y-down
 * (canvas convention), so the transform flips y. The world AABB is fit into the
 * screen rect at a single isotropic scale (no distortion) with fractional padding.
 */

export class ViewTransform {
  /**
   * @param {object} args
   * @param {{minX,maxX,minY,maxY}} args.world  world bounds
   * @param {{x,y,w,h}} args.screen              destination rect (CSS px)
   * @param {number} [args.padding=0.08]         fraction of the rect to reserve
   */
  constructor({ world, screen, padding = 0.08 }) {
    this.world = world;
    this.screen = screen;
    const worldW = world.maxX - world.minX || 1;
    const worldH = world.maxY - world.minY || 1;
    const usableW = screen.w * (1 - 2 * padding);
    const usableH = screen.h * (1 - 2 * padding);
    this.scale = Math.min(usableW / worldW, usableH / worldH);
    this.cxWorld = (world.minX + world.maxX) / 2;
    this.cyWorld = (world.minY + world.maxY) / 2;
    this.cxScreen = screen.x + screen.w / 2;
    this.cyScreen = screen.y + screen.h / 2;
  }

  /** [wx,wy] -> [sx,sy] (px). */
  toScreen(p) {
    return [this.cxScreen + (p[0] - this.cxWorld) * this.scale, this.cyScreen - (p[1] - this.cyWorld) * this.scale];
  }

  /** [sx,sy] (px) -> [wx,wy]. */
  toWorld(p) {
    return [this.cxWorld + (p[0] - this.cxScreen) / this.scale, this.cyWorld - (p[1] - this.cyScreen) / this.scale];
  }

  /** Length in meters -> length in px. */
  len(m) {
    return m * this.scale;
  }
}

/**
 * Compute sensible world bounds for a kinematics geometry: the anchor bounding
 * box expanded by a fraction of max stroke so the reachable region is on-screen.
 * @param {object} kin kinematics strategy (has `anchors` and lengthLimits)
 * @returns {{minX,maxX,minY,maxY}}
 */
export function computeWorldBounds(kin) {
  const Lmax = kin.lengthLimits(0).Lmax;
  const anchors = kin.anchors || [[0, 0]];
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const a of anchors) {
    minX = Math.min(minX, a[0]);
    maxX = Math.max(maxX, a[0]);
    minY = Math.min(minY, a[1]);
    maxY = Math.max(maxY, a[1]);
  }
  const pad = 0.55 * Lmax;
  return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
}
