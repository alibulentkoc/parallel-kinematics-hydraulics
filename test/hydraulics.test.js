/**
 * @file hydraulics.test.js
 * Validates the hydraulic engine and valve models.
 *
 * Run headless:   node test/hydraulics.test.js
 * Run in browser: open test/run-hydraulics.html
 */

import * as M from "../src/math/index.js";
import { Valve, makeHydraulics, defaultHydraulics } from "../src/hydraulics/index.js";
import { makeKinematics, defaultGeometry2DOF } from "../src/kinematics/index.js";

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
const rel = (a, b, r = 1e-3) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

/* ===================== AREAS & ASYMMETRY ============================== */
{
  const h = makeHydraulics(defaultHydraulics, 2);
  const a = h.areas()[0];
  const Acap = (Math.PI / 4) * 0.04 * 0.04;
  const Arod = (Math.PI / 4) * (0.04 * 0.04 - 0.022 * 0.022);
  check("Acap correct", approx(a.Acap, Acap));
  check("Arod correct", approx(a.Arod, Arod));
  check("phi > 1 (cap larger than rod)", a.phi > 1);
  check("asymmetry ~ 1.43", rel(h.asymmetry(), Acap / Arod, 1e-9));
}

/* ===================== VALVE: PROPORTIONAL =========================== */
{
  const v = new Valve({ model: "proportional", deadband: 0.1 });
  check("prop passes mid command (continuous deadband)", approx(v.meter(0.5, 0.001), 0.4));
  check("prop zeros inside deadband", v.meter(0.05, 0.001) === 0);
  const v2 = new Valve({ model: "proportional", deadband: 0 });
  check("prop pass-through when db=0", approx(v2.meter(0.7, 0.001), 0.7));
}

/* ===================== VALVE: BANG-BANG + HYSTERESIS ================== */
{
  const v = new Valve({ model: "bangbang", deadband: 0.1, hysteresis: 0.05 });
  check("bb latches +1 above db+h", v.meter(0.2, 0.001) === 1);
  check("bb holds in hysteresis band", v.meter(0.12, 0.001) === 1); // |u|>db, <db+h -> hold
  check("bb releases to 0 below db", v.meter(0.05, 0.001) === 0);
  check("bb latches -1", v.meter(-0.2, 0.001) === -1);
  check("bb output is three-state", [-1, 0, 1].includes(v.meter(0.3, 0.001)));
}

/* ===================== VALVE: PWM AVERAGE ============================ */
{
  const v = new Valve({ model: "pwm", pwmFreq: 50 });
  const dt = 1e-4;
  const duty = 0.6;
  let acc = 0;
  const N = 4000; // 0.4 s ≈ 20 PWM periods
  for (let i = 0; i < N; i++) acc += Math.abs(v.meter(duty, dt));
  check("pwm average duty ≈ |u|", rel(acc / N, duty, 0.05));
}

/* ===================== ORIFICE FLOW + DIRECTION ====================== */
{
  // No-load config so flow factor = 1 at full command.
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 0;
  cfg.load.gravity = 9.81;
  const h = makeHydraulics(cfg, 2);
  const J = [
    [1, 0],
    [0, 1],
  ]; // nonsingular; load is zero anyway
  const ext = h.solve({ u: [1, 1], jacobian: J, dt: 1e-3 });
  const Acap = h.areas()[0].Acap;
  check("no-load full command ≈ ratedFlow", rel(ext.Q[0], 2.5e-4, 1e-6));
  check("extend velocity = Q/Acap", rel(ext.sDot[0], 2.5e-4 / Acap, 1e-6));
  check("extend direction positive", ext.sDot[0] > 0 && ext.perLeg[0].dir === 1);

  const ret = h.solve({ u: [-1, -1], jacobian: J, dt: 1e-3 });
  const Arod = h.areas()[0].Arod;
  check("retract uses Arod", approx(ret.perLeg[0].Aeff, Arod));
  check("retract faster than extend (|v_ret| > |v_ext|)", Math.abs(ret.sDot[0]) > Math.abs(ext.sDot[0]));
  check("retract direction negative", ret.sDot[0] < 0 && ret.perLeg[0].dir === -1);
}

/* ===================== J^-T FORCE-BALANCE INVARIANT ================== */
{
  // f = J^{-T}(M a − F_ext) must satisfy J^T f = (M a − F_ext).
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 30; // visible load
  const h = makeHydraulics(cfg, 2);
  const k = makeKinematics(defaultGeometry2DOF);
  const pose = { x: 0.1, y: 0.55 };
  const J = k.jacobian(pose);
  const res = h.solve({ u: [0.0, 0.0], jacobian: J, dt: 1e-3 });
  const f = res.force;
  const balance = M.matVec(M.transpose(J), f); // should equal [0, m g]
  const mg = 30 * 9.81;
  check("force balance Jᵀf ≈ [0, m g]", approx(balance[0], 0, 1e-6) && rel(balance[1], mg, 1e-6));
  check("load pressures finite & ≥ 0", res.pLoad.every((p) => p >= 0 && isFinite(p)));
}

/* ===================== PUMP SATURATION =============================== */
{
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 0; // isolate flow effect
  cfg.pumpMaxFlow = 3e-4; // less than 2×ratedFlow(=5e-4)
  const h = makeHydraulics(cfg, 2);
  const J = [
    [1, 0],
    [0, 1],
  ];
  const r = h.solve({ u: [1, 1], jacobian: J, dt: 1e-3 });
  check("pump saturated flag set", r.pumpSaturated === true);
  check("pumpScale < 1", r.pumpScale < 1);
  check("total flow ≈ pumpMaxFlow", rel(Math.abs(r.Q[0]) + Math.abs(r.Q[1]), 3e-4, 1e-6));
}

/* ===================== OVER-PRESSURE (relief) ======================= */
{
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 30;
  cfg.reliefPressure = 1e4; // absurdly low -> load exceeds relief
  cfg.supplyPressure = 1e4;
  const h = makeHydraulics(cfg, 2);
  const k = makeKinematics(defaultGeometry2DOF);
  const J = k.jacobian({ x: 0, y: 0.55 });
  const r = h.solve({ u: [1, 1], jacobian: J, dt: 1e-3 });
  check("over-pressure flagged on a leg", r.flags.overPressure.some((b) => b));
}

/* ===================== STALL (load >= supply) ======================= */
{
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 30;
  cfg.supplyPressure = 5e3; // very low supply, but relief high so not "over-pressure"
  cfg.reliefPressure = 21e6;
  cfg.ratedPressureDrop = 16e6;
  const h = makeHydraulics(cfg, 2);
  const k = makeKinematics(defaultGeometry2DOF);
  const J = k.jacobian({ x: 0, y: 0.55 });
  const r = h.solve({ u: [1, 1], jacobian: J, dt: 1e-3 });
  check("stall flagged when ΔP <= 0", r.flags.stall.some((b) => b));
  check("stalled leg velocity ≈ 0", r.sDot.some((v) => approx(v, 0, 1e-12)));
}

/* ===================== SINGULAR LOAD (J^-T throws) ================== */
{
  const cfg = clone(defaultHydraulics);
  cfg.load.platformMass = 12;
  const h = makeHydraulics(cfg, 2);
  const Jsing = [
    [1, 0],
    [1, 0],
  ]; // rank-deficient
  let threw = false;
  let r;
  try {
    r = h.solve({ u: [0.5, 0.5], jacobian: Jsing, dt: 1e-3 });
  } catch {
    threw = true;
  }
  check("solve never throws on singular J", !threw);
  check("singularLoad flag set", r && r.flags.singularLoad === true);
}

/* ===================== INTEGRATION WITH REAL KINEMATICS ============== */
{
  const h = makeHydraulics(defaultHydraulics, 2);
  const k = makeKinematics(defaultGeometry2DOF);
  const home = k.home();
  const J = k.jacobian(home);
  const r = h.solve({ u: [0.5, 0.5], jacobian: J, dt: 1e-3 });
  check("realistic step: both legs extend", r.sDot[0] > 0 && r.sDot[1] > 0);
  check("realistic step: load pressure modest vs relief", r.pLoad.every((p) => p < defaultHydraulics.reliefPressure));
  check("realistic step: no faults at home under light load", !r.pumpSaturated && !r.flags.overPressure.some((b) => b) && !r.flags.stall.some((b) => b));
}

/* --- summary ---------------------------------------------------------- */
const total = pass + fail;
console.log(`\nHydraulic engine: ${pass}/${total} checks passed.`);
if (fail > 0) {
  console.error(`FAILED: ${failures.join(", ")}`);
  if (typeof process !== "undefined" && process.exit) process.exit(1);
} else {
  console.log("All hydraulics tests passed. ✓");
}

export { pass, fail };
