# Gate 5B — Quiz Plan

Quizzes **verify the conceptual understanding behind the artifacts** — they do not drive the
curriculum. The architecture (competencies → lessons → artifacts → demos → simulator →
assessments → thresholds) is already the backbone; quizzes only check that students understand
why their artifacts are correct.

## Governing rules

1. **No untethered facts.** Every question ties to a competency **and** an artifact. A pure
   definition recall is not allowed.
   - ✗ "What is the definition of manipulability?"
   - ✓ "Given this manipulability map, identify the unsafe region and explain why a path
     through it risks losing a degree of freedom."
2. **≥ 50% asset-grounded.** At least half of every quiz's questions are built on a curriculum
   asset — a figure, exported plot, ISO schematic, demo view, or rig/twin log — not pure text.
3. **Standards items are mandatory** wherever fluid-power graphics exist (Q2, Q3): ISO 1219 /
   ANSI Y32.10 symbol interpretation and schematic reading.
4. **Answer keys cite the competency and artifact** each question verifies (so the quiz itself
   stays inside the traceability graph).

---

## Quiz-to-competency map

| Quiz | Lessons | Competencies | Artifact(s) supported | Questions |
|---|---|---|---|---|
| Q1 | 1.1–1.4 | C2–C4 | Geometry config, IK/FK impl., Workspace map | 8 |
| Q2 | 2.1–2.4 | C5 | Hydraulic Sizing Report | 8 |
| Q3 | 2.5–2.6 | C6–C7 | Duty-cycle characterization, Position-control demo | 8 |
| Q4 | 3.1–3.4 | C10–C12 | 3-DOF IK/FK, Manipulability map, Safe-region map | 8 |
| Q5 | 3.5–3.6 | C13–C14 | Coordinated runs, Tuned Control Report | 8 |
| Q6 | 4.1–4.4 | C15–C16 | Twin Accuracy Report, Twin Discrepancy Analysis, Integrated system | 8 |

**48 questions total**, ≥ 24 asset-grounded.

---

## Mandatory question-type matrix

The five required types appear in the quizzes where the relevant assets exist. ✓ = required;
the cell names the asset the item is built on.

| Type | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---|---|---|---|---|---|
| 1. ISO 1219 / ANSI symbol interpretation | — | ✓ A3,A4,A5 | ✓ A4 | — | — | — |
| 2. Reading hydraulic schematics | — | ✓ A5 HPU | ✓ A4 DCV | — | — | — |
| 3. Reading plots from the demos | ✓ B1 | ✓ B4,B5,B6 | ✓ B7,B8 | ✓ B2,B3 | ✓ B9,B10 | ✓ B11,B12,B13 |
| 4. Interpreting validation results | — | — | — | — | — | ✓ B13 |
| 5. Diagnosing faults from evidence | ✓ unreachable/singular | ✓ over-pressure/undersize | ✓ deadband/limit cycle | ✓ singularity | ✓ tracking failure | ✓ B14 signatures |

Symbol/schematic items concentrate in Q2–Q3 (the only fluid-power content); plot-reading and
fault-diagnosis run throughout; validation interpretation anchors Q6.

---

## Per-quiz asset list (what each quiz draws on)

- **Q1** — B1 workspace map; A1 2-RPR geometry; IK/FK round-trip values; an unreachable/near-singular pose to diagnose.
- **Q2** — A3 cylinder, A4 DCV, A5 HPU schematics; B4 force/area, B5 flow curve, B6 pump/power; a sizing scenario (undersize / over-pressure) to diagnose.
- **Q3** — A4 DCV states; A7 PWM waveform; B7 duty curve, B8 step response (on/off vs PWM vs proportional); a deadband / limit-cycle case to read.
- **Q4** — A2 3-RPR geometry, A6 Jacobian concept; B2 manipulability map, B3 safe-region map; the symmetric-pose singularity to identify.
- **Q5** — B9 coordinated tracking, B10 tuned response; a low-gain tracking failure vs tuned success to compare.
- **Q6** — A9 sync, A10 validation workflow; B11 overlay, B12 sync, B13 accuracy report, B14 discrepancy signatures; a rig/twin log to diagnose (the Twin Discrepancy Analysis).

---

## Authoring constraints (applied when questions are written)

- Each item: stem grounded in an asset where possible, one competency, one artifact, a worked
  answer, and an answer-key line `verifies: C# · <artifact> · <asset>`.
- Asset-grounded share tracked per quiz (must reach ≥ 50%); reported in the quiz header.
- Standards items in Q2/Q3 use the committed ISO 1219 figures verbatim (single-source rule) —
  no redrawn symbols.
- Plot-reading items reference the exact frozen-parameter figures (B-series), so the quiz and
  the lesson show the same picture.
- Difficulty calibrated to senior undergraduate; fault-diagnosis items give evidence and ask
  for the cause, not recall.

---

## Decision requested

Approve the **Quiz Plan** (mapping, type matrix, standards + asset requirements, artifact
linkage), or mark adjustments. On approval I'll write the six quizzes to this plan, reporting
the asset-grounded share per quiz. Then the sequence continues: **notebooks → handbook →
lesson prose** — with extra care at the handbook stage to keep it project-centered, not a
topic-centered reference.
