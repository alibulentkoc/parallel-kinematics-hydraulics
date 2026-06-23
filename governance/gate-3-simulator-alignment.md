# Gate 3 — Simulator Alignment Review

**Status:** Gate 2 (Rev B) approved. Gate 3 maps every curriculum activity to a simulator
capability and flags gaps, unused features, and redundancy. **No content generated here.**

---

## Headline finding — and a correction I owe you

In Gate 1/Gate 2 I stated the simulator was "proportional-only" and that Path A would need a
**new** DCV+PWM mode. **That was wrong — I had not inspected the valve code.** The engine
already ships a valve **model selector**, implemented *and* tested:

| Valve model | What it does | In code | Tested |
|---|---|---|---|
| `proportional` | smooth spool, continuous deadband (the idealized command) | ✅ | ✅ |
| `pwm` | solenoid PWM-modulated toward a proportional-like average, with switching ripple at `pwmFreq` | ✅ | ✅ (via controller) |
| `bangbang` | raw solenoid DCV: three-state, overlap (`deadband`) + `hysteresis`, latched | ✅ | ✅ — a test confirms an on/off valve leaves a **deadband-sized residual ~20× the proportional case** |

`meter(u, dt)` maps a controller command `u ∈ [-1,1]` to an effective spool position through
the selected model. **So PWM control of on/off DCVs is already supported:** the existing PID
emits `u`; the `pwm`/`bangbang` model turns it into pulsed flow with real deadband and
limit-cycle behavior. **The biggest feared mismatch in the program is largely a non-issue.**

---

## Activity ↔ capability matrix

| Curriculum activity (lesson) | Simulator capability | Status |
|---|---|---|
| 2-RPR / 3-RPR geometry, IK, FK (M1, M3.1–3.2) | `kinematics2dof` (closed form), `kinematics3dof` (Newton) | ✅ supported |
| Workspace / reachability map (M1.4) | reachability + heatmap viz | ✅ supported |
| Cylinder & area asymmetry, sizing (M2.1, M2.3) | `hydraulics` cylinder/pump/power models | ✅ supported |
| **PWM actuation, on/off positioning, deadband, limit cycles (M2.5–2.6, M3.6)** | **`valve` model: `pwm` / `bangbang` + `deadband` + `hysteresis` + `pwmFreq`** | ✅ **supported (already implemented + tested)** |
| Proportional valve as *advanced comparison* | `valve` model: `proportional` | ✅ supported (now framed as the idealized contrast, not the default) |
| Jacobian, manipulability map (M3.3) | Jacobian + manipulability + heatmap | ✅ supported |
| Singularities & safe region (M3.4) | singularity fault detector | ✅ supported |
| Coordinated / task-space control (M3.5) | `controller` joint-space (default) + task-space modes, trajectory | ✅ supported |
| Closed-loop tuning (M3.6) | controller + grading metrics | ✅ supported |
| Log schema & synchronization (M4.1) | `logger` + `schema` (logs length, **pressure**, flow, angle, time, err, force) | ✅ supported |
| V&V by replay (M4.2) | `trace` replay | ✅ supported |
| **Twin Accuracy Report — RMSE, settling, duty cycle, pressure-prediction error (M4.3)** | settling ✅; pressure **is logged** ✅; **RMSE, duty-cycle, pressure-error metrics not yet computed** | ⚠️ **minor metrics extension required** |
| Final integration & grading (M2.8, M4.4) | `grading` rubric, `student` assignments (M1–M3, F1–F4) | ✅ supported |
| Physical AI extension (M4.5, optional) | not modeled | ➖ out of core scope (by design) |

---

## Required reviews

**Unused / under-leveraged simulator features** (features that exist but the curriculum
does not yet fully exploit — opportunities, not defects):

- **Fault library:** 11 detectors exist (`faults`), but the curriculum currently ties in
  only singularity + over-pressure/over-travel (the M2.7 safety checklist). The remaining
  detectors are available to enrich the safety checklist and M4 validation.
- **`injection` (fault injection):** present; not yet used by a lesson. Natural fit for an
  M4 validation/robustness exercise.

**Missing simulator support** (must be built before Gate 5 content for the affected lessons):

1. **Twin Accuracy metrics (M4.3):** add `RMSE`, `duty-cycle`, and `pressure-prediction
   error` to `metrics`. The raw data (pose error, pressure per leg, valve state) is already
   logged — this is a metrics-layer addition, not new physics. **Small.**
2. **Live twin↔hardware HIL:** intentionally **out of scope** (M4 uses log-sync + replay,
   per your directive). Reserved for the 4.5 extension. **No action.**

**Redundant features:** none. The `proportional` model is **not** redundant — it is the
"advanced comparison" reference the curriculum explicitly uses against `pwm`/`bangbang`.

---

## Approval criteria check

- *No simulator feature without a curriculum purpose:* ✅ — every engine module maps to a
  lesson; the only under-used items (extra fault detectors, injection) are flagged as
  enrichment opportunities, not orphans.
- *No curriculum activity without simulator support:* ✅ — one item is **partial** (Twin
  Accuracy metrics) and scoped as a small, well-defined addition; one is **deliberately
  out of scope** (live HIL).

---

## Dashboard

**Green:** kinematics · hydraulics · **PWM/DCV valve models (the headline risk, now retired)**
· control (joint + task) · logging/replay · grading. **Simulator alignment is far stronger
than previously reported.**

**Yellow:** Twin Accuracy metrics (small `metrics` extension) · fault library under-leveraged
(enrichment).

**Red:** none.

**Risk register update:**

| Risk | Prior | Now |
|---|---|---|
| PWM/DCV vs proportional mismatch | HIGH | **CLOSED — already implemented & tested** |
| Twin Accuracy metrics missing | — | **LOW** (small metrics add) |
| Live HIL | MEDIUM | **N/A** (out of scope by decision) |
| Student cohort level | YELLOW | unchanged (set at Gate 5) |

---

## Decision requested

Approve **Gate 3**. On approval → **Gate 4 — Assessment Alignment** (quiz/lab mapping,
midterm & final rubrics, competency matrix), then **Gate 5 — Content Authorization**, which
is the first point any lesson/notebook/quiz/figure/demo/handbook is generated.

I recommend authorizing the one **small simulator task** (add RMSE / duty-cycle /
pressure-error to `metrics` for the Twin Accuracy Report) to be scheduled into the Gate 5
build, since M4.3 depends on it.
