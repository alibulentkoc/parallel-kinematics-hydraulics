# Gate 5B — Demo Specs Addendum: Failure Modes & Common Structure

Two approved additions to the demo family specs, applied before implementation.

---

## Addition 1 — Failure Modes Supported (per family)

Diagnosing faults is where much of the engineering learning happens, and the **fault engine
already exists** (detectors: `UNREACHABLE`, `STROKE_END`, `NEAR_SINGULAR`, `SINGULAR`,
`SINGULAR_LOAD`, `FK_INVALID`, `PUMP_SATURATED`, `VALVE_SATURATED`, `OVER_PRESSURE`, …).
Each failure mode below is tagged **[detector]** (a real fault the engine raises) or
**[parameter]** / **[log]** (a condition produced by a setting or a log mismatch and surfaced
by metrics).

### Family 1 — Kinematics Explorer
- Unreachable target — **[detector UNREACHABLE]**
- Stroke limit reached — **[detector STROKE_END]**
- Near / at singularity — **[detector NEAR_SINGULAR / SINGULAR]**
- Wrong geometry (bad anchors) → invalid FK — **[detector FK_INVALID]**

### Family 2 — Hydraulic Explorer
- Undersized cylinder (force shortfall) — **[detector VALVE_SATURATED / SINGULAR_LOAD]**
- Insufficient pump flow — **[detector PUMP_SATURATED]**
- Relief pressure too low / load too high — **[detector OVER_PRESSURE]**
- Sensor scaling error — **[parameter]** (config fault, no detector)

### Family 3 — PWM / Control Lab
- Deadband too large (coarse positioning) — **[parameter]**, surfaced by residual metric
- Excessive hysteresis (sluggish / limit cycle) — **[parameter]**
- PWM frequency too low (ripple) — **[parameter]**
- Poor tuning (overshoot / fails to settle) — **[parameter]**, surfaced by settling metric; valve maxing → **[detector VALVE_SATURATED]**

### Family 4 — Digital Twin Validation Lab
- Time misalignment (twin vs rig) — **[log]**, surfaced by elevated posRMSE
- Schema mismatch — **[log]** (alignment check fails)
- Pressure-model mismatch — **[log]**, surfaced by high pressureRMSE / pctErr
- Sensor noise — **[log]**, surfaced by accuracy spread

Student Mode reveals failure modes through guided "break it, then explain it" tasks;
Instructor Mode can inject any of them on demand.

---

## Addition 2 — Common demo structure: Explore → Challenge → Artifact → Check

Every family demo follows the same four-beat loop, so demos drive **artifact production**
rather than becoming open-ended sandboxes:

1. **Explore** — free interaction (move the target, sweep duty, drag geometry) to build intuition.
2. **Challenge** — a posed task ("find a pose near a singularity", "size the pump for this load").
3. **Artifact** — produce and **save/export** the deliverable (map, worksheet, report).
4. **Check** — the demo verifies the result against the lesson's **Acceptance Test** and reports pass/needs-work.

This makes the demo's job identical to the lesson's job: produce a checkable artifact.

---

## Status

Both additions are now part of the four family specs. Building begins in the approved order:
**1. Kinematics Explorer → 2. Hydraulic Explorer → 3. PWM/Control Lab → 4. Twin Validation
Lab**, each to its spec, each presented for approval before the next.
