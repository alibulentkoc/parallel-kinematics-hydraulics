# Curriculum Certification Report

**Project:** Browser-based electrohydraulic Parallel Kinematics Machine (PKM) teaching package —
verified JS simulation engine + MkDocs curriculum. Path A (solenoid on/off DCV + PWM).

Issued after the Final Curriculum Consistency Directive (FC-1 … FC-7). This certifies that every
module passes the final audit, the simulator is the single source of truth, and the curriculum's
identity — **Fluid Power + Digital Twin + PWM Control** — is visible throughout.

## 1. Module PASS table (FC-7)

| Module | Stage | Lessons | Status |
|---|---|---|---|
| M1 | Kinematic Twin | 7 | **PASS** |
| M2 | Hydraulic Twin | 6 | **PASS** |
| M3 | Control Twin | 5 | **PASS** |
| M4 | Validation Twin | 3 | **PASS** |
| Hardware Integration | Cross-cutting | 2 | **PASS** |

23 lessons audited; **0 failing any check** (Structure · Assets · Identity · Standards · Validation ·
Navigation).

## 2. Competency coverage

| Module | Competencies |
|---|---|
| M1 Kinematic | C2 (system/IK), C3 (FK), C4 (workspace), C11 (manipulability), C12 (singularities) |
| M2 Hydraulic | C5 (cylinder, φ, force/speed, valve flow, load pressure, pump/relief) |
| M3 Control | C6 (feedback), C7 (PWM position), C13 (coordinated/task-space), C14 (tuning/feedforward) |
| M4 Validation | C15 (logging/Measure), C16 (validation & diagnosis) |
| Hardware | Signal-domain & safety-chain infrastructure (design-review gated) |

Every lesson declares its competency in the header; the signature outcome — **position control with
on/off valves via PWM, with limits explained vs proportional** — is carried by M3 (C6/C7) and
validated in M4 (C16).

## 3. Artifact coverage

| Stage | Artifacts (lessons contribute → artifact emerges) |
|---|---|
| Kinematic | Geometry config · IK/FK Implementation · Workspace map · Manipulability map · Safe-region map |
| Hydraulic | Hydraulic Sizing Report (cylinder · φ · force/speed · valve · load pressure · pump/relief) |
| Control | Position-control demo · Duty characterization · Tuned Control Report · Coordinated tracking runs |
| Validation | Twin Accuracy Report · **Twin Discrepancy Analysis** · Final Integration Report |
| Hardware | Design-review inputs (sensor/driver selection · wiring · signal↔channel map · safety chain) |

Acceptance tests are **owned by the artifacts** (Handbook Ch 2–5) and **referenced** by lessons,
never re-defined. Every lesson header states its artifact contribution.

## 4. Demo coverage

| Family | Demo | Used by |
|---|---|---|
| Family 1 | kinematics-explorer | M1 |
| Family 2 | hydraulic-explorer | M2, Hardware (sensors) |
| Family 3 | pwm-control-lab | M3 |
| Family 4 | digital-twin-validation | M4, Hardware (wiring) |

All four families are live; each lesson uses its demo as an instructional object
(**Observe → Interpret → Apply**), not a passive link. Removed single-purpose demos
(cylinder-asymmetry, orifice-flow, pid-tuning) are de-referenced and archived.

## 5. Assessment coverage

| Quiz | Topic | Modules |
|---|---|---|
| Quiz 1 | Kinematics | M1 (1.1–2.3) |
| Quiz 4 | 3-DOF / Manipulability | M1 (3.1–3.2) |
| Quiz 2 | Hydraulic Sizing (ISO items) | M2, Hardware (sensors) |
| Quiz 3 | PWM Position Control | M3 (1.1–1.2) |
| Quiz 5 | Coordinated Tuning | M3 (1.3, 2.1–2.2) |
| Quiz 6 | Twin Validation | M4, Hardware (wiring) |

6 Gate 5B competency quizzes (48 questions, ≥50% asset-grounded, answer keys cite
`verifies: C# · artifact · asset`). Every lesson links the correct quiz.

## 6. Standards compliance (FC-5)

**COMPLIANT.** ISO 1219 / ANSI Y32.10 applied across figures (A3/A4/A5), demos (Family 2), quizzes
(Q2/Q3), handbook (Ch 3 + index), and all 6 Module 2 lessons. See
`gate-5b-standards-compliance.md`. Hardware Integration (electrical I/O) is correctly scoped to
Handbook Appendix A, outside the fluid-power symbol standard.

## 7. Validation identity (FC-3)

Module 4 teaches **Measure → Compare → Diagnose → Correct** with the **Diagnose** step mandatory.
The **Twin Discrepancy Analysis** artifact is visible (B14 discrepancy signatures embedded in the
grading lesson; Family 4 Diagnose view; N4/N5). Pre-REVISE the module mentioned "diagnose" 0 times;
it now diagnoses faults by signature (geometry · sensor · deadband · pressure · timing).

## 8. Source-of-truth (FC-4) & asset dependency (FC-2)

Every figure is a **canonical SVG**, **demo export**, or **notebook output** — no independent
calculations or divergent plots. Every referenced asset was verified to **exist on disk** (not just
linked): all figures, demos, notebooks, and quizzes resolve.

## 9. Archive status (FC-6)

| Archived (excluded via `archive/*`) | Replacement |
|---|---|
| 5 topic lessons (01–05 kinematics/hydraulic/control/wiring/worked-example) | 23 stage-based lessons |
| 23 per-lesson quizzes (`m*-l*.html`) | 6 Gate 5B competency quizzes |
| 3 single-purpose demos (cylinder-asymmetry, orifice-flow, pid-tuning) | 4 demo families |
| Topic handbook (`handbook.md`) | Project-centered handbook (Ch 2–5 + Appendix A) |

FC-6 verified **zero active references** to archived content from any lesson, handbook chapter,
quiz, or notebook **before** archiving. Redirect notes are in place.

## 10. Identity check (FC-1)

No lesson could sit unchanged in a generic course:
- **Kinematic/Hydraulic** lessons are PKM- and electrohydraulic-specific (2-RPR geometry, ISO
  cylinders/valves/HPU).
- **Control** lessons carry the Path A identity (PWM on/off primary, proportional benchmark) —
  PWM/on-off went from 0 to 5–14 mentions per lesson.
- **Validation** lessons teach twin diagnosis, not generic model comparison.
- **Hardware** lessons are explicitly cross-cutting infrastructure tied to Appendix A.

---

## Certification

The curriculum is **COMPLETE and CERTIFIED**: 5/5 modules PASS, simulator is the single source of
truth, standards-compliant, identity visible throughout, archives clean. Engine `npm test` green;
repository integrity verified.
