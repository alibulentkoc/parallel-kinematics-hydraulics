# Gate 2 — Learning Progression Review

**Status:** Gate 1 **approved** (Option B identity · **Path A** valves · Twin Maturity Map ·
artifact-driven design). Gate 2 defines the **lessons** — objective, artifact, simulator
feature, hardware activity, assessment — for each module. **No lesson content is written
here.** Content is authorized only at Gate 5.

**Governing rules carried in:**

- **Artifact rule.** Every lesson must produce a concrete **artifact** that contributes to
  one of: **the digital twin · the 2-DOF build · the 3-DOF build · the final integration.**
  A lesson with no such artifact is **removed**.
- **Path A.** Control is taught for **solenoid on/off DCVs via PWM** (bang-bang/position);
  proportional valves appear only as an *advanced comparison*.
- **Signature learning outcome (added per directive):** *Students can achieve position
  control using on/off hydraulic valves through PWM modulation, and explain the limitations
  compared with proportional-valve systems.* — owned by **M2.5–M2.6**.
- **M4 twin synchronization = log synchronization + replay validation**, not real-time HIL
  (HIL is an advanced extension).
- Each module ends with a non-lesson **"Future Directions / Physical AI Connection"**
  section (visibility without required AI outcomes). Demos/figures are used **only where
  they add value** and are reused by reference — never duplicated to fill a slot.

---

## M0 — The Machine & the Digital Twin  *(twin maturity: Observe)*

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 0.1 The PKM project & fluid-power system | describe the machine and its subsystems | System block diagram (→ all) | reference-machine viz | identify kit parts | brief check |
| 0.2 Why a digital twin, and twin-first | run and read the reference twin | Annotated observation log (→ twin) | run a preset, read logs | — | observation check |
| 0.3 Proposal & architecture sketch | scope their build | **Project proposal + architecture sketch** (→ all) | — | kit inventory | proposal rubric |

---

## M1 — Create the 2-DOF Digital Twin  *(maturity: Kinematic Twin)*

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 1.1 Coordinate systems & 2-RPR geometry | define the machine frame | Geometry config (anchors, base) (→ twin) | geometry setup | — | config check |
| 1.2 Inverse kinematics | turn a pose into leg lengths | **Working IK** in the twin (→ twin) | kinematics 2-DOF | — | IK unit check |
| 1.3 Forward kinematics | recover pose from leg lengths | **Working FK**, round-trip verified (→ twin) | kinematics 2-DOF | — | FK round-trip check |
| 1.4 Workspace & reachability | bound the usable region | **Workspace map** (→ twin, 2-DOF) | reachability + heatmap | — | map + corner checks |

**Module deliverable:** the **Kinematic Twin** (IK/FK + workspace map).

---

## M2 — Electrohydraulic Actuation & the Physical 2-DOF Build  *(maturity: Hydraulic Twin)* — **MIDTERM**

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 2.1 Cylinders & area asymmetry | size a cylinder; explain φ | Cylinder spec + asymmetry calc (→ 2-DOF) | hydraulics (cylinder) | inspect cylinders | spec check |
| 2.2 Solenoid DCVs, flow & pressure | read a DCV; relate flow↔pressure | Valve/flow worksheet; DCV operation note (→ 2-DOF) | hydraulics (valve) | identify DCVs | worksheet |
| 2.3 Hydraulic power unit & sizing | size pump/relief/power | **Hydraulic sizing report** (→ 2-DOF) | hydraulics (pump/power) | inspect HPU | sizing report |
| 2.4 Sensors & signal scaling | map sensor volts ↔ length/pressure | Sensor scaling table (→ 2-DOF, twin) | logger/signal | wire sensors | scaling check |
| 2.5 PWM actuation of on/off DCVs | move an axis via PWM duty cycle | **Duty-cycle characterization** (→ 2-DOF) | **DCV+PWM mode** (new) | PWM driver lab | duty-cycle curve |
| 2.6 Position control with on/off valves | hit a target within a deadband; explain limits vs. proportional | **Position-control demo** (deadband, limit cycle) (→ 2-DOF) | **DCV+PWM mode** (new) | closed positioning | position-within-deadband test |
| 2.7 Commission the 2-DOF machine | run the real rig to spec | **Working 2-DOF prototype + twin-vs-rig report** (→ 2-DOF) | full hydraulic twin | full assembly & commissioning | **MIDTERM rubric** |

**Module deliverable:** working **2-DOF hardware** + **Hydraulic Twin**. *Signature outcome lives in 2.5–2.6.*

---

## M3 — Coordinated Control & Extension to 3-DOF  *(maturity: Control Twin)*

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 3.1 Jacobian & manipulability | quantify dexterity across the workspace | **Manipulability map** (→ twin, 3-DOF) | Jacobian | — | map check |
| 3.2 Singularities & safe region | bound a safe operating region | **Singularity/safe-region map** (→ 3-DOF) | singularity fault | — | region check |
| 3.3 Coordinated (joint-space) control | drive multiple axes along a path | Coordinated-control run (→ 3-DOF) | control + trajectory | rig path test | path-tracking check |
| 3.4 Task-space control | regulate pose directly | Task-space controller config + comparison (→ 3-DOF) | control (task-space) | — | comparison report |
| 3.5 3-RPR kinematics (the 3-DOF twin) | solve pose↔legs for 3 DOF | **Working 3-DOF IK/FK** (→ twin, 3-DOF) | kinematics 3-DOF (Newton) | — | 3-DOF round-trip check |
| 3.6 Tuning under PWM (limit cycles) | tune bang-bang motion to spec | **Tuned-control report** (duty/deadband, limit-cycle amplitude) (→ 3-DOF) | DCV+PWM + grading | rig tuning | tuned-response test |

**Module deliverable:** the **Control Twin** (coordinated control + 3-DOF twin).

---

## M4 — System Integration and Advanced Applications  *(maturity: Validation Twin)* — **FINAL**

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 4.1 Log schema & twin↔hardware **log synchronization** | record twin and rig on one schema | **Synchronized log set** (→ integration) | logger/schema | instrument rig | sync check |
| 4.2 Validation & verification (replay) | replay logs to validate the twin | **V&V report** (twin vs. rig) (→ integration) | trace/replay, grading | rig data capture | V&V report |
| 4.3 Performance evaluation | score accuracy/settling/duty efficiency | **Performance report** (→ integration) | grading metrics | rig runs | metrics rubric |
| 4.4 Integrate & validate the 3-DOF machine | operate the full system to spec | **Integrated 3-DOF system** (→ 3-DOF, integration) | full stack | 3-DOF build & integration | **FINAL rubric** |
| 4.5 *(optional)* Physical AI extension | prototype trajectory/autonomy/vision | Extension demo or proposal (→ optional) | external / advanced | optional | optional credit |

**Module deliverable:** **integrated, validated 3-DOF system** + performance report.
**Twin synchronization = log sync + replay** (per directive); real-time HIL is the 4.5 extension territory.

---

## Orphan-lesson check

All **24 required lessons** produce an artifact contributing to the twin, the 2-DOF build,
the 3-DOF build, or the final integration (see the "Artifact → anchor" column). **No
artifact-less lessons. No orphans.** The one optional lesson (4.5) is clearly marked.

**Counts:** M0 = 3 · M1 = 4 · M2 = 7 · M3 = 6 · M4 = 4 (+1 optional). Total **24 required**.

---

## Dashboard

**Green:** artifact-per-lesson · project-sequenced (build-step lessons, not topic restatements,
which structurally removes the old repeated-demo problem) · Path A reflected in M2/M3 ·
signature outcome placed · twin maturity advances one step per module · no orphan lessons.

**Remaining Yellow (acceptable for Gate 2 per your note):**

| Item | Note |
|---|---|
| Student cohort level | needed to set lesson depth at Gate 5; does not block this architecture |
| `DCV+PWM` simulator mode | required by 2.5/2.6/3.6 (Path A); a build task scheduled before Gate 5 |
| Live twin↔hardware sync | out of scope for M4 (log+replay chosen); reserved for 4.5 extension |

**Red:** none.

---

## Decision requested

Approve **Gate 2**, or mark lessons to add/cut/merge. On approval, the remaining gates are:

- **Gate 3 — Simulator Alignment:** formal activity↔capability matrix (including the new
  **DCV+PWM** requirement) — confirming every simulator feature has a curriculum purpose and
  every activity has simulator support.
- **Gate 4 — Assessment Alignment:** quiz/lab mapping, midterm & final rubrics, competency matrix.
- **Gate 5 — Content Production Authorization:** only after Gates 0–4 are approved does lesson/
  notebook/quiz/figure/demo/handbook generation begin.
