# Gate 5B — Pre-Demo: Simulator Activity, Workload Audit, Demo Architecture

Three pre-demo deliverables requested at spec approval. **No demos built here** — this is the
checkpoint before demo generation.

---

## 1. Fourth invariant — Primary Simulator Activity (one per lesson)

Added as a spec field. Honest note: two lessons are **planning/review** and use the simulator
only as an indirect cross-check, not an interactive activity — flagged as such rather than
inventing an interaction.

| Lesson | Primary Simulator Activity |
|---|---|
| 0.1 | Run a preset machine; observe inputs → outputs (read-only) |
| 0.2 | Run a preset; read telemetry channels from the log |
| 0.3 | *(indirect)* run a reference preset to inform scope |
| 1.1 | Set geometry params; observe the rendered frame/anchors |
| 1.2 | Manipulate target pose; observe cylinder lengths (IK) |
| 1.3 | Manipulate cylinder lengths; observe pose (FK) |
| 1.4 | Generate workspace map (sweep poses) |
| 2.1 | Adjust cylinder geometry; observe force/area & asymmetry |
| 2.2 | Set DCV command / ΔP; observe orifice flow |
| 2.3 | Set load/speed demand; observe required pump flow/pressure/power |
| 2.4 | Map sensor signal ↔ engineering units; verify scaling |
| 2.5 | Sweep PWM duty cycle; record average velocity |
| 2.6 | Command a target with on/off valve; observe deadband / limit cycle |
| 2.7 | *(indirect)* cross-check sizing & behavior in the twin |
| 2.8 | Run twin alongside the rig log; compare twin-vs-rig |
| 3.1 | Set 3-RPR geometry; observe platform/anchors |
| 3.2 | Manipulate pose/legs in 3-DOF; observe IK/FK |
| 3.3 | Generate manipulability heatmap |
| 3.4 | Probe poses near singularities; observe det(J) → 0 & safe region |
| 3.5 | Command a coordinated path; observe task-space tracking |
| 3.6 | Tune deadband/hysteresis/duty; observe settling & limit cycle |
| 4.1 | Align twin + rig logs on the shared schema |
| 4.2 | Replay a rig log through the twin; compare |
| 4.3 | Compare twin and hardware logs; compute accuracy metrics |
| 4.4 | Run the integrated 3-DOF system; validate against the twin |
| 4.5 *(opt)* | Sandbox an extension (learned / vision) |

23 of 25 lessons have a genuine primary interaction; 0.3 and 2.7 are explicit cross-check exceptions.

---

## 2. Workload audit

**Assumptions (planning estimates, to validate with the first run):** senior-undergraduate;
the course includes a **real physical build** and **lab access**; hours are *student* hours
(lecture + lab + homework + project), not instructor prep.

| Lesson | Lec | Lab | HW | Proj | Total |
|---|--:|--:|--:|--:|--:|
| 0.1 | 1 | 0 | 1 | 0 | 2 |
| 0.2 | 1 | 1 | 1 | 0 | 3 |
| 0.3 | 1 | 0 | 2 | 2 | 5 |
| 1.1 | 1 | 1 | 1 | 1 | 4 |
| 1.2 | 2 | 1 | 2 | 1 | 6 |
| 1.3 | 1 | 1 | 2 | 1 | 5 |
| 1.4 | 1 | 2 | 2 | 1 | 6 |
| 2.1 | 2 | 1 | 2 | 1 | 6 |
| 2.2 | 2 | 1 | 2 | 1 | 6 |
| 2.3 | 2 | 1 | 3 | 2 | 8 |
| 2.4 | 1 | 2 | 1 | 2 | 6 |
| 2.5 | 1 | 3 | 2 | 2 | 8 |
| 2.6 | 1 | 3 | 2 | 2 | 8 |
| 2.7 | 1 | 0 | 2 | 4 | 7 |
| 2.8 | 1 | 4 | 1 | 6 | 12 |
| 3.1 | 1 | 1 | 1 | 1 | 4 |
| 3.2 | 2 | 1 | 2 | 2 | 7 |
| 3.3 | 1 | 2 | 2 | 1 | 6 |
| 3.4 | 2 | 1 | 2 | 1 | 6 |
| 3.5 | 2 | 2 | 2 | 2 | 8 |
| 3.6 | 1 | 3 | 2 | 2 | 8 |
| 4.1 | 1 | 2 | 1 | 2 | 6 |
| 4.2 | 1 | 2 | 1 | 2 | 6 |
| 4.3 | 1 | 2 | 2 | 3 | 8 |
| 4.4 | 1 | 4 | 1 | 8 | 14 |
| **Total (required)** | **33** | **43** | **44** | **55** | **165** |
| 4.5 *(optional)* | 1 | 2 | 1 | 4–6 | +8–10 |

**Module subtotals:** M0 ≈ 10 h · M1 ≈ 21 h · **M2 ≈ 61 h** · M3 ≈ 39 h · M4 ≈ 34 h.

### Honest reading

- **~165 student-hours.** A US 3-credit course ≈ 135 h; a **4-credit course with a lab ≈
  180 h.** So this scope fits a **4-credit lab course** comfortably, but is **over budget for a
  pure 3-credit course** by ~20–30 h. Your instinct was right to check.
- **The load is uneven, not the total.** It does **not** balloon to 35–40 weeks — at ~165 h /
  15 weeks it is ~11 h/week. But **M2 is a crunch:** ~61 h compressed into weeks 5–8 (~15
  h/week) culminating in the midterm, and **4.4 (final integration) is a 14 h spike** in week
  15. Those two are the real risk, not the headcount of lessons.

### Recommendation (pick one before content)

1. **Treat it as a 4-credit course with lab** (cleanest — the scope already fits). *Recommended.*
2. **If it must be 3-credit:** trim ~25 h by merging **2.1+2.2** (cylinders+DCVs → one
   lesson), merging **1.2+1.3** (IK+FK → one), and making **4.5** the only optional. That
   brings it to ~22 lessons / ~140 h.
3. **Either way, de-risk the M2 crunch:** schedule extra lab/TA hours in weeks 5–8 and stage
   2.8's build across two lab sessions.

No content should be generated until you pick a lane, because it changes the lesson count.

---

## 3. Demo architecture — four families (not one-per-lesson)

One powerful, parameterized demo per family; each lesson embeds a **preconfigured view** of
its family demo (by URL params / mode), never a fresh copy. This is the structural fix for the
original "same demo duplicated across seven lessons" problem.

### Family 1 — Kinematics Explorer
Supports **1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4** (2-DOF & 3-DOF modes).
Views: geometry · target→length (IK) · length→pose (FK) · workspace heatmap · manipulability
heatmap · singularity probe.

### Family 2 — Hydraulic Explorer
Supports **2.1, 2.2, 2.3, 2.4**.
Views: cylinder/asymmetry · DCV flow vs. ΔP · pump/power sizing · sensor scaling.

### Family 3 — PWM / Control Lab  *(extended from your "PWM Control Lab" to also hold 3.5)*
Supports **2.5, 2.6, 3.5, 3.6**.
Views: duty-cycle sweep · on/off positioning (deadband/limit cycle) · coordinated/task-space
path · tuning. *(3.5 added here because coordinated control is a control activity, not a
kinematics one — flagging the one change from your list for your okay.)*

### Family 4 — Digital Twin Validation Lab
Supports **2.8, 4.1, 4.2, 4.3, 4.4**.
Views: twin-vs-rig overlay · log synchronization · replay · accuracy metrics · integrated
validation.

### Coverage & reuse

| Family | Lessons served | Demo count |
|---|---|---|
| 1 Kinematics Explorer | 8 | 1 |
| 2 Hydraulic Explorer | 4 | 1 |
| 3 PWM / Control Lab | 4 | 1 |
| 4 Twin Validation Lab | 5 | 1 |
| *(reference viz)* M0 0.1–0.2 | 2 | reuse Family 1 read-only |
| *(no demo)* 0.3, 2.7, 4.5 | 3 | by design (planning/review/optional) |

**4 demos serve 21 lessons.** 0.1–0.2 reuse Family 1 in read-only mode; 0.3, 2.7, and 4.5
have no demo by design. Compared with the original (one duplicated demo across many lessons),
this is **4 maintained demos instead of ~20 near-duplicates.**

---

## Decision requested

Two choices before I build demos:
1. **Workload lane:** 4-credit-with-lab (recommended, scope fits) · 3-credit (I trim to ~22
   lessons) · keep 25 but de-risk M2.
2. **Confirm the demo families** (incl. moving 3.5 into the PWM / Control Lab).

On your answers I proceed to **build the four demo families** (the next 5B stage), then
figures → quizzes → notebooks → handbook. Still no lesson prose until demos are approved.
