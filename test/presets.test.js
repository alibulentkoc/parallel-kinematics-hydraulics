/**
 * @file presets.test.js
 * Validates the preset system: every built-in is valid, builds a runnable sim,
 * and actually exhibits the phenomenon it advertises.
 *
 * Run headless:   node test/presets.test.js
 * Run in browser: open test/run-presets.html
 */

import { PresetManager, validatePreset } from "../src/presets/index.js";
import { buildSimulation } from "../src/sim/index.js";
import { makeFaultEngine } from "../src/faults/index.js";

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

function simFromPreset(b, withFaults = true) {
  const sim = buildSimulation({ geometry: b.geometry, hydraulics: b.hydraulics, controller: b.controller });
  if (withFaults) sim.faultEngine = makeFaultEngine(b.faultConfig);
  return sim;
}
function run(sim, seconds) {
  let snap;
  const steps = Math.round(seconds / sim.dt);
  for (let i = 0; i < steps; i++) snap = sim.step();
  return snap;
}
function sawFault(sim, id, seconds) {
  let seen = false;
  const steps = Math.round(seconds / sim.dt);
  for (let i = 0; i < steps; i++) {
    const s = sim.step();
    if (s.faults && s.faults.some((f) => f.id === id)) seen = true;
  }
  return seen;
}

const pm = new PresetManager();

/* ===================== ALL BUILT-INS VALID ========================== */
{
  const ids = pm.list().map((p) => p.id);
  check("manager exposes built-ins", ids.length >= 8);
  let allValid = true;
  for (const { id } of pm.list()) {
    const v = validatePreset(pm.get(id));
    if (!v.ok) {
      allValid = false;
      console.error(`    ${id}: ${v.errors.join(", ")}`);
    }
  }
  check("every built-in passes validation", allValid);
  let allBuild = true;
  for (const { id } of pm.list()) {
    try {
      simFromPreset(pm.apply(id));
    } catch (e) {
      allBuild = false;
      console.error(`    ${id} build error: ${e.message}`);
    }
  }
  check("every built-in builds a simulation", allBuild);
}

/* ===================== BASELINE TRACKS ============================== */
{
  const b = pm.apply("baseline_2dof");
  const sim = simFromPreset(b, false);
  sim.setMode("step");
  sim.setTarget(b.defaultTarget);
  const snap = run(sim, 3);
  check("baseline_2dof converges to target", snap.poseErrNorm < 3e-3);
}

/* ===================== ASYMMETRY ==================================== */
{
  const b = pm.apply("asymmetry_demo");
  const sim = simFromPreset(b, false);
  const phi = sim.hyd.asymmetry();
  check("asymmetry_demo has large φ (> 2)", phi > 2);
}

/* ===================== WEAK PUMP -> STARVATION ====================== */
{
  const b = pm.apply("weak_pump");
  const sim = simFromPreset(b);
  sim.setMode("step");
  sim.setTarget(b.defaultTarget);
  check("weak_pump triggers PUMP_SATURATED", sawFault(sim, "PUMP_SATURATED", 1.5));
}

/* ===================== ON/OFF VALVE ================================ */
{
  const b = pm.apply("onoff_valve");
  const sim = simFromPreset(b, false);
  check("onoff_valve uses bang-bang model", sim.hyd.valves.every((v) => v.model === "bangbang"));
  // and it parks with a coarser residual than a proportional baseline
  sim.setMode("step");
  sim.setTarget(b.defaultTarget);
  const sb = run(sim, 3);
  const base = simFromPreset(pm.apply("baseline_2dof"), false);
  base.setMode("step");
  base.setTarget(b.defaultTarget);
  const sp = run(base, 3);
  check("onoff_valve residual coarser than proportional", sb.poseErrNorm > 5 * sp.poseErrNorm);
}

/* ===================== LOW RELIEF -> OVER-PRESSURE ================= */
{
  const b = pm.apply("low_relief");
  const sim = simFromPreset(b);
  sim.setMode("step");
  sim.setTarget(b.defaultTarget);
  check("low_relief triggers OVER_PRESSURE", sawFault(sim, "OVER_PRESSURE", 1.5));
}

/* ===================== NEAR-SINGULAR 2-DOF ========================= */
{
  const b = pm.apply("near_singular_2dof");
  const sim = simFromPreset(b);
  sim.setMode("step");
  sim.setTarget(b.defaultTarget); // low y, near base line
  const seen = sawFault(sim, "NEAR_SINGULAR", 2) || sawFault(sim, "SINGULAR", 0.01);
  check("near_singular_2dof flags ill-conditioning", seen);
}

/* ===================== SINGULAR 3-RPR DIAMOND ===================== */
{
  const b = pm.apply("singular_3rpr_diamond");
  const sim = simFromPreset(b, false);
  const manip = sim.kin.manipulability({ x: 0, y: 0.45, theta: 0 });
  check("singular_3rpr_diamond is singular at θ=0 (manip ≈ 0)", manip < 1e-6);
  // and well away from θ=0 it is non-singular
  const manip2 = sim.kin.manipulability({ x: 0, y: 0.45, theta: 0.2 });
  check("diamond is non-singular away from θ=0", manip2 > 1e-3);
}

/* ===================== FINAL 3-DOF ================================ */
{
  const b = pm.apply("final_3dof");
  const sim = simFromPreset(b, false);
  check("final_3dof is 3-DOF", sim.dof === 3);
  sim.setMode("step");
  sim.setTarget(b.defaultTarget);
  const snap = run(sim, 4);
  check("final_3dof converges", snap.poseErrNorm < 6e-3);
}

/* ===================== MANAGER API ================================ */
{
  // apply returns a deep clone (mutation isolation)
  const a = pm.apply("baseline_2dof");
  a.controller.Kp = 999;
  check("apply() returns an isolated clone", pm.get("baseline_2dof").controller.Kp !== 999);

  // register + serialize round-trip
  const custom = { ...pm.apply("baseline_2dof"), id: "my_custom", label: "Custom", controller: { ...pm.apply("baseline_2dof").controller, Kp: 77 } };
  pm.register(custom);
  check("register adds a custom preset", pm.has("my_custom"));
  const json = pm.serialize();
  const pm2 = new PresetManager().loadJSON(json);
  check("serialize/loadJSON round-trips custom preset", pm2.has("my_custom") && pm2.get("my_custom").controller.Kp === 77);

  // validation catches bad config
  const bad = pm.apply("baseline_2dof");
  bad.hydraulics.cylinder.rod = bad.hydraulics.cylinder.bore + 0.01; // rod >= bore
  check("validation rejects rod ≥ bore", validatePreset(bad).ok === false);
  let threw = false;
  try {
    pm.register({ ...bad, id: "bad" });
  } catch {
    threw = true;
  }
  check("register throws on invalid preset", threw);
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nPresets: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All preset tests passed. ✓");
}

export { pass, fail };
