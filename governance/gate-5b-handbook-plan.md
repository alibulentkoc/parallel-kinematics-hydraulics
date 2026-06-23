# Gate 5B — Handbook Plan

The handbook is the **project guide**: how to build and validate the PKM digital twin, stage by
stage. It is organized around the **twin maturity map** and the **artifact chain** — *not* as a
topic reference. It threads the demos, figures, notebooks, and quizzes already built; it does
**not** restate theory (derivations stay in the lessons) and introduces nothing new.

## Organizing principle

> Each chapter = one twin-maturity stage = one segment of the artifact chain. A chapter's job is
> to get the student to **produce and verify that stage's artifact**, using the demo to explore,
> the figures to read, the notebook to check, and the gate to pass.

What the handbook is **not**: a chapter-per-topic reference (no "Chapter: Hydraulics" survey), a
re-derivation of lesson theory, or a place for new equations. Numbers and symbols are
single-sourced from the committed figures and the engine.

## Chapter map (artifact-chain spine)

| Ch | Twin stage | Artifact(s) produced | Demo family | Figures | Notebook | Quiz | Acceptance gate |
|---|---|---|---|---|---|---|---|
| **1** | M0 Observe → orientation | (project plan / how to use the kit) | all | C1 maturity, C2 roadmap, C4 chain | — | — | — |
| **2** | M1 Kinematic | Geometry config, IK/FK, Workspace map | Family 1 | A1, A2, B1, B2, B3, C6 | N1 | Q1, Q4 | round-trip < 1e-6 m (2-DOF) / < 1e-4 m (3-DOF); \|det J\| ≥ 0.02 |
| **3** | M2 Hydraulic | Hydraulic Sizing Report, Design Review (midterm build) | Family 2 | A3, A4, A5, B4, B5, B6, C3 | N2 | Q2 | φ ≤ 1.6; F_ext ≥ load; flow ≤ pump max; hold ≤ relief |
| **4** | M3 Control | Duty-cycle characterization, Tuned Control Report | Family 3 | A7, A8, B7, B8, B9, B10 | N3 | Q3, Q5 | monotonic duty; tracking ≤ 10 mm; settling ≤ 2.5 s |
| **5** | M4 Validation | Twin Accuracy Report, Twin Discrepancy Analysis, Final Integration | Family 4 | A9, A10, B11, B12, B13, B14, C5, C7 | N4, N5 | Q6 | RMSE ≤ 10 mm; pressure ≤ 15%; discrepancy explained |

Five chapters, one per maturity stage, walking the artifact chain from project plan to validated
3-DOF system. The midterm (2-DOF build) sits at the end of Ch 3; the final (3-DOF validated)
closes Ch 5.

## Per-chapter structure (same shape every chapter)

Each chapter mirrors the project loop, not a lecture:

1. **Stage goal** — what this twin stage adds (one paragraph; links to the maturity map).
2. **The artifact you produce** — the deliverable and where it sits in the chain.
3. **Explore (demo)** — which demo family/view to drive, what to look for.
4. **Read (figures)** — the canonical + exported figures for this stage, and how to read them.
5. **Verify (notebook)** — run the stage's notebook to reproduce and assert the thresholds.
6. **Pass the gate** — the acceptance criteria (single-sourced) and what a passing artifact looks like.
7. **Where this connects** — the prior artifact it builds on and the next stage it feeds.

This keeps every chapter anchored to a concrete artifact and a passing gate, reinforcing the
project spine rather than surveying a topic.

## Threading rule

- Theory/derivations → **link to the lesson**, never re-derived.
- Symbols/numbers → **the committed figure or engine value**, never redrawn or restated.
- Procedures → **the demo + notebook**, never a parallel description that could drift.
- Each chapter ends inside the traceability graph (artifact → gate), not as standalone reading.

## Delivery

Replaces the current single `docs/handbook.md` with a chapter-structured handbook (one page per
chapter under `docs/handbook/`, plus an index), in the same dark instrument visual identity.
Each chapter embeds its figures and links its demo, notebook, and quiz.

## Decision requested

Approve the **Handbook Plan** (project-centered, artifact-chain/maturity structure; chapter
mapping; per-chapter produce-and-verify shape; threading and single-source rules), or mark
adjustments. On approval I'll write the handbook chapter by chapter to this structure, then move
to the final stage — **lesson prose**.
