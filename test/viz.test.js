/**
 * @file viz.test.js
 * Validates the visualization layer. The geometry/color/field/buffer logic is
 * pure and tested directly. The canvas drawing path is exercised against a mock
 * 2D context to prove it runs end-to-end (and that physics stays separate) —
 * pixels themselves are confirmed visually via viz-demo.html.
 *
 * Run headless:   node test/viz.test.js
 * Run in browser: open test/run-viz.html
 */

import { defaultGeometry2DOF, defaultGeometry3DOF, makeKinematics } from "../src/kinematics/index.js";
import { defaultHydraulics } from "../src/hydraulics/index.js";
import { defaultController } from "../src/control/index.js";
import { buildSimulation } from "../src/sim/index.js";
import {
  ViewTransform,
  computeWorldBounds,
  pressureColor,
  manipWash,
  severityColor,
  sampleField,
  StripChart,
  WorkspaceRenderer,
  RenderLoop,
} from "../src/viz/index.js";

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
const approx = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

/* --- mock canvas + 2D context ---------------------------------------- */
function makeMockCtx() {
  const calls = {};
  const noop =
    (name) =>
    (...a) => {
      calls[name] = (calls[name] || 0) + 1;
    };
  const ctx = {
    _calls: calls,
    save: noop("save"),
    restore: noop("restore"),
    scale: noop("scale"),
    translate: noop("translate"),
    rotate: noop("rotate"),
    beginPath: noop("beginPath"),
    closePath: noop("closePath"),
    moveTo: noop("moveTo"),
    lineTo: noop("lineTo"),
    arc: noop("arc"),
    rect: noop("rect"),
    fill: noop("fill"),
    stroke: noop("stroke"),
    fillRect: noop("fillRect"),
    strokeRect: noop("strokeRect"),
    clearRect: noop("clearRect"),
    fillText: noop("fillText"),
    strokeText: noop("strokeText"),
    setLineDash: noop("setLineDash"),
    drawImage: noop("drawImage"),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    putImageData: noop("putImageData"),
    measureText: (s) => ({ width: (s ? s.length : 0) * 6 }),
  };
  return ctx;
}
function makeMockCanvas(w = 600, h = 480) {
  const ctx = makeMockCtx();
  return {
    width: w,
    height: h,
    clientWidth: w,
    clientHeight: h,
    style: {},
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h }),
    addEventListener: () => {},
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    _ctx: ctx,
  };
}

/* ===================== TRANSFORM ==================================== */
{
  const world = { minX: -1, maxX: 1, minY: 0, maxY: 1 };
  const v = new ViewTransform({ world, screen: { x: 0, y: 0, w: 400, h: 300 }, padding: 0 });
  // round-trip
  const p = [0.3, 0.7];
  const back = v.toWorld(v.toScreen(p));
  check("transform round-trip", approx(back[0], p[0], 1e-9) && approx(back[1], p[1], 1e-9));
  // y-up flip: higher world y -> smaller screen y
  check("y is flipped (up = up)", v.toScreen([0, 1])[1] < v.toScreen([0, 0])[1]);
  // center maps to screen center
  const c = v.toScreen([0, 0.5]);
  check("world center -> screen center", approx(c[0], 200, 1e-6) && approx(c[1], 150, 1e-6));
  // isotropic scale (no distortion)
  check("len() uses uniform scale", v.len(1) === v.scale);
}

/* ===================== WORLD BOUNDS ================================= */
{
  const k = makeKinematics(defaultGeometry2DOF);
  const b = computeWorldBounds(k);
  check("bounds enclose anchors", b.minX <= -0.6 && b.maxX >= 0.6);
  check("bounds have positive extent", b.maxX > b.minX && b.maxY > b.minY);
}

/* ===================== COLOR SCALES ================================ */
{
  const cold = pressureColor(0);
  const hot = pressureColor(1);
  check("pressure cold is bluish", cold[2] > cold[0]);
  check("pressure hot is reddish", hot[0] > hot[2]);
  check("pressure clamps below 0", pressureColor(-5)[0] === cold[0]);
  const good = manipWash(1);
  const bad = manipWash(0);
  check("manip dead-zone more opaque than good zone", bad.alpha > good.alpha);
  check("severity maps fault->red-ish string", typeof severityColor("fault") === "string");
}

/* ===================== HEATMAP FIELD =============================== */
{
  const k = makeKinematics(defaultGeometry2DOF);
  const b = computeWorldBounds(k);
  const field = sampleField(k, b, 40, 40);
  check("field has correct size", field.data.length === 40 * 40);
  check("field min/max sane (max > min)", field.max > field.min);
  // reproduce the kinematics result: manipulability ~0 near the base line.
  const lowRow = sampleField(k, { minX: -0.3, maxX: 0.3, minY: 0.0, maxY: 0.02 }, 10, 2);
  const highRow = sampleField(k, { minX: -0.3, maxX: 0.3, minY: 0.5, maxY: 0.6 }, 10, 2);
  check("heatmap shows base-line dead zone", highRow.max > lowRow.max);
  // unreachable cells marked -1
  const far = sampleField(k, { minX: 5, maxX: 6, minY: 5, maxY: 6 }, 4, 4);
  check("unreachable cells marked < 0", far.data.every((w) => w < 0));
}

/* ===================== STRIPCHART BUFFER ========================== */
{
  const sc = new StripChart({ series: [{ key: "a", label: "A", color: "#fff" }], capacity: 50 });
  for (let i = 0; i < 200; i++) sc.push(i * 0.01, [Math.sin(i)]);
  check("ring buffer respects capacity", sc.t.length === 50);
  check("ring buffer keeps latest", approx(sc.t[sc.t.length - 1], 1.99, 1e-9));
  // draw against mock ctx
  const ctx = makeMockCtx();
  let threw = false;
  try {
    sc.draw(ctx, { x: 0, y: 0, w: 300, h: 120 });
  } catch (e) {
    threw = true;
  }
  check("StripChart.draw runs without throwing", !threw && ctx._calls.stroke > 0);
}

/* ===================== WORKSPACE RENDER (mock canvas) ============== */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: defaultHydraulics, controller: defaultController });
  sim.setMode("step");
  sim.setTarget({ x: 0.1, y: 0.55 });
  for (let i = 0; i < 200; i++) sim.step();
  const canvas = makeMockCanvas();
  const wr = new WorkspaceRenderer(canvas, sim.kin, { heatmap: false }); // heatmap needs real canvas
  let threw = false;
  try {
    wr.draw(sim.last);
  } catch (e) {
    threw = true;
    console.error("    draw error: " + e.message);
  }
  check("WorkspaceRenderer.draw runs (2-DOF)", !threw);
  check("WorkspaceRenderer issued draw calls", canvas._ctx._calls.stroke > 0 && canvas._ctx._calls.fillRect > 0);

  // 3-DOF platform polygon path
  const sim3 = buildSimulation({ geometry: defaultGeometry3DOF, hydraulics: defaultHydraulics, controller: defaultController });
  for (let i = 0; i < 100; i++) sim3.step();
  const c3 = makeMockCanvas();
  const wr3 = new WorkspaceRenderer(c3, sim3.kin, { heatmap: false });
  let threw3 = false;
  try {
    wr3.draw(sim3.last);
  } catch (e) {
    threw3 = true;
    console.error("    draw3 error: " + e.message);
  }
  check("WorkspaceRenderer.draw runs (3-DOF platform polygon)", !threw3);
}

/* ===================== RENDER LOOP (no rAF) ======================== */
{
  const sim = buildSimulation({ geometry: defaultGeometry2DOF, hydraulics: defaultHydraulics, controller: defaultController });
  sim.setMode("step");
  sim.setTarget({ x: 0.1, y: 0.55 });
  let renders = 0;
  let lastSnap = null;
  const loop = new RenderLoop(sim, (snap) => {
    renders++;
    lastSnap = snap;
  });
  const t0 = sim.t;
  loop.tick(0.1); // advance 0.1 s of physics in fixed sub-steps
  check("render loop advanced physics", sim.t > t0);
  check("render loop called onRender", renders === 1 && lastSnap != null);
  check("render loop respects fixed dt (≈100 substeps)", Math.abs((sim.t - t0) / sim.dt - 100) < 2);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nVisualization layer: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All viz tests passed. ✓");
}

export { pass, fail };
