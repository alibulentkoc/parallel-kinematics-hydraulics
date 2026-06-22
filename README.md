# PKM Sim — Electrohydraulic Parallel Kinematics Testbed

[![tests](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/actions/workflows/ci.yml/badge.svg)](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/actions/workflows/ci.yml)

An instructor/student simulation testbed for a planar electrohydraulic parallel
kinematics machine (2-DOF midterm, 3-DOF final). Pure HTML/CSS/JS, ES modules,
no framework, no runtime dependencies. Physics is separated from rendering and
runs on a fixed timestep. **247/247 tests passing.**

## Quick start

    git clone https://github.com/alibulentkoc/parallel-kinematics-hydraulics.git
    cd parallel-kinematics-hydraulics
    npm test                 # runs all 10 suites (Node 18+); non-zero exit on failure

    # serve the apps (file:// blocks ES-module imports, so use a static server):
    npx serve                # or: python3 -m http.server
    # then open index.html for links to instructor / student / grading consoles + demo

**New to the tool? Start with [TUTORIAL.md](TUTORIAL.md)** — a self-guided course
that teaches electrohydraulic parallel kinematics by walking you through the
simulator lesson by lesson (no instructor required).

Modules delivered:
1. Math utilities      — src/math/        (39 tests)
2. Kinematics engine   — src/kinematics/  (17 tests)
3. Hydraulic engine    — src/hydraulics/  (32 tests)
4. Controller + sim    — src/control/, src/sim/  (20 tests)
5. Fault engine        — src/faults/   (27 tests)
6. Logger + twin       — src/logger/   (31 tests)
7. Visualization       — src/viz/      (24 tests)  + viz-demo.html
8. Presets + instructor— src/presets/  (19 tests)  + instructor.html
9. Student dashboard   — src/student/  (17 tests)  + student.html
10. Grading engine     — src/grading/  (21 tests)  + grade.html

## Run the tests
Requires Node 18+ (ES modules; package.json has "type":"module").

    cd pkm-sim
    npm test     # math + kinematics + hydraulics + controller; non-zero exit on failure

Browser (no build): open any test/run-*.html.

## Layout
    src/math/        scalar.js, linalg.js
    src/kinematics/  kinematics-base.js, kinematics2dof.js, kinematics3dof.js, kinematics.js
    src/hydraulics/  valve.js (3 models), hydraulics.js (engine + defaults)
    src/control/     controller.js (PID + task-space), trajectory.js (input modes)
    src/sim/         simulation.js (fixed-timestep loop), index.js (buildSimulation)
    test/            *.test.js + run-*.html

## Quick start (closed loop)
    import { buildSimulation } from "./src/sim/index.js";
    import { defaultGeometry2DOF } from "./src/kinematics/index.js";
    import { defaultHydraulics } from "./src/hydraulics/index.js";
    import { defaultController } from "./src/control/index.js";

    const sim = buildSimulation({
      geometry: defaultGeometry2DOF,
      hydraulics: defaultHydraulics,
      controller: { ...defaultController, Kp: 40 },
    });
    sim.setMode("step");
    sim.setTarget({ x: 0.1, y: 0.55 });
    for (let i = 0; i < 3000; i++) sim.step();   // 3 s at dt=1ms
    console.log(sim.last.poseErrNorm);            // ~ converged

## Module 4 notes
- Controller modes: 'jointspace' (PID per cylinder, derivative-on-measurement,
  conditional anti-windup, optional feedforward) and 'taskspace' (P outer loop
  through J). Output clamps to [-1,1]; valve/orifice/pump saturation is downstream.
- Input modes: hold, step, ramp (rate-limited), circle, line, figure8.
- Simulation: fixed-timestep step(dt); advance(realDt) uses a fixed-dt accumulator
  so physics is deterministic regardless of frame rate. Snapshot is the single
  telemetry object consumed by logger/viz/grader; a faultEngine hook is reserved
  for Module 5.
- Known fidelity limit: on/off (bang-bang) valves park within their deadband in
  this leak/delay-free plant (coarse steady-state error) rather than producing
  bench-style limit-cycle hunting; that would require modeling solenoid switching
  delay / fluid inertia (optional future fidelity toggle).

## Module 5 notes
- FaultEngine: graded faults (warn/limit/fault), per-leg + global scope, debounced
  on/off so transients don't flicker. Registry covers UNREACHABLE, SINGULAR,
  NEAR_SINGULAR, PUMP_SATURATED, SINGULAR_LOAD, FK_INVALID, STROKE_END,
  OVER_PRESSURE, STALL, VALVE_SATURATED, CAVITATION_RISK (heuristic). Thresholds
  (manipWarn/manipFault/cavitation) are configurable per geometry via presets.
- Two injection paths:
    fe.inject(id, true|false|null)   force a fault's DISPLAY on/off (TA workflow)
    new FaultInjector(sim).pumpDerate / payloadSpike / reliefDrop / stuckValve /
      valveModel  — perturb the real PLANT; clearAll() reverts non-destructively.
- Attach with:  sim.faultEngine = makeFaultEngine();  then each sim.step()
  snapshot gains snapshot.faults = [...].

## Module 6 notes
- Canonical schema (src/logger/schema.js), versioned, dof-aware. Columns:
  t, mode, <pose>_cmd/_act/_err, errNorm, per-leg L/e/u/uEff/Q/P/sDot/stroke/F,
  manip, pumpScale, pumpSaturated, fkOk, reachable, faultLevel, faults.
- Logger: log.capture(sim.step()) each tick. sampleEvery controls rate; on
  hitting maxRows it DECIMATES (halve rows, double stride) to keep full duration.
  Export: log.toCSV(), log.toJSON(), log.download("run.csv") (browser).
- TwinTrace (digital-twin interface, req #15): TwinTrace.parse(csvOrJson) accepts
  sim exports, answer-key runs, OR external hardware logs sharing the schema.
  API: .channel(name), .at(t) (linear interpolation), .dof()/.nLegs()/.duration().
  This is what the grading engine (Module 10) diffs against.

## Module 7 notes — visualization (render-only)
- OPEN viz-demo.html in a browser to see the testbed live (no build step).
  Drag in the workspace to command a target; toggle DOF / valve / input mode;
  inject faults; export CSV.
- Components (src/viz/): theme.js (instrument tokens + pure color scales),
  transform.js (world<->screen, pure), heatmap.js (manipulability field; pure
  sampler + offscreen renderer), stripchart.js (rolling plots), workspace.js
  (WorkspaceRenderer: legs lit by pressure, ghost-vs-actual pose, reachability-
  colored draggable target, stroke gauges, dead-zone heatmap), loop.js
  (RenderLoop: rAF -> sim.advance(fixed dt), deterministic).
- Strictly render-only: renderers read snapshots and never mutate physics. The
  draggable target emits a callback the host wires to sim.setTarget.

## Module 8 notes — presets + instructor console
- OPEN instructor.html for the full-authority console.
- Presets (src/presets/, req #13): PresetManager with built-in teaching scenarios
  (baseline_2dof, asymmetry_demo, weak_pump, near_singular_2dof, onoff_valve,
  low_relief, final_3dof, singular_3rpr_diamond). apply(id) -> deep-cloned bundle
  {geometry,hydraulics,controller,faultConfig,defaultTarget,notes}. register()
  validates; serialize()/loadJSON() persist custom presets. validatePreset()
  checks dimensional sanity (rod<bore, stroke>0, relief/supply/pump>0, ...).
  IMPORTANT: geometry.cylinder = {Lclosed,stroke}; hydraulics.cylinder =
  {bore,rod,ratedFlow}. They are separate.
- Instructor console: live parameter editing (geometry edits rebuild the plant;
  pressures/gains/thresholds apply live), fault-injection console (physical +
  flag-force), automated validation checklist (the testbed self-checking),
  answer-key record + student-CSV import with RMS deviation, and CSV/JSON log export.

## Module 9 notes — student workbench
- OPEN student.html. Locked geometry, no fault console; the student tunes only
  gains / valve / target / input-mode against an assignment objective.
- src/student/: assignments.js (3 midterm 2-DOF + 4 final 3-DOF tasks, each with
  a locked preset, a submission scenario, and formative self-check criteria),
  metrics.js (traceMetrics: finalErr, overshoot, settleTime, meanErr, minManip,
  faultLevels, pumpSatFrac — shared with the grader), selfCheck(), makeSubmission().
- "Run submission" executes the task scenario deterministically, self-checks, and
  builds a canonical-schema submission JSON (meta + columns + rows) for grading.

## Module 10 notes — grading engine
- OPEN grade.html (TA console): drop a student submission (+ optional answer key),
  pick/auto-detect the rubric, get a scored report.
- src/grading/: rubric.js (weighted items per task, sum 100), grader.js
  (gradeSubmission/gradeBatch). Item types: threshold (partial credit), binary,
  no_fault, fault_demo, completeness, reference_rms (skipped+reweighted if no
  reference). Reuses traceMetrics + TwinTrace, so a SIM submission and a real
  HARDWARE log grade through the identical path.
- gradeSubmission(input, {rubric?, assignment?, reference?}) accepts a TwinTrace,
  a {meta,columns,rows} submission, or CSV/JSON text. Returns
  {percent, grade, items[], metrics, faults}.

## Start here
Open index.html for links to all apps and test runners.
