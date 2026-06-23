# Gate 5A — Final Thresholds (cohort: senior undergraduate)

Cohort confirmed: **senior undergraduate.** The "tunable" rubric thresholds are now set at
that level. **Gate 5A is complete** — both freeze items (Twin Accuracy metrics ✓, cohort ✓)
are done and the architecture is locked.

Honesty note: thresholds split into two kinds. **[engine-grounded]** values come from the
verified simulator and are firm. **[calibrate]** values are reasonable senior-undergraduate
starting points for hardware-dependent quantities; they should be re-checked against the
**first cohort's** real rig data and adjusted — the *criterion* is fixed, the *number* is a
v1 default.

| # | Competency | Senior-undergrad threshold | Basis |
|---|---|---|---|
| C2 | Geometry | exact match to reference config | [engine-grounded] |
| C3 | IK/FK (2-DOF) | round-trip < **1e-6 m** | [engine-grounded] (engine ≪ this) |
| C4 | Workspace | ≥ **90 %** pose classification vs engine; dead zone + stroke limits flagged | [calibrate] |
| C5 | Hydraulic sizing | force/flow/power within **±15 %** of a correct design | [calibrate] (grad-level would be ±10 %) |
| C6 | PWM characterization | monotonic duty→speed curve; deadband quantified within **±20 %**; limit-cycle amplitude reported | [calibrate] |
| C7 | On/off position control | steady-state error ≤ **1.5× deadband floor**; written comparison to proportional correct | [engine-informed] |
| C8 | Design review | all 5 items + complete safety checklist (**pass/fail gate**) | [binary] |
| C9 | Commission 2-DOF | reaches commanded poses within **1.5× deadband (≈ few mm)**; safety chain verified (**mandatory pass**) | [calibrate] |
| C10 | 3-DOF kinematics | round-trip < **1e-4 m**; converges from warm start | [engine-grounded] |
| C11 | Manipulability | map within **±10 %** of engine; regions labelled | [calibrate] |
| C12 | Singularities | flags det J → 0 (incl. symmetric pose); safe region keeps **|det J| ≥ 0.02** | [engine-informed] |
| C13 | Coordinated/task control | path-tracking RMSE ≤ **10 mm** | [calibrate] |
| C14 | Tuned control | settling ≤ **2.5 s**; limit-cycle amplitude ≤ deadband-driven bound | [calibrate] |
| C15 | Twin Accuracy | position RMSE ≤ **10 mm**; settling within **±20 %** of rig; pressure-prediction error ≤ **15 %** | [calibrate] |
| C16 | Integration | final composite spec met | [rubric] |

These feed directly into the midterm and final rubric weights already approved at Gate 4.

**Gate 5A status: ✅ complete.** Architecture, artifact chain, competency map, rubric +
thresholds all frozen. Gate 5B (content production) is unlocked.
