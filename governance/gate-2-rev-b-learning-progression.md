# Gate 2 — Revision B (conditional-approval revisions incorporated)

Incorporates the three required changes; **M0 and M1 are unchanged** from Gate 2.
Lesson counts: M0 = 3 · M1 = 4 · **M2 = 8** · M3 = 6 · M4 = 4 (+1 optional) → **25 required**.

---

## Change 1 (significant) — M3 reordered: geometry → kinematics → Jacobian → singularities → control → tuning

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| **3.1 3-RPR geometry & architecture** | define the 3-leg machine frame | 3-RPR geometry config (anchors/attach) (→ twin, 3-DOF) | geometry setup | — | config check |
| **3.2 3-RPR IK/FK** | solve pose ↔ legs for 3 DOF | **Working 3-DOF IK/FK** (Newton FK), round-trip verified (→ twin, 3-DOF) | kinematics 3-DOF | — | round-trip check |
| **3.3 Jacobian & manipulability** | quantify dexterity | **Manipulability map** (→ 3-DOF) | Jacobian | — | map check |
| **3.4 Singularities & safe region** | bound a safe region (incl. the symmetric-pose singularity) | **Singularity / safe-region map** (→ 3-DOF) | singularity fault | — | region check |
| **3.5 Coordinated / task-space control** | drive coordinated pose along a path | Coordinated + task-space control runs (→ 3-DOF) | control + trajectory | rig path test | path-tracking check |
| **3.6 PWM tuning & validation** | tune bang-bang motion to spec | **Tuned-control report** (duty/deadband, limit-cycle amplitude) (→ 3-DOF) | DCV+PWM + grading | rig tuning | tuned-response test |

Dependency now mirrors practice: **geometry → kinematics → Jacobian → singularities → control → tuning.**

---

## Change 2 (minor) — M2: design review inserted before commissioning (now 8 lessons)

2.1–2.6 unchanged. Then:

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| **2.7 Design review** *(new)* | defend the build before operating hardware | **Hydraulic Design Review Package** — cylinder sizing · valve selection · pump sizing · safety checklist · wiring diagram (→ 2-DOF) | sizing models for cross-check | — | **Design Review Rubric** |
| **2.8 Commission the 2-DOF machine** *(midterm)* | run the real rig to spec | **Working 2-DOF prototype + twin-vs-rig report** (→ 2-DOF) | full hydraulic twin | full assembly & commissioning | **Midterm rubric** |

Mirrors real engineering: a gated design review catches mistakes **before** hydraulic power is applied.

---

## Change 3 (minor) — M4: Twin Accuracy Report added as the formal "Twin ≈ Machine" proof

| Lesson | After this, students can… | Artifact (→ anchor) | Simulator feature | Hardware | Assessment |
|---|---|---|---|---|---|
| 4.1 Log schema & synchronization | record twin + rig on one schema | Synchronized log set (→ integration) | logger/schema | instrument rig | sync check |
| 4.2 Validation & verification (replay) | replay logs to validate the twin | V&V report (→ integration) | trace/replay | rig capture | V&V report |
| **4.3 Twin accuracy & performance** *(strengthened)* | **prove the twin matches the machine** | **Twin Accuracy Report** — position RMSE · settling time · duty cycle · **pressure-prediction error** (→ integration) | grading/metrics | paired twin+rig runs | accuracy thresholds |
| 4.4 Integrate & validate the 3-DOF machine *(final)* | operate the full system to spec | **Integrated 3-DOF system** (→ 3-DOF, integration) | full stack | 3-DOF build & integration | **Final rubric** |
| 4.5 *(optional)* Physical AI extension | prototype trajectory/autonomy/vision | extension demo/proposal (→ optional) | external/advanced | optional | optional credit |

The Twin Accuracy Report makes **Twin ≈ Machine** a measured claim, not just a successful replay.

---

**Orphan check:** still clean — all 25 required lessons produce an artifact tied to an anchor;
4.5 is clearly optional. **No orphans.** Gate 2 is now **fully approved** per your conditional approval.
