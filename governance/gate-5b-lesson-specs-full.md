# Gate 5B — Lesson Specifications (M0–M4, full set)

Format approved with two additions, now incorporated: **Twin Maturity Stage + Twin
Advancement** and **Acceptance Test** (artifact-complete gate, separate from graded
Assessment). 13 fields per spec. **No lesson prose, quizzes, figures, demos, or notebooks
here** — specifications only.

Field order: ID/Title · Competency · Objective · Prerequisites · Twin Maturity Stage · Twin
Advancement · Content Outline · Artifact · **Acceptance Test** · Simulator Hooks · Assessment
+ Threshold · Future Directions / Physical AI · Effort.

---

## Module 0 — The Machine & the Digital Twin  · Twin Stage: **Observe**

**0.1 The PKM project & fluid-power system**
- **Competency:** C1 · **Objective:** describe the machine and its subsystems and how fluid power drives it · **Prereq:** none
- **Twin Advancement:** introduces the twin as the object of study (machine I/O)
- **Content:** what a PKM is; 2-RPR→3-RPR arc; subsystems (power unit, cylinders, solenoid DCVs, sensors); why fluid-power-first
- **Artifact:** system block diagram (→ all) · **Acceptance Test:** all subsystems present with correct flow/signal connections
- **Sim hooks:** reference-machine viz · **Assessment:** brief check — subsystems identified
- **Future Directions:** the horizon — a fluid-powered robot that could later sense/learn · **Effort:** Wk1 (part)

**0.2 Why a digital twin, and twin-first**
- **Competency:** C1 · **Objective:** run and read the reference twin; explain twin-first · **Prereq:** 0.1
- **Twin Advancement:** students can operate and read the twin (observe telemetry)
- **Content:** twin = Observe stage; model I/O; reading a run log; twin-first cost/safety argument
- **Artifact:** annotated observation log (→ twin) · **Acceptance Test:** correctly annotates ≥ 4 telemetry channels from a run
- **Sim hooks:** run a preset; inspect length/pressure/error channels · **Assessment:** observation check
- **Future Directions:** the twin as a future training ground for learned control · **Effort:** Wk1 (part)

**0.3 Proposal & architecture sketch**
- **Competency:** C1 · **Objective:** scope the build, commit to an architecture · **Prereq:** 0.1–0.2
- **Twin Advancement:** defines the twin's required scope (what it must represent)
- **Content:** proposal template; subsystem choices; the kit (power pack, cylinders, solenoid DCVs); risks; 15-week roadmap
- **Artifact:** **project proposal + architecture sketch** (→ all) · **Acceptance Test:** all sections present; architecture covers every subsystem; feasibility passes
- **Sim hooks:** none · **Assessment:** proposal rubric — feasible scope (pass/revise)
- **Future Directions:** a "where could this go" paragraph carried forward to M4 · **Effort:** Wk1

---

## Module 1 — Create the 2-DOF Digital Twin  · Twin Stage: **Kinematic Twin**

**1.1 Coordinate systems & 2-RPR geometry**
- **Competency:** C2 · **Objective:** define the machine frame · **Prereq:** 0.3
- **Twin Advancement:** twin gains the machine's geometry (base anchors, frame, stroke limits)
- **Content:** world vs. leg frames; anchor placement (b); leg-length variable; stroke bounds
- **Artifact:** geometry configuration (→ twin) · **Acceptance Test:** params match reference; loads into the twin without error
- **Sim hooks:** geometry setup · **Assessment:** config check — exact match
- **Future Directions:** parametric geometry as a future design-optimization variable · **Effort:** Wk2

**1.2 Inverse kinematics**
- **Competency:** C3 · **Objective:** turn a pose into leg lengths · **Prereq:** 1.1
- **Twin Advancement:** twin gains pose → actuator-length transformation
- **Content:** IK derivation L_i=√((x±b)²+y²); branch handling; mapping to stroke
- **Artifact:** working IK (→ twin) · **Acceptance Test:** test poses → leg lengths match reference within **1e-6 m**
- **Sim hooks:** `kinematics2dof` · **Assessment:** IK unit check
- **Future Directions:** IK as the inner loop a future learned controller would call · **Effort:** Wk3 (part)

**1.3 Forward kinematics**
- **Competency:** C3 · **Objective:** recover pose from leg lengths · **Prereq:** 1.2
- **Twin Advancement:** twin gains length → pose, closing the kinematic loop
- **Content:** FK x=(L1²−L2²)/4b, solve y; two-circle intersection; branch selection
- **Artifact:** working FK (→ twin) · **Acceptance Test:** IK→FK round-trip returns original pose within **1e-6 m**
- **Sim hooks:** `kinematics2dof` · **Assessment:** FK round-trip check
- **Future Directions:** FK as the state estimator a sensor-fusion layer would refine · **Effort:** Wk3 (part)

**1.4 Workspace & reachability**
- **Competency:** C4 · **Objective:** bound the usable region · **Prereq:** 1.2–1.3
- **Twin Advancement:** twin gains workspace/reachability awareness
- **Content:** reachable set from stroke limits; the near-base-line dead zone; mapping the boundary
- **Artifact:** **workspace map** (→ twin, 2-DOF) · **Acceptance Test:** classifies **≥ 90 %** of sampled poses correctly; dead zone present
- **Sim hooks:** reachability + heatmap · **Assessment:** workspace rubric
- **Future Directions:** workspace as a constraint set for future motion planning · **Effort:** Wk4

---

## Module 2 — Electrohydraulic Actuation & the Physical 2-DOF Build  · Twin Stage: **Hydraulic Twin** · ★ MIDTERM

**2.1 Cylinders & area asymmetry**
- **Competency:** C5 · **Objective:** size a cylinder; explain φ · **Prereq:** 1.4
- **Twin Advancement:** twin gains cylinder force/area model
- **Content:** bore/rod areas; cap vs. rod side; asymmetry φ=A_cap/A_rod; force/velocity consequences
- **Artifact:** cylinder spec + asymmetry calc (→ 2-DOF) · **Acceptance Test:** extend/retract forces within **±15 %** of reference
- **Sim hooks:** `hydraulics` (cylinder) · **Assessment:** spec check
- **Future Directions:** asymmetry compensation as a learned-control challenge · **Effort:** Wk5 (part)

**2.2 Solenoid DCVs, flow & pressure**
- **Competency:** C5 · **Objective:** read a DCV; relate flow↔pressure · **Prereq:** 2.1
- **Twin Advancement:** twin gains valve flow/pressure model
- **Content:** solenoid DCV states (extend/hold/retract); orifice flow vs. ΔP; rated flow/ΔP
- **Artifact:** valve/flow worksheet + DCV note (→ 2-DOF) · **Acceptance Test:** flow at rated ΔP within **±15 %**; states described correctly
- **Sim hooks:** `hydraulics` (valve) · **Assessment:** worksheet
- **Future Directions:** smart/condition-monitored valves · **Effort:** Wk5 (part)

**2.3 Hydraulic power unit & sizing**
- **Competency:** C5 · **Objective:** size pump/relief/power · **Prereq:** 2.1–2.2
- **Twin Advancement:** twin gains power-unit model — full hydraulic actuation chain
- **Content:** pump flow vs. speed need; relief above max pressure; hydraulic power P=ΔP·Q
- **Artifact:** **Hydraulic Sizing Report** (→ 2-DOF) · **Acceptance Test:** flow/pressure/power within **±15 %**; relief set above max
- **Sim hooks:** `hydraulics` (pump/power) · **Assessment:** sizing-report rubric
- **Future Directions:** energy-optimal sizing / regeneration · **Effort:** Wk5

**2.4 Sensors & signal scaling**
- **Competency:** C5 (supports C9) · **Objective:** map sensor volts ↔ length/pressure · **Prereq:** 2.3
- **Twin Advancement:** twin gains sensor/signal scaling so rig logs map to twin units
- **Content:** position transducer & pressure sensor scaling; sampling; units in the schema
- **Artifact:** sensor scaling table (→ 2-DOF, twin) · **Acceptance Test:** each channel volts↔unit mapping round-trips a test reading
- **Sim hooks:** logger/signal · **Assessment:** scaling check
- **Future Directions:** sensor fusion for state estimation · **Effort:** Wk6 (part)

**2.5 PWM actuation of on/off DCVs** *(signature)*
- **Competency:** C6 · **Objective:** move an axis via PWM duty cycle · **Prereq:** 2.2, 2.4
- **Twin Advancement:** twin gains PWM/on-off valve dynamics (duty → average flow, ripple)
- **Content:** PWM of a solenoid; carrier frequency; duty↔average speed; switching ripple
- **Artifact:** **duty-cycle characterization** (→ 2-DOF) · **Acceptance Test:** monotonic duty→speed curve; deadband within **±20 %**
- **Sim hooks:** `valve` `pwm`/`bangbang` · **Assessment:** duty-cycle lab
- **Future Directions:** learned duty schedules · **Effort:** Wk6

**2.6 Position control with on/off valves** *(signature)*
- **Competency:** C7 · **Objective:** hit a target within a deadband; explain limits vs. proportional · **Prereq:** 2.5
- **Twin Advancement:** twin gains closed-loop on/off position control
- **Content:** bang-bang + hysteresis; deadband-sized residual; limit cycles; why proportional differs
- **Artifact:** position-control demo (→ 2-DOF) · **Acceptance Test:** parks within **1.5× deadband**; limit cycle bounded
- **Sim hooks:** `valve` `bangbang` + `controller` · **Assessment:** position-within-deadband test
- **Future Directions:** learned switching policies that beat fixed hysteresis · **Effort:** Wk6 (part)

**2.7 Design review** *(gate)*
- **Competency:** C8 · **Objective:** defend the build before applying hydraulic power · **Prereq:** 2.1–2.6
- **Twin Advancement:** twin used as the design-verification oracle (sizing/behavior cross-checked before hardware)
- **Content:** review package assembly; safety checklist; wiring diagram; failure modes
- **Artifact:** **Hydraulic Design Review Package** (→ 2-DOF) · **Acceptance Test:** all 5 items present; safety checklist complete (**gate pass**)
- **Sim hooks:** sizing models (cross-check) · **Assessment:** Design Review Rubric
- **Future Directions:** automated design-rule checking · **Effort:** Wk7

**2.8 Commission the 2-DOF machine** *(midterm)*
- **Competency:** C9 · **Objective:** run the real rig to spec · **Prereq:** 2.7 (gate)
- **Twin Advancement:** twin paired against the physical rig for the first time (twin-vs-rig reference)
- **Content:** safe bring-up; homing; positioning; logging; twin-vs-rig comparison
- **Artifact:** **2-DOF prototype + twin-vs-rig report** (→ 2-DOF) · **Acceptance Test:** reaches commanded poses within **1.5× deadband**; safety verified; twin-vs-rig logged
- **Sim hooks:** full hydraulic twin · **Assessment:** **Midterm rubric**
- **Future Directions:** auto-commissioning routines · **Effort:** Wk8 ★

---

## Module 3 — Coordinated Control & Extension to 3-DOF  · Twin Stage: **Control Twin**

**3.1 3-RPR geometry & architecture**
- **Competency:** C2 (3-DOF) · **Objective:** define the 3-leg machine frame · **Prereq:** 2.8
- **Twin Advancement:** twin gains 3-RPR geometry (3 anchors, platform attach points)
- **Content:** platform vs. base; three anchors; attach geometry; added rotational DOF
- **Artifact:** 3-RPR geometry config (→ twin, 3-DOF) · **Acceptance Test:** matches reference anchors/attach; loads without error
- **Sim hooks:** geometry setup · **Assessment:** config check
- **Future Directions:** reconfigurable platforms · **Effort:** Wk9 (part)

**3.2 3-RPR IK/FK**
- **Competency:** C10 · **Objective:** solve pose↔legs for 3 DOF · **Prereq:** 3.1
- **Twin Advancement:** twin gains 3-DOF IK (closed) + FK (Newton)
- **Content:** per-leg IK with platform rotation; Newton FK; warm start; convergence
- **Artifact:** working 3-DOF IK/FK (→ twin, 3-DOF) · **Acceptance Test:** round-trip within **1e-4 m**; converges from warm start
- **Sim hooks:** `kinematics3dof` · **Assessment:** 3-DOF round-trip check
- **Future Directions:** learned FK initialization · **Effort:** Wk9

**3.3 Jacobian & manipulability**
- **Competency:** C11 · **Objective:** quantify dexterity across the workspace · **Prereq:** 3.2
- **Twin Advancement:** twin gains Jacobian/manipulability analysis
- **Content:** Jacobian assembly; det(J); manipulability measure; mapping dexterity
- **Artifact:** **manipulability map** (→ 3-DOF) · **Acceptance Test:** within **±10 %** of engine; high/low regions labelled
- **Sim hooks:** Jacobian + heatmap · **Assessment:** manipulability rubric
- **Future Directions:** dexterity-aware planning · **Effort:** Wk10

**3.4 Singularities & safe region**
- **Competency:** C12 · **Objective:** bound a safe operating region · **Prereq:** 3.3
- **Twin Advancement:** twin gains singularity/safe-region detection (incl. the symmetric-pose rotation singularity)
- **Content:** det(J)→0 cases; the symmetric pose; defining a margin; safe envelope
- **Artifact:** **safe-region map** (→ 3-DOF) · **Acceptance Test:** flags all det J→0 cases (incl. symmetric pose); region keeps **|det J| ≥ 0.02**
- **Sim hooks:** singularity fault · **Assessment:** region check
- **Future Directions:** online singularity avoidance · **Effort:** Wk11

**3.5 Coordinated / task-space control**
- **Competency:** C13 · **Objective:** drive coordinated pose along a path · **Prereq:** 3.2–3.4
- **Twin Advancement:** twin gains coordinated/task-space control
- **Content:** joint-space vs. task-space; trajectory generation; coordinating legs; path tracking
- **Artifact:** coordinated + task-space control runs (→ 3-DOF) · **Acceptance Test:** path-tracking RMSE ≤ **10 mm**
- **Sim hooks:** `controller` joint+task, trajectory · **Assessment:** path-tracking check
- **Future Directions:** learned task-space policies · **Effort:** Wk12 (part)

**3.6 PWM tuning & validation**
- **Competency:** C14 · **Objective:** tune bang-bang motion to spec · **Prereq:** 3.5
- **Twin Advancement:** twin gains tuned control under PWM matched to rig behavior
- **Content:** tuning deadband/hysteresis/duty; limit-cycle bounds; settling; validation
- **Artifact:** **Tuned Control Report** (→ 3-DOF) · **Acceptance Test:** settling ≤ **2.5 s**; limit-cycle amplitude ≤ deadband-driven bound
- **Sim hooks:** `valve` `pwm` + grading · **Assessment:** tuned-response test
- **Future Directions:** auto-tuning / adaptive control · **Effort:** Wk12

---

## Module 4 — System Integration and Advanced Applications  · Twin Stage: **Validation Twin** · ★ FINAL

**4.1 Log schema & twin↔hardware synchronization**
- **Competency:** C15 (setup) · **Objective:** record twin + rig on one schema · **Prereq:** 3.6
- **Twin Advancement:** twin gains log synchronization (shared schema/time base with the rig)
- **Content:** the canonical schema; aligning twin and rig logs; sampling/time sync (log-level, not HIL)
- **Artifact:** synchronized log set (→ integration) · **Acceptance Test:** twin and rig logs share schema and align in time
- **Sim hooks:** `logger` + `schema` · **Assessment:** sync check
- **Future Directions:** real-time HIL (advanced extension) · **Effort:** Wk13

**4.2 Validation & verification (replay)**
- **Competency:** C15 · **Objective:** replay logs to validate the twin · **Prereq:** 4.1
- **Twin Advancement:** twin validated by replay against rig outcomes
- **Content:** replay methodology; comparing predicted vs. measured; documenting discrepancies
- **Artifact:** V&V report (→ integration) · **Acceptance Test:** replay reproduces rig outcomes within tolerance; discrepancies documented
- **Sim hooks:** `trace` replay · **Assessment:** V&V report
- **Future Directions:** automated regression validation · **Effort:** Wk14 (part)

**4.3 Twin accuracy & performance**
- **Competency:** C15 · **Objective:** prove the twin matches the machine · **Prereq:** 4.2
- **Twin Advancement:** twin accuracy quantified — Twin ≈ Machine
- **Content:** position RMSE; settling difference; duty cycle; pressure-prediction error; interpreting them
- **Artifact:** **Twin Accuracy Report** (→ integration) · **Acceptance Test:** position RMSE ≤ **10 mm**; settling within **±20 %**; pressure error ≤ **15 %**
- **Sim hooks:** `twinAccuracy` metrics (RMSE/duty/pressure-error) + grading · **Assessment:** validation rubric
- **Future Directions:** online twin self-calibration · **Effort:** Wk14

**4.4 Integrate & validate the 3-DOF machine** *(final)*
- **Competency:** C16 · **Objective:** operate the full system to spec · **Prereq:** 4.3
- **Twin Advancement:** twin serves as the validation oracle for the integrated final system
- **Content:** full integration; end-to-end run; validation against the twin; performance summary
- **Artifact:** **integrated 3-DOF system** (→ 3-DOF, integration) · **Acceptance Test:** full 3-DOF operates to final spec; validated against the twin
- **Sim hooks:** full stack · **Assessment:** **Final rubric**
- **Future Directions:** the optional Physical AI extension (4.5) · **Effort:** Wk15 ★

**4.5 Physical AI extension** *(optional)*
- **Competency:** optional · **Objective:** prototype trajectory/autonomy/vision · **Prereq:** 4.4
- **Twin Advancement:** twin extended toward learned/autonomous control
- **Content:** one of — learned tuning, vision-guided targeting, autonomous sequencing; using the twin as a sandbox
- **Artifact:** extension demo or proposal (→ optional) · **Acceptance Test:** working prototype **or** a credible, scoped proposal
- **Sim hooks:** external / advanced · **Assessment:** optional credit
- **Future Directions:** the full Physical AI roadmap · **Effort:** beyond Wk15 / extra credit

---

## Drift-prevention table & verification

| Lesson | Artifact | Twin Stage |
|---|---|---|
| 0.1 | System block diagram | Observe |
| 0.2 | Observation log | Observe |
| 0.3 | Proposal + architecture | Observe |
| 1.1 | Geometry config | Kinematic |
| 1.2 | IK implementation | Kinematic |
| 1.3 | FK implementation | Kinematic |
| 1.4 | Workspace map | Kinematic |
| 2.1 | Cylinder spec | Hydraulic |
| 2.2 | Valve/flow worksheet | Hydraulic |
| 2.3 | Hydraulic Sizing Report | Hydraulic |
| 2.4 | Sensor scaling table | Hydraulic |
| 2.5 | Duty-cycle characterization | Hydraulic |
| 2.6 | Position-control demo | Hydraulic |
| 2.7 | Design Review Package | Hydraulic |
| 2.8 | 2-DOF prototype + twin-vs-rig | Hydraulic |
| 3.1 | 3-RPR geometry config | Control |
| 3.2 | 3-DOF IK/FK | Control |
| 3.3 | Manipulability map | Control |
| 3.4 | Safe-region map | Control |
| 3.5 | Coordinated/task-space runs | Control |
| 3.6 | Tuned Control Report | Control |
| 4.1 | Synchronized log set | Validation |
| 4.2 | V&V report | Validation |
| 4.3 | Twin Accuracy Report | Validation |
| 4.4 | Integrated 3-DOF system | Validation |
| 4.5 *(opt)* | Extension demo/proposal | Validation+ |

**Three invariants verified:**
1. **Every lesson → an artifact:** all 25 required lessons (and the optional 4.5) name a distinct artifact. ✓
2. **Every artifact → advances the twin:** each has a Twin Advancement entry; no lesson leaves the twin unchanged. ✓
3. **Every twin stage → measurable growth:** Observe (run/read) → Kinematic (geometry+IK/FK+workspace) → Hydraulic (actuation+PWM+control+commission) → Control (3-DOF+Jacobian+coordinated+tuned) → Validation (sync+V&V+accuracy+integration). Each stage adds named, testable capability. ✓

---

## Next 5B stages (not yet generated)

With specs complete, the remaining 5B order is **demos → figures → quizzes → notebooks →
handbook**, each built to these specs. Awaiting your approval of the specifications before
proceeding to demos.
