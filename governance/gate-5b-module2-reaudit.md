# Gate 5B — Module 2 Re-Audit (post-REVISE)

Hydraulic Twin lessons re-audited after the ALIGN pass. Criteria = compliant template **plus** the
two Module-2 checks (standards-first and Path A). Prose preserved; structure integrated in place.

## Result: 6 / 6 PASS

| Lesson | Status |
|---|---|
| 1.1 The Hydraulic Cylinder | **PASS** |
| 1.2 Area Asymmetry φ | **PASS** |
| 1.3 Force and Speed | **PASS** |
| 2.1 The Valve Flow Law | **PASS** |
| 2.2 Load Pressure & the Jacobian | **PASS** |
| 2.3 Pump & Relief Sizing | **PASS** |

## Per-check verification (all lessons)

| Check | Status |
|---|---|
| Header: `Hydraulic Twin · Competency · Artifact contribution · Milestone` | OK ×6 |
| Project relevance before theory | OK ×6 |
| Figures: canonical ISO/B-series at point of use (A3,A4,A5,B4,B5,B6) | OK ×6 |
| Equation provenance (`Source:`) | OK ×6 |
| Demo as instructional object (Observe → Interpret → Apply) | OK ×6 |
| Verification: N2, referencing (not duplicating) the artifact acceptance test | OK ×6 |
| Assessment: Gate 5B Quiz 2 | OK ×6 |
| No old `m2-l*` quiz / removed-demo / `assets/` references | OK ×6 |
| Appended block removed; no Unit framing | OK ×6 |
| **H1 — Standards:** ISO 1219 / ANSI Y32.10 stated; approved standards assets used | **PASS ×6** |
| **H2 — Path A:** PWM on/off presented as primary; proportional only as labelled benchmark | **PASS ×6** |

## H1 Standards Check — detail

Every lesson carries an explicit *"Symbols follow ISO 1219 / ANSI Y32.10"* note and uses the
approved standards figures: A3 (cylinder), A4 (4/3 DCV), A5 (HPU) for schematics; B4/B5/B6 for the
exported curves. The ISO DCV symbol (A4) is now in the **body** of the valve lesson, not an
appendix — students read real documentation, not course-specific graphics.

## H2 Path-A Check — detail

- **2.1 Valve Flow Law** carries an explicit **Path A** note: the command `u` is a **PWM duty** on a
  **solenoid on/off DCV**; a proportional valve is a **benchmark** only. The phrase
  "proportional-valve flow law" was removed (now "valve flow law / orifice characteristic"),
  including in the challenge problem.
- **2.3 Pump & Relief**: the HPU circuit prose/alt-text now reads **solenoid directional valve**,
  not "proportional valve."
- The remaining "proportional" occurrences are either the explicit benchmark framing or the math
  caution ("flow is **not** proportional to ΔP — it scales with √ΔP"). No lesson implies students
  command a proportional valve.

## Notes

- Prose preserved (intuition, worked examples, common mistakes intact).
- Old per-lesson quizzes (`m2-l*.html`) remain on disk until all modules are de-referenced, then
  archived with redirects (per the agreed archive rule).

## Gate

Module 2 is at a clean **6/6 PASS** including H1 and H2 — clear to proceed to Module 3 REVISE.
