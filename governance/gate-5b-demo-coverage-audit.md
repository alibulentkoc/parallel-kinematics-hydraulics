# Gate 5B — Demo Coverage Audit (pre-figures gate)

The final curriculum-level audit before figures: does **every artifact** have both **demo
support** and **assessment support**? This closes the full traceability chain
**Competency → Lesson → Demo Family → View → Artifact → Assessment → Threshold.**

Honesty note: three artifacts are **demo-exempt by design** (planning / external). They are
flagged explicitly, not hidden — a demo-exempt planning artifact is acceptable; an
*unexpected* missing demo would be the red flag.

---

## Artifact coverage

| Artifact | Demo support | Assessment support |
|---|---|---|
| System block diagram | Family 1 (read-only) | Brief check (subsystems) |
| Observation log | Family 1 (read-only) | Observation check |
| Project proposal + architecture | — *(by design: planning)* | Proposal rubric |
| Geometry config | Family 1 | Config check |
| IK implementation | Family 1 | IK unit check |
| FK implementation | Family 1 | FK round-trip check |
| Workspace map | Family 1 | Workspace rubric |
| Cylinder spec | Family 2 | Spec check |
| Valve/flow worksheet | Family 2 | Worksheet check |
| Hydraulic Sizing Report | Family 2 | Sizing-report rubric |
| Sensor scaling table | Family 2 | Scaling check |
| Duty-cycle characterization | Family 3 | Duty-cycle lab |
| Position-control demo | Family 3 | Position-within-deadband test |
| Hydraulic Design Review Package | Family 2 (cross-check) | Design Review Rubric |
| 2-DOF prototype + twin-vs-rig | Family 4 (Overlay) | Midterm rubric |
| 3-RPR geometry config | Family 1 (3-DOF) | Config check |
| 3-DOF IK/FK | Family 1 (3-DOF) | 3-DOF round-trip check |
| Manipulability map | Family 1 | Manipulability rubric |
| Safe-region map | Family 1 | Region check |
| Coordinated / task-space runs | Family 3 | Path-tracking check |
| Tuned Control Report | Family 3 | Tuned-response test |
| Synchronized log set | Family 4 | Sync check |
| V&V report | Family 4 | V&V rubric |
| Twin Accuracy Report | Family 4 (Accuracy) | Validation rubric |
| Twin Discrepancy Analysis | Family 4 (Diagnose) | Diagnosis check (validation rubric) |
| Integrated 3-DOF system | Family 4 | Final rubric |
| Extension demo / proposal *(opt)* | — *(by design: external)* | Optional credit |

---

## Audit result

- **Assessment support: 27 / 27 artifacts.** No exceptions — every artifact is graded.
- **Demo support: 25 / 27 artifacts.** The two without are **demo-exempt by design**:
  the **project proposal** (a planning document) and the **optional extension** (external
  tooling). The **Design Review Package** is demo-supported via Family 2 (it reviews
  Family-2-produced sizing) — not demo-less.
- **No unexpected gaps. No red flags.** Every technical artifact a student must produce has a
  demo to produce it in and a rubric to grade it by.

**Invariant confirmed:** *every artifact → demo support (or a documented by-design
exemption) AND assessment support.*

---

## Traceability chain (now complete)

```
Competency  →  Lesson  →  Demo Family  →  View  →  Artifact  →  Assessment  →  Threshold
   C4           1.4        Family 1      Workspace   Workspace map   Workspace rubric   >=90% poses
   C6           2.5        Family 3      Duty sweep  Duty-cycle char Duty-cycle lab     monotonic + deadband
   C15          4.3        Family 4      Accuracy    Twin Accuracy   Validation rubric  RMSE<=10mm, <=15%
```

Each link is now backed by an artifact in this repo. This is the strongest anti-drift
structure in the project.

---

## Preserved organizing idea

The **Twin Maturity ↔ Demo Family** alignment (Observe/Kinematic → Family 1, Hydraulic →
Family 2, Control → Family 3, Validation → Family 4) is recorded in the Demo-to-Curriculum
Map and will be carried into the handbook as a top-level organizing principle of the course —
the demos are the visible manifestation of the twin maturity model.

---

With assessment and demo coverage confirmed, the demo phase is fully closed. Next in the Gate
5B sequence: **figures → quizzes → notebooks → handbook → lesson prose.**
