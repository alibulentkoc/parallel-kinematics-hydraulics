# Gate 4 — Assessment Alignment Review

**Status:** Gate 3 approved. Gate 4 defines the **assessment architecture** — competencies,
evidence, rubric criteria, and performance thresholds. **No quiz/exam content is written
here** (per directive). Content is authorized only at Gate 5.

**Permanent rule adopted (your wording):** a new lesson enters the curriculum only if it has
**an artifact → simulator support → an assessment**. Any "No" → the lesson is rejected.

---

## A. Competency Map (defined before rubrics, per your request)

| # | Competency — *student can…* | Evidence (artifact) |
|---|---|---|
| C1 | Frame the build as a fluid-power system & scope it | Project proposal + architecture |
| C2 | Configure PKM geometry (2-RPR / 3-RPR) | Geometry configuration |
| C3 | Implement inverse & forward kinematics | IK/FK implementation |
| C4 | Analyze workspace & reachability | Workspace map |
| C5 | Size hydraulic actuation (cylinder/valve/pump/power) | Hydraulic Sizing Report |
| C6 | **Characterize PWM control of on/off DCVs** | Duty-cycle (PWM) characterization |
| C7 | **Achieve & explain on/off position control** (deadband, limit cycles vs. proportional) | Position-control demo |
| C8 | Conduct a hydraulic design review | Design Review Package |
| C9 | Commission a physical 2-DOF machine | 2-DOF prototype *(midterm)* |
| C10 | Extend kinematics to 3-DOF | 3-DOF twin |
| C11 | Analyze the Jacobian & manipulability | Manipulability map |
| C12 | Analyze singularities & define a safe region | Safe-region map |
| C13 | Design coordinated / task-space control | Coordinated-control runs |
| C14 | Tune position control under PWM | Tuned Control Report |
| C15 | Validate the digital twin (**Twin ≈ Machine**) | Twin Accuracy Report |
| C16 | Integrate & validate the full 3-DOF system | Integrated 3-DOF system *(final)* |

C6 + C7 together carry the **signature outcome** of the course.

---

## B. Competency Matrix — evidence · rubric criteria · performance threshold

*(Thresholds marked "tunable" are sensible defaults pending the student-cohort definition.)*

| # | Rubric criteria | Performance threshold |
|---|---|---|
| C1 | Subsystems identified; build scoped; risks named | All subsystems present; scope feasible (pass/revise) |
| C2 | Anchors/attach + frame params correct | Matches reference geometry exactly |
| C3 | IK & FK correct; round-trip verified | Round-trip error **< 1e-6 m (2-DOF)**, **< 1e-4 m (3-DOF)** |
| C4 | Reachable region correct; out-of-stroke & near-base-line zones flagged | ≥ 95 % pose classification vs. engine; base-line dead zone identified |
| C5 | Cylinder/valve/pump/power computed & justified | Force, flow, power within **±10 %** of a correct design (ref: ~20 kN extend, ~9.6 kW) |
| C6 | Duty-cycle ↔ average-speed curve; deadband & ripple identified | Monotonic curve produced; deadband quantified; limit-cycle amplitude reported |
| C7 | Parks at target; explains limits vs. proportional | Steady-state error **≤ deadband floor**; written comparison correct |
| C8 | All five items present; safety checklist complete | **Gate: pass = all items + safety complete**; else revise before commissioning |
| C9 | Machine reaches commanded poses; safety passes; twin-vs-rig | Positions within deadband; safety chain verified; twin-vs-rig error ≤ tunable band |
| C10 | 3-DOF IK (closed) + FK (Newton) correct | Round-trip **< 1e-4 m**; converges from warm start |
| C11 | Manipulability map matches engine; dexterity regions identified | Map agreement within **±5 %**; high/low-dexterity regions labelled |
| C12 | Singular set identified (incl. symmetric-pose θ-singularity); safe region with margin | Correctly flags det J → 0 cases; safe region keeps |det J| above a tunable floor |
| C13 | Coordinated path tracking; joint vs. task-space compared | Path-tracking error ≤ tunable band; comparison documented |
| C14 | Tuned response to spec under PWM | Settling ≤ tunable target; limit-cycle amplitude ≤ deadband-driven bound |
| C15 | **Twin Accuracy Report** | **Position RMSE ≤ tunable**, settling within **±15 %** of rig, **pressure-prediction error ≤ tunable %** |
| C16 | Full 3-DOF system operates & is validated | Final spec met; validation evidence complete |

**Every competency has measurable evidence + rubric criteria + a threshold** → Gate 4
approval criterion satisfied.

---

## C. Quiz mapping *(mapping only — no questions written)*

Quizzes assess **conceptual understanding** behind each artifact; they never replace the
artifact. One knowledge-check per competency cluster:

| Quiz (knowledge check) | Competencies checked |
|---|---|
| Kinematics concepts | C2, C3, C10 |
| Workspace & dexterity | C4, C11, C12 |
| Hydraulics & sizing | C5 |
| PWM / on-off control | C6, C7, C14 |
| Validation & integration | C8, C15, C16 |

## D. Lab mapping

| Lab | Competency | Artifact = lab deliverable |
|---|---|---|
| Workspace lab | C4 | Workspace map |
| Sizing lab | C5 | Hydraulic Sizing Report |
| **PWM / duty-cycle lab** | C6, C7 | Duty-cycle characterization + position demo |
| Commissioning lab | C9 | 2-DOF prototype |
| Tuning lab | C14 | Tuned Control Report |
| Validation lab | C15 | Twin Accuracy Report |

---

## E. Midterm rubric — 2-DOF machine *(criteria + default weights + thresholds)*

| Criterion (competency) | Weight | Threshold |
|---|---|---|
| Kinematics in twin (C3) | 15 % | round-trip < 1e-6 m |
| Workspace analysis (C4) | 10 % | dead zone + stroke limits flagged |
| Hydraulic sizing (C5) | 15 % | within ±10 % of a correct design |
| PWM characterization + position control (C6, C7) | 20 % | curve + deadband + parks within deadband |
| Design review + safety (C8) | 15 % | all items + safety complete (gate) |
| Hardware commissioning (C9) | 20 % | reaches targets; safety passes |
| Twin-vs-rig agreement (C9) | 5 % | within tunable band |

## F. Final rubric — 3-DOF integrated system

| Criterion (competency) | Weight | Threshold |
|---|---|---|
| 3-DOF kinematics (C10) | 10 % | round-trip < 1e-4 m |
| Manipulability + singularity (C11, C12) | 15 % | maps correct; safe region defined |
| Coordinated / task-space control (C13) | 15 % | path tracking within band |
| Tuned control (C14) | 15 % | settling + limit-cycle to spec |
| **Twin Accuracy Report (C15)** | 20 % | RMSE / settling / pressure-error thresholds met |
| Integrated operation (C16) | 20 % | final spec met |
| Validation documentation | 5 % | complete & traceable |

---

## Competency coverage check

Every competency C1–C16 appears in **at least one** of {quiz, lab, midterm, final} **and**
has a threshold. **No competency without an assessment. No assessment without a competency.**

---

## Dashboard

**Green:** competency map · evidence per competency · rubric criteria · thresholds · quiz/lab
mapping · midterm & final rubrics · the permanent artifact→simulator→assessment rule.

**Yellow (non-blocking):** exact thresholds marked "tunable" pending **student-cohort
definition**; Twin Accuracy metrics still to be added to the engine (small, scheduled for the
Gate 5 build, required for C15).

**Red:** none.

---

## Decision requested

Approve **Gate 4**. On approval, **Gate 5 — Content Production Authorization** unlocks, and —
for the first time in this process — generation of lessons, notebooks, quizzes, figures,
demos, and handbook content may begin, **built strictly to** the approved identity (Option B),
Path A, the M0–M4 architecture, the artifact chain, the simulator capabilities, and these
rubrics/thresholds.

I recommend that Gate 5, when authorized, begin with **two foundation items** before any
lessons: (1) implement the small **Twin Accuracy metrics** in the engine (unblocks C15), and
(2) confirm the **student cohort** so the "tunable" thresholds can be set.
