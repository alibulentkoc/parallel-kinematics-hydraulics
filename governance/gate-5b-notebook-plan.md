# Gate 5B — Notebook Plan

Notebooks are the bridge **simulator ↔ engineering analysis ↔ artifact**. They **reproduce,
verify, analyze, and export** — they do **not** teach new theory.

## Governing rule

> No notebook may introduce an equation, model, or workflow not already present in the
> simulator, the approved artifacts, or the approved figures.

Every computation a notebook performs already exists in `src/` (kinematics, hydraulics,
control, `student/metrics.js`, `grading`) or in a frozen-parameter figure's CSV. The notebook
recomputes from the exported CSV/log in Python and checks it against the engine value.

## Delivery

Per the established pattern, notebooks are **not** served by the built site (raw `.ipynb`
renders as JSON); each links to the GitHub blob renderer and Google Colab. Inputs are the
demo's exported CSVs (B-series) and the saved artifact JSON / rig-twin logs.

---

## Notebook map

| NB | Competencies | Artifact produced | Demo export / input | Output | Acceptance threshold |
|---|---|---|---|---|---|
| **N0** | all (C1–C16) | — (grading) | student artifacts, CSVs, logs | pass/fail + rubric + anomaly report | every rubric threshold below |
| **N1** | C2–C4 | Geometry, IK/FK, Workspace map | Family 1 CSV (B1/B2/B3 grids) | Workspace map + reach stats | IK/FK round-trip < 1e-6 m (2-DOF) / < 1e-4 m (3-DOF) |
| **N2** | C5 | Hydraulic Sizing Report | Family 2 CSV (B4/B5/B6) | Sizing report | φ ≤ 1.6; F_ext ≥ load; no pump saturation; P_hold ≤ relief; within ±15% |
| **N3** | C6–C7, C13–C14 | Duty-cycle characterization, Tuned Control Report | Family 3 CSV (B7/B8/B9/B10) | Duty curve, tuned response | monotonic duty; settling ≤ 2.5 s; tracking RMSE ≤ 10 mm; limit cycle ≤ bound |
| **N4** | C15 | Twin Accuracy Report | Family 4 CSV (twin log + rig log) | Validation metrics | pos RMSE ≤ 10 mm; pressure error ≤ 15% |
| **N5** | C16 | Final Integration Report | all exports | Final report package | all of the above + diagnosed discrepancy |

---

## Per-notebook outline (7-section structure)

### N0 — Instructor Audit
1. **Purpose** — auto-verify student submissions for consistent grading (midterm/final, TA parity).
2. **Inputs** — uploaded artifact JSONs (demo "Save"), exported CSVs, rig/twin logs.
3. **Reproduce** — recompute each artifact's headline numbers from its CSV/log using the engine formulas.
4. **Analyze** — compare submitted vs recomputed; flag mismatches, out-of-range values, missing fields.
5. **Generate** — rubric summary table (per competency) + anomaly report.
6. **Verify** — apply every threshold in the map above; mark PASS/FAIL per criterion.
7. **Export** — `audit-report.csv` + a per-student pass/fail sheet. (Leverages `src/student/grading`.)

### N1 — Kinematics
1. **Purpose** — reproduce and analyze the reachable workspace and Jacobian field.
2. **Inputs** — B1 workspace CSV (2-DOF), B2 manipulability / B3 safe-region CSV (3-DOF).
3. **Reproduce** — recompute IK, FK, det J per grid cell; confirm they match the CSV `detJ` column.
4. **Analyze** — reachable area, manipulability distribution, fraction below the |det J| floor.
5. **Generate** — the Workspace map artifact + reach/dexterity statistics.
6. **Verify** — IK→FK round-trip < 1e-6 m (2-DOF) / < 1e-4 m (3-DOF).
7. **Export** — `workspace-stats.csv` and the map image.

### N2 — Hydraulics
1. **Purpose** — reproduce sizing and check the design margins.
2. **Inputs** — B4 force/area sweep, B5 flow curve, B6 pump/power sweep CSV.
3. **Reproduce** — areas, φ, F_ext/F_ret, orifice Q, required flow, power, hold pressure.
4. **Analyze** — force/speed asymmetry, flow vs ΔP, pump headroom, pressure vs relief.
5. **Generate** — the Hydraulic Sizing Report.
6. **Verify** — φ ≤ 1.6; F_ext ≥ load; required flow ≤ pump max; P_hold ≤ relief; values within ±15% of engine.
7. **Export** — `sizing-report.csv`.

### N3 — PWM / Control
1. **Purpose** — reproduce duty characterization and the tuned/coordinated responses.
2. **Inputs** — B7 duty CSV, B8 step (3-model) CSV, B9 tracking CSV, B10 tuned CSV.
3. **Reproduce** — duty→speed curve, step responses per valve model, tracking RMSE, settling/ripple.
4. **Analyze** — deadband, on/off-vs-proportional residual ratio (~16×), gain effect on tracking, settling.
5. **Generate** — Duty-cycle characterization + Tuned Control Report.
6. **Verify** — duty monotonic above deadband; settling ≤ 2.5 s; tracking RMSE ≤ 10 mm; limit cycle ≤ 2·db + 0.004.
7. **Export** — `duty-characterization.csv`, `tuned-report.csv`.

### N4 — Validation
1. **Purpose** — compute twin accuracy from synchronized logs.
2. **Inputs** — twin log CSV + rig log CSV (Family 4 overlay/sync exports).
3. **Reproduce** — pos RMSE, settling-time difference, pressure error (mirrors `student/metrics.js twinAccuracy`).
4. **Analyze** — pass/fail against thresholds; if fail, identify the discrepancy signature.
5. **Generate** — Twin Accuracy Report (+ Twin Discrepancy Analysis when failing).
6. **Verify** — pos RMSE ≤ 10 mm; pressure error ≤ 15%.
7. **Export** — `twin-accuracy.csv`.

### N5 — Integration
1. **Purpose** — assemble the validated 3-DOF system report from all prior outputs.
2. **Inputs** — all exports (N1–N4 outputs + their CSVs).
3. **Reproduce** — the full pipeline's headline metrics end to end.
4. **Analyze** — cross-check kinematics + hydraulics + control + validation; diagnose any residual discrepancy.
5. **Generate** — Final Integration Report package.
6. **Verify** — every threshold above passes; any residual discrepancy is explained (not just measured).
7. **Export** — `final-report-package.zip` (CSVs + figures + summary).

---

## Decision requested

Approve the **Notebook Plan** (N0–N5 mapped to competencies, artifacts, demo exports, outputs,
and thresholds), or mark adjustments. On approval I'll write the notebooks to this plan —
reproducing engine values from the exported CSVs and asserting each threshold — then continue
to **handbook → lesson prose** (handbook kept project-centered, organized around the artifact
chain and twin maturity).
