# Gate 5B — Lesson Compliance Audit (v2)

Re-run under the **Curriculum Integrity Directive** (supersedes v1). Four-state classification
(PASS / REVISE / RESTRUCTURE / MOVE), Rule 11 template, ownership audit before editing.

## Correction to v1

v1 flagged every lesson for lacking its **own** acceptance test. **Rule 5 reverses this:**
acceptance tests belong to **artifacts**; lessons *reference* them and must not own or duplicate
them. The fix is a referenced acceptance test at the verification step — not an embedded one.

## Result

| State | Count | Lessons |
|---|---|---|
| PASS | 0 | — (none fully compliant yet) |
| MOVE | 2 | M4 1.2 Sensors, M4 1.3 Wiring → **Hardware Integration** (Rule 4) |
| RESTRUCTURE | 0 | no lesson currently owns an artifact's acceptance test |
| REVISE | 21 | all of M1, M2, M3, and M4 1.1 / 2.1 / 2.2 |

**Jacobian & Manipulability (M1 §3.1)** — the directive cited this as a possible MOVE to Control.
Audited: its competencies (C11/C12) and assets (A6, B2, B3, Family 1, Quiz 4) are all kinematic;
manipulability/dexterity is a property of the mechanism. **Stays in Kinematic Twin.** The control
*use* of the Jacobian is taught in M3 task-space control. (If you define manipulability as a
control competency, it becomes a MOVE — but that would reassign C11/C12 and B2/B3 too.)

## Ownership audit (Rule 3) — Module · Stage · Competency · Artifact · Milestone

### Module 1 — Kinematic Twin · Milestone: kinematic model (pre-midterm)
| Lesson | Stage | Competency | Artifact | Status | Reason |
|---|---|---|---|---|---|
| 1.1 What Is a PKM | Kinematic | C2 | Geometry config | REVISE | R6 R9 R10; nav de-Unit |
| 1.2 Geometry & Pose | Kinematic | C2 | Geometry config | REVISE | R6 R9 R10 |
| 2.1 Inverse Kinematics | Kinematic | C2 | IK/FK impl. | REVISE | R6 R7 R9 R10 |
| 2.2 Forward Kinematics | Kinematic | C3 | IK/FK impl. | REVISE | R6 R7 R9 R10 |
| 2.3 Reachability | Kinematic | C4 | Workspace map | REVISE | R6 R9 R10 |
| 3.1 Jacobian & Manipulability | Kinematic | C11 | Manipulability map | REVISE | R6 R7 R9 R10 (location confirmed) |
| 3.2 Singularities | Kinematic | C12 | Safe-region map | REVISE | R6 R7 R9 R10 |

### Module 2 — Hydraulic Twin · Milestone: midterm 2-DOF build (W8)
| Lesson | Stage | Competency | Artifact | Status | Reason |
|---|---|---|---|---|---|
| 1.1 The Hydraulic Cylinder | Hydraulic | C5 | Hydraulic Sizing Report | REVISE | R6 R9 R10 |
| 1.2 Area Asymmetry φ | Hydraulic | C5 | Hydraulic Sizing Report | REVISE | R6 R7 R9 R10 |
| 1.3 Force and Speed | Hydraulic | C5 | Hydraulic Sizing Report | REVISE | R6 R7 R9 R10 |
| 2.1 The Valve Flow Law | Hydraulic | C5 | Hydraulic Sizing Report | REVISE | R6 R7 R9 R10 |
| 2.2 Load Pressure & the Jacobian | Hydraulic | C5 | Hydraulic Sizing Report | REVISE | R6 R7 R9 R10 |
| 2.3 Pump & Relief Sizing | Hydraulic | C5 | Sizing / Design Review | REVISE | R6 R7 R9 R10 |

### Module 3 — Control Twin · Milestone: control (pre-final) · Path A emphasis
| Lesson | Stage | Competency | Artifact | Status | Reason |
|---|---|---|---|---|---|
| 1.1 Why Feedback | Control | C6 | Position-control demo | REVISE | R6 R7 R8 R9 R10; old assets |
| 1.2 PID Control (+ PWM on/off) | Control | C6/C7 | Duty characterization / Position control | REVISE | R6 R7 R8 R9 R10; broken demo, Path A |
| 1.3 The Tuning Trade-off | Control | C14 | Tuned Control Report | REVISE | R6 R7 R8 R9 R10; broken demo |
| 2.1 Joint-Space vs Task-Space | Control | C13 | Coordinated runs | REVISE | R6 R7 R8 R9 R10 |
| 2.2 Feedforward & Tracking | Control | C13/C14 | Coordinated / Tuned report | REVISE | R6 R7 R8 R9 R10; broken demo |

### Module 4 — Validation Twin + Hardware Integration · Milestone: final 3-DOF validated (W15)
| Lesson | Cur → Proposed Stage | Competency | Artifact | Status | Reason |
|---|---|---|---|---|---|
| 1.1 The Three Domains | Validation | C16 | Integration overview | REVISE | R6 R8 R9 R10 |
| 1.2 Sensors & Valve Drivers | Validation → **Hardware Integration** | (hardware) | Design-review inputs | **MOVE** | R4 cross-cutting; then R6 R8 R9 R10 |
| 1.3 Wiring & Safety Chain | Validation → **Hardware Integration** | (hardware) | Design-review inputs | **MOVE** | R4 cross-cutting; then R6 R8 R9 R10 |
| 2.1 Logging & the Canonical Schema | Validation | C15 | Twin Accuracy (logging) | REVISE | R6 R8 R9 R10 |
| 2.2 Grading Sim & Hardware Identically | Validation | C16 | Twin Accuracy / Final Integration | REVISE | R6 R7 R8 R9 R10 |

## Rule key
R4 twin-stage (Hardware Integration allowed) · R5 acceptance test referenced not owned · R6 assets
as instructional objects (use→observe→interpret→apply) · R7 equation provenance · R8 asset
existence verified · R9 project context before theory · R10 inline integration (no appended block).

## Resolution sequence (Rule 12)

1. Audit — **complete (this document).**
2. Classify — **done** (0 PASS / 2 MOVE / 0 RESTRUCTURE / 21 REVISE).
3. **Resolve MOVE:** create a **Hardware Integration** nav group; move M4 §1.2, §1.3 there.
4. Resolve RESTRUCTURE: none.
5. **Resolve REVISE (module by module):** apply the compliant template —
   - header `Twin Stage · Competency · Artifact · Milestone` (drop Unit breadcrumb, R10/R1);
   - project-relevance opening (R9);
   - explicit **Artifact Contribution** line;
   - concept→figure / procedure→demo / verification→notebook used as instructional objects (R6, R10);
   - every equation tagged with provenance (R7);
   - acceptance test **referenced** from the artifact/handbook at the verification step (R5);
   - assessment→quiz inline; remove the appended "Aligned assets" block (R10);
   - M3/M4 figures/demos repointed to canonical assets (R8).
6. Produce the clean re-audit report (target: all PASS).
7. Resume any remaining new prose.

## Decision requested

1. Confirm **Jacobian & Manipulability stays in Kinematic Twin** (recommended) — or direct the MOVE.
2. Confirm the **Hardware Integration** nav group for M4 §1.2/§1.3 (Rule 4).
3. Approve executing the resolution sequence (MOVE → REVISE → clean re-audit) before any new prose.
