# Gate 5B — Demo-to-Curriculum Map

The authoritative reference binding every lesson to the demo family, view, and artifact that
serves it. Approved demo architecture: **4 families serving 21 lessons** (3 lessons have no
demo by design). This table governs future changes — move a lesson, and its row must still
resolve to a real family/view/artifact or the change is rejected.

---

## Lesson → Demo Family → View → Artifact

### M0 — Observe
| Lesson | Family | View | Artifact |
|---|---|---|---|
| 0.1 PKM project & system | 1 Kinematics Explorer | Live (read-only) | System block diagram |
| 0.2 Why a digital twin | 1 Kinematics Explorer | Live (read-only, telemetry) | Observation log |
| 0.3 Proposal & architecture | — | *(no demo — planning)* | Project proposal |

### M1 — Kinematic Twin
| Lesson | Family | View | Artifact |
|---|---|---|---|
| 1.1 Geometry | 1 Kinematics Explorer | Live (geometry) | Geometry config |
| 1.2 Inverse kinematics | 1 Kinematics Explorer | Live (target → lengths) | IK implementation |
| 1.3 Forward kinematics | 1 Kinematics Explorer | Live (lengths → pose) | FK implementation |
| 1.4 Workspace | 1 Kinematics Explorer | **Workspace** | Workspace map |

### M2 — Hydraulic Twin (midterm)
| Lesson | Family | View | Artifact |
|---|---|---|---|
| 2.1 Cylinders & asymmetry | 2 Hydraulic Explorer | Cylinder | Cylinder spec |
| 2.2 Solenoid DCVs | 2 Hydraulic Explorer | Valve | Valve/flow worksheet |
| 2.3 Pump & sizing | 2 Hydraulic Explorer | Pump / Power | Hydraulic Sizing Report |
| 2.4 Sensors & scaling | 2 Hydraulic Explorer | Sensor | Sensor scaling table |
| 2.5 PWM actuation | 3 PWM / Control Lab | **Duty sweep** | Duty-cycle characterization |
| 2.6 Position control | 3 PWM / Control Lab | **Position** | Position-control demo |
| 2.7 Design review | — | *(no demo — gate; Family 2 cross-check)* | Hydraulic Design Review Package |
| 2.8 Commission 2-DOF | 4 Twin Validation Lab | **Overlay** | 2-DOF prototype + twin-vs-rig report |

### M3 — Control Twin
| Lesson | Family | View | Artifact |
|---|---|---|---|
| 3.1 3-RPR geometry | 1 Kinematics Explorer | Live (3-DOF) | 3-RPR geometry config |
| 3.2 3-DOF IK/FK | 1 Kinematics Explorer | Live (3-DOF) | 3-DOF IK/FK |
| 3.3 Jacobian & manipulability | 1 Kinematics Explorer | **Manipulability** | Manipulability map |
| 3.4 Singularities & safe region | 1 Kinematics Explorer | **Singularity** | Safe-region map |
| 3.5 Coordinated / task-space | 3 PWM / Control Lab | **Coordinated** | Coordinated / task-space runs |
| 3.6 PWM tuning | 3 PWM / Control Lab | **Tuning** | Tuned Control Report |

### M4 — Validation Twin (final)
| Lesson | Family | View | Artifact |
|---|---|---|---|
| 4.1 Log synchronization | 4 Twin Validation Lab | **Sync** | Synchronized log set |
| 4.2 Validation & verification | 4 Twin Validation Lab | **Replay** | V&V report |
| 4.3 Twin accuracy | 4 Twin Validation Lab | **Accuracy** | Twin Accuracy Report |
| 4.4 Integrate & validate 3-DOF | 4 Twin Validation Lab | **Diagnose** + Accuracy | Integrated 3-DOF system · **Twin Discrepancy Analysis** |
| 4.5 Physical AI extension *(opt)* | — | *(external)* | Extension demo / proposal |

---

## Twin Maturity ↔ Demo Family alignment

The demo set maps cleanly onto the Twin Maturity Map — the architectural rationale for why
there are exactly four families:

| Twin stage | Demo family | What the student can do |
|---|---|---|
| **Observe** | Family 1 (read-only views) | run and read the reference twin |
| **Kinematic Twin** | Family 1 | geometry, IK/FK, workspace, manipulability, singularities |
| **Hydraulic Twin** | Family 2 | size cylinders/valves/pump; scale sensors |
| **Control Twin** | Family 3 | PWM/on-off control, deadband, limit cycles, coordinated control, tuning |
| **Validation Twin** | Family 4 | synchronize, replay, score accuracy, **diagnose discrepancies** |

One family per maturity stage (Family 1 spans Observe + Kinematic, since observing *is* the
first use of the kinematic twin). Each stage's family adds exactly the capability that stage
introduces — which is why the architecture is four families, not three and not twenty.

---

## Coverage check

- **4 families serve 21 lessons.** Family 1 → 10 (incl. 0.1–0.2 read-only), Family 2 → 4,
  Family 3 → 4, Family 4 → 5.
- **3 lessons have no demo by design:** 0.3 (proposal), 2.7 (design-review gate), 4.5
  (optional external extension).
- **New diagnostic artifact recorded:** *Twin Discrepancy Analysis* (Family 4 · Diagnose
  view), tied to validation lessons 4.2–4.4 — the "explain the discrepancy" skill.
- Every demo view appears in at least one lesson; no orphan views.

---

This map is the demo phase's authoritative reference. With it complete, the demo phase of
Gate 5B is finished; the remaining sequence is **figures → quizzes → notebooks → handbook →
lesson prose.**
