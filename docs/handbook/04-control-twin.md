# Chapter 4 — Control Twin (M3)

*Operational reference. Produces the duty characterization and the tuned control report.*

## 1. Stage Goal
Achieve position control with on/off valves via PWM, then coordinate and tune the response.

## 2. Artifact Produced
**Duty-cycle characterization** · **Tuned Control Report** (coordinated tracking + tuned response).

## 3. Required Inputs
The sized hydraulic twin (Chapter 3), a target position/path, and the control parameters.

| Parameter | Value |
|---|---|
| DT / N | 0.001 s / 3000 |
| V_max / drift / τ | 0.3 m/s / 0.004 / 0.02 s |
| Baseline Kp / deadband / hysteresis | 30 / 0.010 / 0.004 |
| PWM frequency / target | 40 Hz / 0.10 m |
| Tracking gain | Kp = 40 (pass) vs Kp = 20 (fail) |

## 4. Key Figures
![PWM waveform](../figures/A7-pwm-waveform.svg)
![Step response: on/off vs PWM vs proportional](../figures/B8-step-response.svg)
Also: `B7-duty-curve`, `B9-coordinated-tracking`, `B10-tuned-response`, `A8-onoff-control`.

## 5. Key Equations (reference)
- Average speed vs duty: `v_avg = max(0, (d − d_db)/(1 − d_db)) · V_max`
- PWM average flow ∝ duty (time-in-state of the on/off valve)
- On/off residual ≈ deadband; Settling time = time to within ±2% of target
- Tracking error = ‖target − actual‖; RMSE over the path

## 6. Procedure
1. Sweep duty 0→1; record average speed → the duty curve (identify the deadband).
2. Run a step with on/off, PWM, and proportional models; compare residuals.
3. Run the coordinated (task-space) path; compute tracking RMSE; raise Kp until it passes.
4. Tune the PWM loop (gain, frequency) until it settles within the band; record settling/ripple.

## 7. Acceptance Test
- Duty curve **monotonic above the deadband**.
- Coordinated tracking **RMSE ≤ 10 mm**.
- Tuned response **settling ≤ 2.5 s**; limit cycle ≤ 2·deadband + hysteresis.
- Run **N3**; all asserts pass.

## 8. Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| Parks short of target / limit cycle | excessive deadband (on/off residual) | apply PWM modulation; reduce effective deadband; close the loop |
| Sustained oscillation | gain too high | lower Kp; add hysteresis |
| Never settles within ±2% | poor tuning / on/off only | tune PWM gain & frequency; on/off alone cannot settle |
| Lag on the fast path segment | gain too low for setpoint speed | raise Kp (toward 40) or add velocity feed-forward |

## 9. Related Demo Views
Family 3 — Duty, Position, Coordinated, Tuning. Export the duty, step, tracking, and tuned CSVs
for N3.

## 10. Related Notebook
**N3 — PWM / Control**: reproduces the duty curve and response metrics; verifies the thresholds.

## 11. Related Quiz
**Q3** (PWM & position control), **Q5** (coordinated control & tuning).

## 12. Exit Criteria
Duty curve monotonic, tracking ≤ 10 mm, tuned response settles ≤ 2.5 s. Proceed to Chapter 5.
