/**
 * @file controller.test.js
 * Validates the controller, trajectory generators, and the closed-loop sim.
 *
 * Run headless:   node test/controller.test.js
 * Run in browser: open test/run-controller.html
 */

import * as M from "../src/math/index.js";
import { defaultGeometry2DOF, defaultGeometry3DOF } from "../src/kinematics/index.js";
import { defaultHydraulics } from "../src/hydraulics/index.js";
import { defaultController } from "../src/control/index.js";
import { TargetGenerator } from "../src/control/trajectory.js";
import { buildSimulation } from "../src/sim/index.js";

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
const approx = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const clone = (o) => JSON.parse(JSON.stringify(o));

function run(sim, seconds) {
  const steps = Math.round(seconds / sim.dt);
  let snap;
  for (let i = 0; i < steps; i++) snap = sim.step();
  return snap;
}

/* ===================== JOINT-SPACE TRACKING (2-DOF) ================== */
{
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: defaultHydraulics,
    controller: { ...defaultController, Kp: 40 },
  });
  sim.setMode("step");
  sim.setTarget({ x: 0.1, y: 0.55 });
  const snap = run(sim, 3);
  check("2DOF joint-space converges to target (<2mm)", snap.poseErrNorm < 2e-3);
  check("2DOF steady control near zero at rest", M.maxAbs(snap.u) < 0.05);
  check("2DOF no spurious faults on reachable step", !snap.pumpSaturated && !snap.hydraulicFlags.stall.some((b) => b));
}

/* ===================== FEEDFORWARD IMPROVES RAMP TRACKING =========== */
{
  const mk = (ff) =>
    buildSimulation({
      geometry: defaultGeometry2DOF,
      hydraulics: defaultHydraulics,
      controller: { ...defaultController, Kp: 20, enableFF: ff },
    });
  const errAt = (sim) => {
    sim.reset();
    sim.setMode("hold");
    sim.setTarget({ x: -0.2, y: 0.5 });
    for (let i = 0; i < Math.round(1.0 / sim.dt); i++) sim.step(); // settle at start
    sim.setMode("ramp", { rate: 0.15 });
    sim.setTarget({ x: 0.2, y: 0.5 });
    const t0 = sim.t;
    let acc = 0,
      cnt = 0;
    const steps = Math.round(1.6 / sim.dt);
    for (let i = 0; i < steps; i++) {
      const s = sim.step();
      const dt = s.t - t0;
      if (dt > 0.3 && dt < 1.1) {
        acc += s.poseErrNorm;
        cnt++;
      }
    }
    return acc / cnt;
  };
  const eNo = errAt(mk(false));
  const eFF = errAt(mk(true));
  check("feedforward reduces ramp tracking lag", eFF < eNo);
}

/* ===================== ANTI-WINDUP ================================== */
{
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: defaultHydraulics,
    controller: { ...defaultController, Kp: 10, Ki: 8, integLimit: 0.5 },
  });
  sim.setMode("step");
  sim.setTarget({ x: 3.0, y: 0.5 }); // far unreachable -> saturates
  run(sim, 3);
  const integ = sim.ctrl.integ;
  check("integrator stays within clamp under saturation", M.maxAbs(integ) <= 0.5 + 1e-9);
  check("integrator does not run away (finite)", integ.every((v) => isFinite(v)));
}

/* ===================== ON/OFF (BANG-BANG) DEADBAND FLOOR ============ */
{
  // Proportional valve converges to essentially zero error...
  const simP = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: { ...clone(defaultHydraulics), valve: { model: "proportional", deadband: 0 } },
    controller: { ...defaultController, Kp: 40 },
  });
  simP.setMode("step");
  simP.setTarget({ x: 0.08, y: 0.55 });
  const sp = run(simP, 3);
  check("proportional valve converges to ~0 error", sp.poseErrNorm < 1e-4);

  // ...on/off valve parks within its deadband: a coarse, NON-zero residual.
  // (In this leak/delay-free plant zero flow holds position, so an on/off valve
  // shows a deadband-sized steady-state error rather than chatter. True bench
  // hunting requires modeling solenoid switching delay / fluid inertia.)
  const simB = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: { ...clone(defaultHydraulics), valve: { model: "bangbang", deadband: 0.05, hysteresis: 0.02 } },
    controller: { ...defaultController, Kp: 40 },
  });
  simB.setMode("step");
  simB.setTarget({ x: 0.08, y: 0.55 });
  const sb = run(simB, 3);
  check("on/off valve leaves a deadband-sized residual (coarse positioning)", sb.poseErrNorm > 20 * sp.poseErrNorm);
  check("on/off residual is bounded (parks, does not diverge)", sb.poseErrNorm < 5e-3);
}

/* ===================== STROKE-END RESIDUAL ========================== */
{
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: defaultHydraulics,
    controller: { ...defaultController, Kp: 40 },
  });
  sim.setMode("step");
  // y high enough that required length exceeds Lmax (stroke-max)
  sim.setTarget({ x: 0, y: 0.97 });
  const snap = run(sim, 3);
  const strokeMax = sim.kin.cylinders[0].stroke;
  check("stroke saturates at max", approx(sim.s[0], strokeMax, 1e-6));
  check("residual pose error persists (target unreachable)", snap.poseErrNorm > 1e-3);
  check("target flagged unreachable", !snap.reachable.ok);
}

/* ===================== TASK-SPACE TRACKING ========================== */
{
  const sim = buildSimulation({
    geometry: defaultGeometry2DOF,
    hydraulics: defaultHydraulics,
    controller: { ...defaultController, mode: "taskspace", KpTask: 10 },
  });
  sim.setMode("step");
  sim.setTarget({ x: 0.12, y: 0.5 });
  const snap = run(sim, 3);
  check("task-space converges to target (<5mm)", snap.poseErrNorm < 5e-3);
}

/* ===================== DETERMINISM (fixed timestep) ================= */
{
  const make = () => {
    const s = buildSimulation({
      geometry: defaultGeometry2DOF,
      hydraulics: defaultHydraulics,
      controller: { ...defaultController, Kp: 30 },
    });
    s.setMode("circle", { cx: 0, cy: 0.55, r: 0.12, omega: 2 });
    return s;
  };
  const a = run(make(), 2);
  const b = run(make(), 2);
  check("deterministic: identical pose after same steps", approx(a.poseAct.x, b.poseAct.x, 1e-12) && approx(a.poseAct.y, b.poseAct.y, 1e-12));
  check("deterministic: identical stroke state", approx(a.stroke[0], b.stroke[0], 1e-12));
}

/* ===================== TRAJECTORY GENERATORS ======================== */
{
  const g = new TargetGenerator(2, { x: 0, y: 0.55 });
  g.setMode("circle", { cx: 0, cy: 0.55, r: 0.15, omega: 1 });
  let onCircle = true;
  let tangent = true;
  for (let i = 0; i < 50; i++) {
    const { pose, poseDot } = g.update(i * 0.02, 0.02);
    const rr = Math.hypot(pose.x - 0, pose.y - 0.55);
    if (Math.abs(rr - 0.15) > 1e-9) onCircle = false;
    // velocity should be tangent: dot((pose-center), poseDot) ≈ 0
    const dotp = (pose.x - 0) * poseDot.x + (pose.y - 0.55) * poseDot.y;
    if (Math.abs(dotp) > 1e-9) tangent = false;
  }
  check("circle generator stays on circle", onCircle);
  check("circle velocity is tangent", tangent);

  const r = new TargetGenerator(2, { x: 0, y: 0.5 });
  r.setMode("ramp", { rate: 0.5 });
  r.setTarget({ x: 1.0, y: 0.5 });
  const first = r.update(0, 0.01);
  check("ramp slews at limited rate", approx(first.pose.x, 0.005, 1e-9));
}

/* ===================== 3-DOF CLOSED LOOP ============================ */
{
  const sim = buildSimulation({
    geometry: defaultGeometry3DOF,
    hydraulics: defaultHydraulics,
    controller: { ...defaultController, Kp: 40 },
  });
  sim.setMode("step");
  sim.setTarget({ x: 0.03, y: 0.02, theta: 0.05 });
  const snap = run(sim, 4);
  check("3DOF joint-space converges (<5mm/rad)", snap.poseErrNorm < 5e-3);
  check("3DOF FK stayed valid throughout", snap.fkOk === true);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nController + simulation: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All controller/sim tests passed. ✓");
}

export { pass, fail };
