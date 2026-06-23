# Gate 1 — Revision B (conditional-approval revisions incorporated)

**Status:** Gate 1 received **conditional approval**. This revision incorporates
**Revision 1** (basic control → M2) and **Revision 2** (Twin Maturity Map), and resolves
**Revision 3** (valve architecture) with a recommendation and a decision request. Still
**no lessons** — architecture only. Gate 2 begins once the valve path is confirmed.

---

## Revision 1 — Basic control moved into M2

Students must be able to *move and position* the rig to commission it at the midterm, so
control is now split: **fundamentals in M2**, **advanced/coordinated control in M3.**

| Module | Was | **Now** |
|---|---|---|
| **M2 — Electrohydraulic Actuation & the Physical 2-DOF Build** *(midterm)* | hydraulics only | hydraulics **+ open-loop motion, position-control fundamentals, basic single-axis control, valve actuation** — enough to commission the 2-DOF machine |
| **M3 — Coordinated Control & Extension to 3-DOF** | all control + 3-DOF | **advanced control only:** Jacobian, manipulability, singularities, coordinated / task-space control, 3-RPR kinematics |

Result: students learn to actuate and position **before** they are asked to commission
hardware; M3 builds the *coordinated* control the 3-DOF machine needs.

---

## Revision 2 — Twin Maturity Map (the twin's explicit growth)

| Module | Twin capability | What the twin can do at this stage |
|---|---|---|
| **M0** | **Observe** | run/inspect a reference machine; understand inputs↔outputs |
| **M1** | **Kinematic Twin** | IK/FK, workspace, reachability — geometry only |
| **M2** | **Hydraulic Twin** | + cylinders, valves, flow/pressure, **basic actuation & position control** |
| **M3** | **Control Twin** | + closed-loop, coordinated / task-space control, 3-DOF |
| **M4** | **Validation Twin** | + twin↔hardware synchronization, V&V, performance evaluation |

Each module must advance the twin **exactly one maturity step** — no module may leave the
twin's capability unchanged, and "digital twin" now has a precise, testable meaning in each
module rather than being a blanket label.

---

## Revision 3 — Valve architecture decision (the key technical risk)

The conflict is real: the **hardware** is specified as **solenoid-operated DCVs** (on/off
devices), while the **simulator** currently centers on a **proportional valve + PID +
continuous-flow** model. These produce different courses. The decision cannot wait.

### Recommendation: **Path A — solenoid on/off DCVs, PWM modulation, bang-bang / position control**

**Why Path A:** your hardware is repeatedly specified as **solenoid-operated DCVs**, which
are on/off. The physically honest path is therefore A. **PWM** (pulse-width modulating the
solenoids) yields pseudo-proportional *average* flow, so students get real, practical motion
control from inexpensive valves — the standard teaching-lab approach. The proportional-valve
model becomes the **idealized/advanced reference**, not the primary control path.
*Choose Path B only if the kit actually contains proportional or servo valves.*

### Impact of the decision (the five areas you named)

| Area | **Path A (recommended): on/off DCV + PWM** | Path B: proportional |
|---|---|---|
| **Learning objectives** | duty-cycle/PWM control, bang-bang, **deadband, limit cycles**; PID/continuous as an *advanced* comparison | continuous flow control, PID tuning as core |
| **Control lessons** | M2: open-loop + on/off actuation + PWM + basic position control · M3: coordinated control over PWM | M2: P control · M3: full PID + coordinated |
| **Simulator fidelity** | **must add an on/off DCV + PWM valve model**; keep the proportional model as the idealized reference *(required engine change)* | no change — current model already fits |
| **Grading criteria** | bang-bang metrics: time to settle **into a deadband**, limit-cycle amplitude, duty-cycle efficiency | continuous metrics: overshoot, settling time, steady-state error |
| **Hardware labs** | PWM solenoid drivers, duty-cycle & deadband characterization | proportional-valve calibration, flow-command linearity |

**Honest implication:** Path A makes the *existing simulator partially mismatched* — it is
proportional-only today. Choosing A creates a required simulator task (add a DCV+PWM mode)
that would be scheduled in a later build gate, not done now.

> **Decision requested:** confirm **Path A** (recommended, matches solenoid DCVs) — or, if the
> kit has proportional valves, choose **Path B**. Everything in Gate 2 is built to the
> chosen path.

---

## Updated maps (reflecting Revisions 1–3, Path A assumed pending your confirmation)

### Dependency map

| Module | Requires | Provides |
|---|---|---|
| M0 | — | spec, architecture → M1, M2 |
| M1 | M0 | Kinematic Twin (IK/FK, workspace) → M2, M3 |
| M2 | M1 | Hydraulic Twin, **basic control**, the 2-DOF rig → M3, M4 |
| M3 | M1 + M2 | Control Twin (coordinated, 3-DOF) → M4 |
| M4 | M1–M3 | Validation Twin, integrated 3-DOF system |

### Curriculum map (module-level audit)

| Module | Milestone (anchor) | Deliverable | Simulator feature | Hardware activity | Assessment |
|---|---|---|---|---|---|
| M0 | twin (C) | proposal + architecture | reference-machine viz | identify kit (power pack, cylinders, **solenoid DCVs**) | proposal rubric |
| M1 | 2-DOF (A) + twin (C) | Kinematic Twin | kinematics 2-DOF, workspace | — | twin check + workspace map |
| M2 | 2-DOF (A) — **midterm** | Hydraulic Twin + 2-DOF rig | hydraulics + **on/off DCV + PWM model** + basic control | assemble & commission rig; PWM driver lab | **midterm:** working prototype + sizing report + basic positioning |
| M3 | 3-DOF (B) + twin (C) | Control Twin + 3-DOF twin | kinematics 3-DOF, Jacobian, coordinated control, singularity fault, grading | coordinated control of the rig | control meets spec (sim+rig); 3-DOF twin verified |
| M4 | integration (D) + 3-DOF (B) — **final** | Validation Twin + integrated system | logger/trace/schema, grading V&V | 3-DOF build, integration, validation | **final:** integrated validated system + performance report |

### Simulator alignment (updated)

| Activity | Capability | Status |
|---|---|---|
| Kinematics / workspace / Jacobian / singularity | engine modules | ✅ supported |
| Hydraulic sizing, faults, logging, grading | engine modules | ✅ supported |
| **On/off DCV + PWM control (Path A)** | **not modeled — proportional only** | ❌ **required new sim mode (Path A)** |
| Twin ↔ hardware live sync (M4) | logging/replay only | ⚠️ partial — needs interface |
| Physical AI (vision/learning) | not modeled | ➖ optional elective |

---

## Orphan check (unchanged — still clean)

| Module | A 2-DOF | B 3-DOF | C twin | D integration | Orphan? |
|---|:--:|:--:|:--:|:--:|:--:|
| M0 | ○ | | ● | | No |
| M1 | ● | | ● | | No |
| M2 | ● | | ● | | No |
| M3 | | ● | ● | | No |
| M4 | | ● | ○ | ● | No |

**No orphans. No theory-only modules.**

---

## Dashboard

**Green:** project-centered architecture · midterm/final · twin integration (now with an
explicit maturity map) · no orphans · Physical AI demoted to extension · **control placement
fixed** · **twin maturity defined**.
**Yellow → resolving:** **valve architecture** (recommendation issued, awaiting your
confirmation) · student cohort · live twin↔hardware sync scope.
**Red:** none.

**Risk register:**

| Risk | Level | Note |
|---|---|---|
| Valve path not yet confirmed | **HIGH→pending** | Recommended Path A; one confirmation closes it |
| Path A requires a new DCV+PWM simulator mode | **MEDIUM** | Scheduled to a later build gate, not now |
| Live twin↔hardware sync interface | **MEDIUM** | Needed for M4 |
| Student cohort level | **YELLOW** | Affects Gate 2 depth |

---

## Decision requested

1. **Confirm the valve path** — **Path A (recommended)** or Path B.
2. Approve **Gate 1 — Revision B**.

On both, I will open **Gate 2 — Learning Progression Review**, defining each module's lessons
with: objective · milestone supported · **artifact produced** (proposal / digital twin /
workspace map / hydraulic sizing report / hardware build / control implementation /
validation report / final system) · simulator feature · hardware activity · assessment — and
cutting any lesson that does not produce one of those artifacts, **before** any content is written.
