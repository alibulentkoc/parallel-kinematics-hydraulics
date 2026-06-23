# Gate 5B — Lesson Prose Plan

The final content phase. Every supporting asset (demos, figures, quizzes, notebooks, handbook)
already exists; lesson prose **references, uses, and interprets** those assets. This plan is the
last anti-drift safeguard: a lesson-to-asset map proving every lesson is asset-backed and **no
lesson creates a new asset**.

## Lesson-writing rules

**Lessons teach:** concepts · procedures · interpretation · engineering judgment.

**Lessons do not recreate:** figures · demos · notebooks · quizzes · handbook content.
Instead each lesson → *references the asset → uses it → interprets it*.

Numbers, symbols, and derivations are single-sourced. A lesson points to the handbook for the
procedure/acceptance test, to the demo to explore, to the notebook to verify, and to the quiz to
self-check — it does not duplicate them.

## Lesson → asset map

Numbering is the site's module-relative scheme (Module N · §x.y). The competency/quiz plan's flat
numbering is noted where it differs.

### Module 1 — Kinematic Twin · Handbook Ch 2 · Family 1 · N1
| Lesson | Figures | Demo view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 What Is a PKM | A1, C1 | Family 1 · Live | — | — |
| 1.2 2-RPR Geometry & Pose | A1 | Family 1 · Live | N1 | Q1 |
| 2.1 Inverse Kinematics | A1 | Family 1 · Live | N1 | Q1 |
| 2.2 Forward Kinematics | A1 | Family 1 · Live | N1 | Q1 |
| 2.3 Reachability & Workspace | B1 | Family 1 · Workspace | N1 | Q1 |
| 3.1 Jacobian & Manipulability | A6, B2 | Family 1 · Manipulability | N1 | Q4 |
| 3.2 Singularities | A6, B3 | Family 1 · Singularity | N1 | Q4 |

### Module 2 — Hydraulic Twin · Handbook Ch 3 · Family 2 · N2 · Q2
| Lesson | Figures | Demo view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 The Hydraulic Cylinder | A3 | Family 2 · Cylinder | N2 | Q2 |
| 1.2 Area Asymmetry φ | A3, B4 | Family 2 · Cylinder | N2 | Q2 |
| 1.3 Force and Speed | B4, B5 | Family 2 · Cylinder/Valve | N2 | Q2 |
| 2.1 The Valve Flow Law | A4, B5 | Family 2 · Valve | N2 | Q2 |
| 2.2 Load Pressure & the Jacobian | B4, A6 | Family 2 · Sensor | N2 | Q2 |
| 2.3 Pump & Relief Sizing | A5, B6 | Family 2 · Pump | N2 | Q2 |

### Module 3 — Control Twin · Handbook Ch 4 · Family 3 · N3 · Q3/Q5
| Lesson | Figures | Demo view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 Why Feedback | A8 | Family 3 · Position | N3 | Q3 |
| 1.2 PID Control *(+ PWM on/off — see flag)* | A7, A8, B8 | Family 3 · Position/Duty | N3 | Q3 |
| 1.3 The Tuning Trade-off | B7, B10 | Family 3 · Duty/Tuning | N3 | Q5 |
| 2.1 Joint-Space vs Task-Space | B9 | Family 3 · Coordinated | N3 | Q5 |
| 2.2 Feedforward & Trajectory Tracking | B9, B10 | Family 3 · Coordinated/Tuning | N3 | Q5 |

### Module 4 — Integration & Hardware · Handbook Ch 5 + Appendix A · Family 4 · N4/N5 · Q6
| Lesson | Figures | Demo view | Notebook | Quiz |
|---|---|---|---|---|
| 1.1 The Three Domains | C6, A9 | all families | — | — |
| 1.2 Sensors & Valve Drivers | Appendix A tables | Family 2/3 | — | — |
| 1.3 Wiring & Safety Chain | Appendix A signal map | — | — | — |
| 2.1 Logging & the Canonical Schema | A9 | Family 4 · Sync | N4 | Q6 |
| 2.2 Grading Sim & Hardware Identically | A10, B11–B14 | Family 4 · Accuracy/Diagnose | N4, N5 | Q6 |

**23 lessons + 4 module overviews. Every lesson maps to existing assets; none requires a new one.**

## Verification

- **Asset-backed:** every lesson above resolves to committed figures, a demo family/view, and
  (where applicable) a notebook and quiz. ✓
- **No new assets:** no lesson in this plan introduces a figure, demo, notebook, quiz, or
  handbook page that does not already exist. ✓
- **Single source:** equations/numbers come from the engine and the committed figures; procedures
  and acceptance tests come from the handbook. ✓

## Flags (decide before writing)

1. **Control-module emphasis (Path A).** The control **assets** (Family 3, A7 PWM waveform, A8
   on/off control, B7 duty, B8 on/off-vs-PWM-vs-proportional, N3, Q3) are all built on the Path A
   signature — *position control with on/off valves via PWM*. The current Module 3 lesson titles
   foreground PID/proportional, and PWM/on/off presently surfaces in the Module 4 hardware
   lessons. **Recommendation:** when writing Module 3 prose, foreground the Path A signature using
   the existing Family 3 assets (no new assets) — e.g., §1.2 bridges PID → PWM on/off, §1.3 uses
   the duty/tuned figures. This aligns the lessons to the assets already built.
2. **Numbering reconciliation.** The quiz/competency plan's flat numbering (1.1–1.4, 2.1–2.6,
   3.1–3.6, 4.1–4.4) maps onto the site's module-relative numbering above; lesson prose will cite
   the module-relative scheme the site already uses.

## Per-lesson prose shape (consistent)

1. **Concept** — the idea, briefly (theory lives here; not in handbook).
2. **Read the asset** — point to the figure/demo and interpret it.
3. **Procedure in practice** — link the handbook procedure; apply it to an example.
4. **Verify** — link the notebook; state the acceptance threshold.
5. **Judgment** — what to watch for (ties to the handbook's failure modes).
6. **Check yourself** — link the quiz.

## Decision requested

Approve the **Lesson Prose Plan** (lesson-to-asset map, asset-backed verification, the two flags,
and the per-lesson shape), or mark adjustments — especially the Path A emphasis decision for
Module 3. On approval I'll write the lesson prose to this map, module by module, referencing
assets rather than recreating them.
