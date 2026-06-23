# Gate 5B — Demo Family Specifications

Approvals recorded: **4-credit lab course · all 25 required lessons · Weeks 5–8 = "Midterm
Build Sprint" (extra TA coverage, extended lab access, staged commissioning) · four demo
families · 3.5 in the PWM/Control Lab.** The Student Roadmap weeks 5–8 are annotated
accordingly.

This document specifies the four demo families. **No demo code is written here.** Each family
is one parameterized demo; lessons embed preconfigured views.

---

## Demo Learning Contract (the demo traceability matrix)

| Family | Inputs | Outputs | Artifacts produced |
|---|---|---|---|
| **1 Kinematics Explorer** | geometry, DOF mode, target pose, leg lengths, sweep settings | leg lengths (IK), pose (FK), workspace, manipulability, det(J)/safe region | Geometry Config · IK/FK · Workspace Map · Manipulability Map · Safe-Region Map |
| **2 Hydraulic Explorer** | cylinder geometry, supply pressure, valve cmd/ΔP, rated flow/ΔP, pump max, load, sensor ranges | areas + asymmetry φ, force/velocity, orifice flow, pump/power/relief, sensor scaling | Cylinder Spec · Valve/Flow Worksheet · Hydraulic Sizing Report · Sensor Scaling Table |
| **3 PWM / Control Lab** | valve model + deadband/hysteresis/pwmFreq, duty cmd, gains, target pose/path, DOF | duty→speed curve, position response, path tracking, settling, limit-cycle | Duty-Cycle Characterization · Position-Control Demo · Coordinated/Task-Space Runs · Tuned Control Report |
| **4 Twin Validation Lab** | twin run + reference/rig log, schema alignment, replay controls, tolerances | twin-vs-rig overlay, synced logs, replay diff, accuracy metrics, pass/fail | Twin-vs-Rig Report · Synchronized Log Set · V&V Report · Twin Accuracy Report · Integrated Validation |

---

## Family 1 — Kinematics Explorer
*Serves 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4 (+ 0.1–0.2 read-only). Engine: `kinematics2dof/3dof`, Jacobian, reachability, heatmap viz.*

- **Inputs:** geometry params (anchors, attach, stroke), DOF mode (2/3), target pose (x,y[,θ]), leg lengths (FK mode), sweep resolution.
- **Outputs:** IK leg lengths; FK pose; workspace/reachability region; manipulability heatmap; det(J) value + singularity/safe-region overlay.
- **Artifact mapping:** Geometry Config (1.1, 3.1) · IK/FK (1.2, 1.3, 3.2) · Workspace Map (1.4) · Manipulability Map (3.3) · Safe-Region Map (3.4).
- **Student Mode:** guided per-lesson tasks; geometry locked to the lesson preset; milestone checks (e.g., "round-trip a pose < 1e-6 m", "find the dead zone").
- **Instructor Mode:** arbitrary geometry; reference/answer overlays; singular-pose and out-of-stroke cases on demand.
- **Assessment support:** emits checkable values — round-trip error, % pose classification, manipulability-map agreement (±10 %), singularity flagging — and exports for the workspace/manipulability rubrics.

## Family 2 — Hydraulic Explorer
*Serves 2.1, 2.2, 2.3, 2.4. Engine: `hydraulics` (cylinder/valve/pump).*

- **Inputs:** bore/rod, supply pressure, valve command/ΔP, rated flow & ΔP, pump max flow, load, sensor ranges.
- **Outputs:** cap/rod areas + φ, force/velocity (extend/retract), orifice flow vs. ΔP, required pump flow/pressure/power, relief setting, sensor volts↔unit scaling.
- **Artifact mapping:** Cylinder Spec (2.1) · Valve/Flow Worksheet (2.2) · Hydraulic Sizing Report (2.3) · Sensor Scaling Table (2.4).
- **Student Mode:** guided sizing for the machine's targets; preset load cases; acceptance checks at ±15 %.
- **Instructor Mode:** arbitrary loads/geometry; reference-sizing overlays; failure cases (undersized pump, relief set too low).
- **Assessment support:** computed force/flow/power checkable against ±15 %; exports for the sizing-report rubric.

## Family 3 — PWM / Control Lab
*Serves 2.5, 2.6, 3.5, 3.6. Engine: `valve` (pwm/bangbang/proportional), `controller` (joint+task), trajectory, grading.*

- **Inputs:** valve model + deadband/hysteresis/pwmFreq, duty command, controller gains, target pose/path, DOF.
- **Outputs:** duty→average-speed curve; position response (deadband residual, limit cycle); coordinated/task-space path tracking; settling time; limit-cycle amplitude.
- **Artifact mapping:** Duty-Cycle Characterization (2.5) · Position-Control Demo (2.6) · Coordinated/Task-Space Runs (3.5) · Tuned Control Report (3.6).
- **Student Mode:** guided duty sweeps and tuning; preset valve; milestone checks (parks within 1.5× deadband; settling ≤ 2.5 s).
- **Instructor Mode:** arbitrary valve/gains; **proportional-vs-on/off comparison overlay** (the signature contrast); fault cases (stuck spool, excessive deadband).
- **Assessment support:** metrics — duty-curve monotonicity, deadband, settling, limit-cycle amplitude, path RMSE — checkable against thresholds; exports for the duty-cycle lab and tuned-response test.

## Family 4 — Digital Twin Validation Lab
*Serves 2.8, 4.1, 4.2, 4.3, 4.4. Engine: `logger`/`schema`/`trace`, `twinAccuracy` metrics, grading.*

- **Inputs:** twin run + reference/rig log (generated or uploaded), schema-alignment settings, replay controls, metric tolerances.
- **Outputs:** twin-vs-rig overlay; synchronized log set; replay comparison; accuracy metrics (posRMSE, settleTimeDiff, dutyCycle, pressureRMSE/pctErr); validation pass/fail.
- **Artifact mapping:** Twin-vs-Rig Report (2.8) · Synchronized Log Set (4.1) · V&V Report (4.2) · Twin Accuracy Report (4.3) · Integrated Validation (4.4).
- **Student Mode:** guided comparison; load own rig log; acceptance checks (posRMSE ≤ 10 mm, pressure error ≤ 15 %).
- **Instructor Mode:** reference logs; tolerance overlays; inject discrepancies/faults; acceptable-vs-failing exemplars.
- **Assessment support:** runs the implemented `twinAccuracy` metrics; checkable against the C15 thresholds; exports for the validation rubric.

---

## Cross-family notes

- **Student vs Instructor mode is a shared pattern:** Student = guided tasks, locked/preset
  parameters, milestone/acceptance checks; Instructor = arbitrary parameters, answer overlays,
  fault/edge cases. Both modes are required in every family before implementation.
- **All four families already map to existing engine capabilities** — no new engine work is
  needed for the demos themselves (the only engine addition, Twin Accuracy metrics, is already
  done).
- **Reuse remains the point:** 4 demos, 21 lessons, per-lesson views — not 20 near-duplicates.

---

## Decision requested

Approve the **four demo family specifications** (Inputs · Outputs · Artifact mapping · Student
Mode · Instructor Mode · Assessment support), or mark changes. On approval, the next stage is
**building the four demo families** to these specs — then figures → quizzes → notebooks →
handbook. Still no lesson prose until the demos are built and approved.
