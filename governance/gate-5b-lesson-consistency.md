# Lesson Consistency Gate — Retroactive + Forward (audit + remediation)

Applied to **all 23 active lessons** (no grandfathering). Each lesson checked against the 13 required
fields and the 10 rules; failures fixed before commit.

## Result: 23 / 23 PASS

| Module | Lessons | Status |
|---|---|---|
| M1 Kinematic Twin | 7 | **PASS** |
| M2 Hydraulic Twin | 6 | **PASS** |
| M3 Control Twin | 5 | **PASS** |
| M4 Validation Twin | 3 | **PASS** |
| Hardware Integration | 2 | **PASS** |

## Per-field audit (all lessons)

Module · Twin stage · Competency · Artifact contribution · Milestone · Figure · Demo · Notebook ·
Quiz · Handbook link · Equation provenance · Current terminology · No legacy references — **all OK ×23**.

## Drift found and fixed (this gate)

The gate caught reference drift the earlier passes missed — **iframe `src` had been repointed to
canonical demos, but the `title` attributes were stale**:

| Lesson(s) | Was (stale title) | Now (canonical, derived from demo) |
|---|---|---|
| M2 1.1/1.2/1.3 | "Cylinder Asymmetry" | "Hydraulic Explorer" |
| M2 2.1/2.3 | "Valve Flow Law" | "Hydraulic Explorer" |
| M3 1.1/1.2/1.3/2.2 | "PID Tuning" | "PWM / Control Lab" |
| M3 2.1 | "Kinematics Explorer" | "PWM / Control Lab" |
| M4 2.2 (grading) | "PID Tuning" | "Digital Twin Validation Lab" |
| HW sensors | "Cylinder Asymmetry" | "Hydraulic Explorer" |
| HW wiring | "Kinematics Explorer" | "Digital Twin Validation Lab" |

Titles are now **derived from the embedded demo file**, so the lesson title, iframe title, and the
demo's own `<title>` can never drift apart again.

Two further fixes:
- **M2 2.2 (Load Pressure):** demo repointed from the Family 1 kinematics demo to **Family 2
  (hydraulic-explorer)** so a Hydraulic Twin lesson uses its own family; the Jacobian tie is carried
  by the A6 figure already in the body.
- **M4 2.2 (Grading):** course-completion footer repointed from the legacy `handbook.md` stub to the
  current **`handbook/index.md`**.

## Module re-audit gate (after revision)

Across all active lessons: **old quiz HTML = 0 · `handbook.md` = 0 · obsolete demo names = 0 · stale
breadcrumbs / Unit framing = 0**. Final link+asset audit: **129 references checked, 0 broken**.

## Check 10 — Validation lessons

All three validation lessons carry **Measure → Compare → Diagnose → Correct**; the **Twin
Discrepancy Analysis** is visible in the body of the grading lesson (B14 embedded before the
Knowledge Check), where diagnosis is taught.

## Conclusion

Every lesson is correct **and** current **and** canonically named **and** fits the approved
curriculum architecture. The gate holds retroactively and forward.
