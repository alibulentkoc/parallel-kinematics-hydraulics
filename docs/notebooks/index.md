# Notebooks

These notebooks are the bridge **simulator ↔ engineering analysis ↔ artifact**. Each one
**reproduces** a result from an exported CSV/log, **verifies** it against the engine values and
acceptance thresholds, **analyzes** only what the simulator and artifacts already define, and
**exports** a report. They introduce no new theory.

Raw `.ipynb` files are not served by this site (they render as JSON). Open each one in Google
Colab to run it, or view it on GitHub. By default a notebook reads the reference CSVs from
`docs/figures`; on Colab it pulls them from raw GitHub automatically, and you can drop your own
demo exports in their place.

| Notebook | Reproduces → Verifies | Open |
|---|---|---|
| **N0 — Instructor Audit** | student submissions → every rubric threshold | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N0-instructor-audit.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N0-instructor-audit.ipynb) |
| **N1 — Kinematics** | workspace/det J → IK-FK round-trip < 1e-6 m | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N1-kinematics.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N1-kinematics.ipynb) |
| **N2 — Hydraulics** | sizing → phi <= 1.6, force/flow/pressure rules | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N2-hydraulics.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N2-hydraulics.ipynb) |
| **N3 — PWM / Control** | duty + responses → settling <= 2.5 s, tracking <= 10 mm | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N3-pwm-control.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N3-pwm-control.ipynb) |
| **N4 — Validation** | twin vs rig → RMSE <= 10 mm, pressure <= 15% | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N4-validation.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N4-validation.ipynb) |
| **N5 — Integration** | full pipeline → all gates pass | [Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N5-integration.ipynb) · [GitHub](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/N5-integration.ipynb) |

Each notebook ends by writing a small report CSV (e.g. `twin-accuracy.csv`,
`sizing-report.csv`, `final-report-package.csv`) — the same kind of artifact a student submits.
