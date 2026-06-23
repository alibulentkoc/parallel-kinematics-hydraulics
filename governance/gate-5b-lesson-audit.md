# Gate 5B — Lesson Compliance Audit

Per the Retroactive and Forward Lesson Compliance Directive. Every lesson audited against all ten
checks. No lesson is grandfathered — including the Module 1–2 lessons revised earlier this session.

## Result: 0 PASS / 23 REVISE

No lesson currently satisfies all ten checks. The failures are systemic (the same few causes
recur), so the fix is a single compliant template applied to every lesson.

## Systemic failures (apply to all 23 unless noted)

| Check | Finding | Affected |
|---|---|---|
| 4 · Artifact Produced | no explicit "Artifact Produced" line | all 23 |
| 8 · Acceptance Test | no explicit inline "Acceptance Test" with threshold | all 23 |
| 10 · Navigation | old topic-centered "Module · Unit · Lesson" breadcrumb framing | all 23 |
| 7 · Asset Integration | assets not placed at point of use | Modules 1–2 (appended block); Modules 3–4 (absent) |
| 5 · Asset Alignment | old `assets/` figures + removed demos (`cylinder-asymmetry`, `orifice-flow`, `pid-tuning`) | Modules 3–4 |
| 6 · Equation Traceability | equations not attributed to a canonical source | lessons containing equations |
| 9 · Project Relevance | "why this advances the project" not stated as such before theory | most (Modules 1–2 have "Why this matters"; needs project-advancement framing) |

Checks **1 (module), 2 (twin stage), 3 (competency)** pass for Modules 1–3 (correct placement).
**Module 4 hardware lessons (1.2 Sensors, 1.3 Wiring) have a twin-stage ambiguity** — they are
cross-cutting hardware, not one of the five twin stages — flagged below.

## Per-lesson audit

Asset targets are the approved Lesson→Asset map; "Status" is the directive's PASS/REVISE.

### Module 1 — Kinematic Twin (M1)
| Lesson | Competency | Artifact | Acceptance test | Status | Reason |
|---|---|---|---|---|---|
| 1.1 What Is a PKM | C2 | Geometry config (intro) | round-trip < 1e-6 m | REVISE | #4 #8 #10; assets appended (#7) |
| 1.2 Geometry & Pose | C2 | Geometry config | round-trip < 1e-6 m | REVISE | #4 #8 #10 #7 |
| 2.1 Inverse Kinematics | C2 | IK/FK impl. | round-trip < 1e-6 m | REVISE | #4 #8 #10 #7 #6 |
| 2.2 Forward Kinematics | C3 | IK/FK impl. | round-trip < 1e-6 m | REVISE | #4 #8 #10 #7 #6 |
| 2.3 Reachability | C4 | Workspace map | workspace classified; \|det J\| ≥ 0.02 | REVISE | #4 #8 #10 #7 |
| 3.1 Jacobian & Manipulability | C11 | Manipulability map | \|det J\| ≥ 0.02 | REVISE | #4 #8 #10 #7 #6 |
| 3.2 Singularities | C12 | Safe-region map | \|det J\| ≥ 0.02 | REVISE | #4 #8 #10 #7 #6 |

### Module 2 — Hydraulic Twin (M2)
| Lesson | Competency | Artifact | Acceptance test | Status | Reason |
|---|---|---|---|---|---|
| 1.1 The Hydraulic Cylinder | C5 | Hydraulic Sizing Report | φ ≤ 1.6 | REVISE | #4 #8 #10 #7 |
| 1.2 Area Asymmetry φ | C5 | Hydraulic Sizing Report | φ ≤ 1.6 | REVISE | #4 #8 #10 #7 #6 |
| 1.3 Force and Speed | C5 | Hydraulic Sizing Report | F_ext ≥ load | REVISE | #4 #8 #10 #7 #6 |
| 2.1 The Valve Flow Law | C5 | Hydraulic Sizing Report | flow within rating | REVISE | #4 #8 #10 #7 #6 |
| 2.2 Load Pressure & the Jacobian | C5 | Hydraulic Sizing Report | hold ≤ relief | REVISE | #4 #8 #10 #7 #6 |
| 2.3 Pump & Relief Sizing | C5 | Sizing Report / Design Review | flow ≤ pump max; hold ≤ relief | REVISE | #4 #8 #10 #7 #6 |

### Module 3 — Control Twin (M3)
| Lesson | Competency | Artifact | Acceptance test | Status | Reason |
|---|---|---|---|---|---|
| 1.1 Why Feedback | C6 | Position-control demo | tracking ≤ 10 mm | REVISE | #4 #5 #6 #7 #8 #9 #10; old assets, Path A emphasis |
| 1.2 PID Control (+ PWM on/off) | C6/C7 | Duty characterization / Position control | settling ≤ 2.5 s | REVISE | #4 #5 #6 #7 #8 #9 #10; broken demo, Path A emphasis |
| 1.3 The Tuning Trade-off | C14 | Tuned Control Report | settling ≤ 2.5 s | REVISE | #4 #5 #6 #7 #8 #9 #10; broken demo |
| 2.1 Joint-Space vs Task-Space | C13 | Coordinated runs | tracking ≤ 10 mm | REVISE | #4 #5 #7 #8 #9 #10 |
| 2.2 Feedforward & Tracking | C13/C14 | Coordinated / Tuned report | tracking ≤ 10 mm | REVISE | #4 #5 #6 #7 #8 #9 #10; broken demo |

### Module 4 — Validation Twin (M4) + hardware
| Lesson | Competency | Artifact | Acceptance test | Status | Reason |
|---|---|---|---|---|---|
| 1.1 The Three Domains | C16 | Integration overview | — (orientation) | REVISE | #4 #5 #7 #9 #10 |
| 1.2 Sensors & Valve Drivers | (hardware) | Design-review inputs | — | REVISE | #2 twin-stage ambiguity; #4 #5 #7 #9 #10 |
| 1.3 Wiring & Safety Chain | (hardware) | Design-review inputs | — | REVISE | #2 twin-stage ambiguity; #4 #5 #7 #9 #10 |
| 2.1 Logging & the Canonical Schema | C15 | Twin Accuracy (logging) | schema matches engine | REVISE | #4 #5 #7 #8 #9 #10 |
| 2.2 Grading Sim & Hardware Identically | C16 | Twin Accuracy / Final Integration | RMSE ≤ 10 mm; pressure ≤ 15% | REVISE | #4 #5 #6 #7 #8 #9 #10 |

## Compliant lesson template (the fix)

Revision replaces the appended-block approach with **point-of-use integration** and adds the
missing required fields. Every revised lesson will have:

1. **Header (replaces Unit breadcrumb) [#10, #1–3]** — `Twin Stage · Competency · Artifact · Milestone`.
2. **Project relevance, before theory [#9]** — one paragraph: *why the student needs this to advance the build*.
3. **Artifact Produced [#4]** — explicit line naming the deliverable and its place in the chain.
4. **Concept → Figure [#7]** — each concept introduces its canonical figure inline.
5. **Equation (with source) [#6]** — every equation tagged `(source: engine / Fig X / Handbook Ch N)`.
6. **Procedure → Demo [#7]** — steps reference the Family demo/view at the point of use.
7. **Verification → Notebook + Acceptance Test [#7, #8]** — the notebook call **and** the explicit threshold inline.
8. **Assessment → Quiz [#7]** — the summative quiz at the assessment point.

The trailing "## Aligned assets" block added in Modules 1–2 will be **removed** and its links
distributed to their point of use.

## Sequence (per directive)

1. **Audit — complete (this document).**
2. Revise all 23 to the compliant template (module by module: re-do M1/M2 to integrate inline +
   add fields; align M3/M4 figures/demos + add fields; resolve M4 hardware twin-stage).
3. Produce the compliance report (re-audit → all PASS).
4. Resume writing any remaining new prose.

## Decision requested

Two items before revision:
1. **M4 hardware twin-stage:** assign Sensors/Wiring lessons to a stage. Recommended: **Validation
   Twin** (they exist to make the sim↔rig bridge real), with the wiring detail pointing to Handbook
   Appendix A. Alternatively a labeled "Hardware / Commissioning" bridge under M2.
2. **Approve the compliant template** so I revise all 23 to it, then produce the all-PASS
   compliance report — before any further new prose.
