# Gate 5B — Module Asset Audit

Required before any lesson rewrite (Curriculum Integrity Directive). For every lesson: the target
canonical assets, and a check that it references **no** archived asset, removed demo, old handbook
page, or old quiz. Lessons **contribute to** artifacts (artifacts emerge across lessons).

## Forbidden-reference scan (current state → must be clear after REVISE)

| Group | old `assets/` | removed demos | old handbook 01–05 | old quiz `m*-l*` |
|---|---|---|---|---|
| Module 1 (7) | — | — | — | **all 7** |
| Module 2 (6) | — | — | — | **all 6** |
| Module 3 (5) | 1.1, 1.2 | 1.1,1.2,1.3,2.2 | — | **all 5** |
| Module 4 / HW (5) | 1.1, sensors | sensors, grading | — | **all 5** |

**Systemic finding:** every lesson still links the **old per-lesson quiz HTML** (`m*-l*.html`),
a parallel system superseded by Gate 5B **Q1–Q6**. REVISE repoints all to Q1–Q6; the 23
`m*-l*.html` are archived like the old handbook pages. M3/M4 additionally carry old `assets/`
figures and removed-demo links (to be repointed to canonical figures + Family 3/4).

## Target asset map (what each lesson will use after REVISE)

### Module 1 — Kinematic Twin · Handbook Ch 2 · Family 1 · N1
| Lesson | Figure(s) | Demo · view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 | A1, C1 | Family 1 · Live | N1 | Q1 |
| 1.2 | A1 | Family 1 · Live | N1 | Q1 |
| 2.1 | A1 | Family 1 · Live | N1 | Q1 |
| 2.2 | A1 | Family 1 · Live | N1 | Q1 |
| 2.3 | B1 | Family 1 · Workspace | N1 | Q1 |
| 3.1 | A6, B2 | Family 1 · Manipulability | N1 | Q4 |
| 3.2 | A6, B3 | Family 1 · Singularity | N1 | Q4 |

### Module 2 — Hydraulic Twin · Handbook Ch 3 · Family 2 · N2 · Q2
| Lesson | Figure(s) | Demo · view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 | A3 | Family 2 · Cylinder | N2 | Q2 |
| 1.2 | A3, B4 | Family 2 · Cylinder | N2 | Q2 |
| 1.3 | B4, B5 | Family 2 · Cylinder/Valve | N2 | Q2 |
| 2.1 | A4, B5 | Family 2 · Valve | N2 | Q2 |
| 2.2 | B4, A6 | Family 2 · Sensor | N2 | Q2 |
| 2.3 | A5, B6 | Family 2 · Pump | N2 | Q2 |

### Module 3 — Control Twin · Handbook Ch 4 · Family 3 · N3 · Q3/Q5
| Lesson | Figure(s) | Demo · view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 Why Feedback | A8 | Family 3 · Position | N3 | Q3 |
| 1.2 PID (+ PWM on/off) | A7, A8, B8 | Family 3 · Position/Duty | N3 | Q3 |
| 1.3 Tuning Trade-off | B7, B10 | Family 3 · Duty/Tuning | N3 | Q5 |
| 2.1 Joint vs Task-Space | B9 | Family 3 · Coordinated | N3 | Q5 |
| 2.2 Feedforward & Tracking | B9, B10 | Family 3 · Coordinated/Tuning | N3 | Q5 |

### Module 4 — Validation Twin · Handbook Ch 5 · Family 4 · N4/N5 · Q6
| Lesson | Figure(s) | Demo · view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 The Three Domains | C6, A9 | all families | — | — |
| 2.1 Logging & Schema | A9 | Family 4 · Sync | N4 | Q6 |
| 2.2 Grading Sim & Hardware | A10, B11–B14 | Family 4 · Accuracy/Diagnose | N4, N5 | Q6 |

### Hardware Integration (cross-cutting) · Handbook Appendix A
| Lesson | Figure(s) | Demo · view | Notebook | Quiz |
|---|---|---|---|---|
| Sensors & Valve Drivers | Appendix A tables | Family 2/3 (reference) | — | — |
| Wiring & Safety Chain | Appendix A signal map | — | — | — |

## Asset existence verification (Rule 8)

All target assets exist and are committed: figures A1–A10, B1–B14, C1–C7 (`docs/figures`);
demos Family 1–4 (`docs/demos`); notebooks N0–N5 (`docs/notebooks`); quizzes Q1–Q6
(`docs/quizzes`); handbook Ch 1–5 + Appendix A (`docs/handbook`). Verified present this session.

## Exit condition for REVISE

After revision, the forbidden-reference scan must return **all dashes** (no archived assets, no
removed demos, no old handbook pages, no old `m*-l*` quizzes), and every lesson's asset references
must match the target map above.
