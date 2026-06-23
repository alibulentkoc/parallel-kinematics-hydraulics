# Gate 3 — Addendum: Semester Artifact Map & Traceability

Two additions requested at Gate 2 Rev B approval, attached to Gate 3.

**Status note on your open-items list:** per Gate 3 (delivered previously), the **DCV+PWM /
bang-bang valve model is already implemented and tested** — item #1 is **closed**, not open.
The only remaining simulator task is the small **Twin Accuracy metrics** add (RMSE /
duty-cycle / pressure-prediction error). Items #2 (student cohort) and #3 (twin-sync scope =
log-sync + replay) stand as noted.

---

## A. Semester Artifact Map — the Student Roadmap

A single page giving students a constant sense of progress: one **headline artifact per
week**, across a 15-week semester. The 15 headline artifacts are exactly the chain you
endorsed; the contributing lessons are shown for reference.

| Week | Headline artifact | Module / lessons | Twin maturity | Milestone |
|---|---|---|---|---|
| 1 | **Project Proposal + architecture sketch** | M0.1–0.3 | Observe | — |
| 2 | **Geometry Configuration** (2-RPR) | M1.1 | Kinematic | — |
| 3 | **IK/FK Implementation** | M1.2–1.3 | Kinematic | — |
| 4 | **Workspace Map** | M1.4 | **Kinematic Twin ✓** | — |
| 5 | **Hydraulic Sizing Report** | M2.1–2.3 | Hydraulic | — |
| 6 | **PWM Characterization** (duty-cycle) | M2.4–2.5 | Hydraulic | — |
| 7 | **Design Review Package** | M2.6–2.7 | Hydraulic | design-review gate |
| 8 | **2-DOF Prototype** (+ twin-vs-rig) | M2.8 | **Hydraulic Twin ✓** | ★ **MIDTERM** |
| 9 | **3-DOF Twin** (geometry + IK/FK) | M3.1–3.2 | Control | — |
| 10 | **Manipulability Map** | M3.3 | Control | — |
| 11 | **Safe-Region Map** | M3.4 | Control | — |
| 12 | **Tuned Control Report** | M3.5–3.6 | **Control Twin ✓** | — |
| 13 | **Synchronized Logs** | M4.1 | Validation | — |
| 14 | **Twin Accuracy Report** | M4.2–4.3 | Validation | Twin ≈ Machine |
| 15 | **Integrated 3-DOF System** | M4.4 | **Validation Twin ✓** | ★ **FINAL** |

*(Optional, post/parallel: M4.5 Physical AI extension — extra credit.)*

Reads as a build, not a syllabus: **propose → model → size → build → control → validate → integrate.**

---

## B. Traceability — every artifact ↔ simulator capability ↔ assessment evidence

The drift-prevention table you asked for, covering **every lesson artifact**.

### M0
| Artifact | Simulator capability | Assessment evidence |
|---|---|---|
| Project proposal + architecture | reference-machine viz (preset run) | Proposal rubric |

### M1
| Artifact | Simulator capability | Assessment evidence |
|---|---|---|
| Geometry configuration | geometry setup | Config check |
| IK implementation | `kinematics2dof` | IK unit check |
| FK implementation | `kinematics2dof` (round-trip) | FK round-trip check |
| **Workspace map** | **reachability + heatmap** | **Workspace rubric** |

### M2  *(midterm)*
| Artifact | Simulator capability | Assessment evidence |
|---|---|---|
| Cylinder spec + asymmetry | `hydraulics` (cylinder) | Spec check |
| Valve / flow worksheet | `hydraulics` (valve) | Worksheet |
| Hydraulic Sizing Report | `hydraulics` (pump/power) | Sizing-report rubric |
| Sensor scaling table | `logger` / signal scaling | Scaling check |
| **PWM characterization** | **`valve` `pwm`/`bangbang` model** | **Duty-cycle lab** |
| Position-control demo | `valve` `bangbang` + `controller` | Position-within-deadband test |
| Design Review Package | sizing models (cross-check) | **Design Review Rubric** |
| 2-DOF prototype + twin-vs-rig | full hydraulic twin | **Midterm rubric** |

### M3
| Artifact | Simulator capability | Assessment evidence |
|---|---|---|
| 3-RPR geometry config | geometry setup | Config check |
| 3-DOF IK/FK | `kinematics3dof` (Newton) | Round-trip check |
| **Manipulability map** | **Jacobian + heatmap** | **Manipulability rubric** |
| Safe-region map | singularity fault detector | Region check |
| Coordinated / task-space control | `controller` joint + task, trajectory | Path-tracking check |
| Tuned control report | `valve` `pwm` + grading metrics | Tuned-response test |

### M4  *(final)*
| Artifact | Simulator capability | Assessment evidence |
|---|---|---|
| Synchronized logs | `logger` + `schema` | Sync check |
| V&V report | `trace` replay | V&V report |
| **Twin Accuracy Report** | **`logger` + replay + grader + new RMSE/duty/pressure metrics** | **Validation rubric** |
| Integrated 3-DOF system | full stack | **Final rubric** |
| *(opt)* Physical AI extension | external / advanced | Optional credit |

**Every artifact has both a simulator capability and an assessment** — the only cell needing
new engine work is the Twin Accuracy Report's metrics (small, already scoped). This table is
the contract that keeps the simulator and curriculum from drifting apart.

---

## Updated open-items / risk register

| Item | Status |
|---|---|
| DCV+PWM simulator mode | ✅ **closed** — already implemented & tested |
| Twin Accuracy metrics (RMSE / duty / pressure-error) | 🟡 small `metrics` add, scheduled into Gate 5 build |
| Student cohort definition | 🟡 needed to set depth at Gate 5 |
| Twin-sync interface scope | ✅ resolved — log-sync + replay (no HIL) |

**No RED items.**

---

## Decision requested

Approve **Gate 3** (now including the Student Roadmap and the artifact↔simulator↔assessment
traceability). On approval → **Gate 4 — Assessment Alignment** (quiz/lab mapping, the midterm
and final rubrics referenced above, and the competency matrix), then **Gate 5 — Content
Authorization**.
