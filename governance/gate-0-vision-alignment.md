# Gate 0 — Vision Alignment Review

**Stage-gate status:** Gate 0 submitted for review. No curriculum content (lessons,
notebooks, quizzes, figures, demos, handbook) will be generated until Gates 0–4 are
approved in order. This document contains *only* the Gate 0 deliverables.

**Vision under test:**
> Students design, simulate, build, control, evaluate, and extend a hydraulic parallel
> robot as a Fluid-Powered Physical AI system. The semester projects are the backbone;
> everything else exists to support them.

---

## Deliverable 1 — Program mission statement

In one semester, students take a hydraulic parallel-kinematics robot from concept to a
working, controlled, **Physical AI** machine. They design it, build its **digital twin**,
build the **physical machine**, control it, and extend it toward autonomy. The machine is
the curriculum: kinematics, hydraulics, and control are introduced **only when a project
milestone requires them**. The midterm machine is a **2-DOF (2-RPR) electrohydraulic
manipulator**; the final machine extends it to **3-DOF (3-RPR)**.

## Deliverable 2 — Student persona(s)

- **Primary — "the builder-engineer."** Third/fourth-year or early-graduate
  mechanical / agricultural / mechatronics student. Comfortable with calculus and basic
  programming; **limited prior hydraulics or robotics**. Motivated by building a real
  machine, not by theory for its own sake.
- **Secondary — "the controls/AI-leaning student."** Stronger in programming and control,
  drawn to the digital-twin and Physical AI angle; weaker on hydraulics hardware.

> ⚠️ *Needs instructor confirmation:* exact cohort level, prerequisites, and class size.

## Deliverable 3 — Learning outcomes (program level)

On completion a student can:

1. Frame a hydraulic parallel robot as a **Physical AI system** (digital twin + plant + control).
2. Derive and implement **IK/FK** for 2-RPR and 3-RPR machines.
3. Analyze **workspace, Jacobian, manipulability, and singularities** to bound a safe operating region.
4. **Size hydraulic actuation** (cylinders, valves, pump/power) from requirements.
5. Design, tune, and **validate closed-loop control** in simulation and on hardware.
6. Build and operate a **synchronized digital twin**.
7. **Extend toward autonomy** — trajectory generation, learning control, optional vision.
8. Assemble and operate a **functional electrohydraulic prototype** (2-DOF midterm, 3-DOF final).

> ⚠️ *Outcome 8 assumes a real hardware-build pathway exists — see Risk Register.*

## Deliverable 4 — Midterm project definition

**Design and build a 2-DOF electrohydraulic PKM.** Deliverables: digital twin · workspace
analysis · IK/FK implementation · hydraulic sizing · basic control · functional hardware
prototype. *Midterm assessed at the end of the hardware module.*

## Deliverable 5 — Final project definition

**Extend the system to a 3-DOF electrohydraulic PKM.** Deliverables: 3-RPR kinematics ·
Jacobian analysis · singularity analysis · coordinated control · digital-twin
synchronization · Physical AI extension.

## Deliverable 6 — Physical AI integration statement

Physical AI is the **through-line, not an appendix**. The machine is a fluid-powered
embodiment of physical intelligence: it **senses** (transducers), **decides** (control →
autonomy), and **acts** (hydraulics). Autonomy is built up progressively — trajectory
generation, digital-twin-in-the-loop, learning control, and optional vision — so the final
system perceives, plans, and acts. The Fluid-Powered Physical AI framing appears in
**Module 0** and recurs in every module's deliverable.

> ⚠️ *Needs instructor confirmation:* which autonomy elements (learning control, vision) are
> **required** vs **optional**.

## Deliverable 7 — Digital twin integration statement

**The simulator is the digital twin.** Students build the twin **before** hardware
(Module 1), validate control inside it, then **synchronize twin ↔ hardware** — the same
log schema, controller, and grader run on both, so a passing simulation predicts the rig.
The twin is the design tool, the safety sandbox, and the validation oracle throughout the
semester.

---

## Required questions — can a student explain…

| Question | Answer built into the vision |
|---|---|
| **Why are they building the machine?** | It is the semester project; every lesson states the milestone it advances. |
| **Why does the digital twin exist?** | To design and validate safely before/with hardware, and to run the same controller and grading on both. |
| **Why is Physical AI part of the course?** | The machine *is* a fluid-powered physical-intelligence system; autonomy is added across modules, not bolted on. |

## Approval-criteria checklist

| Required element | Present? |
|---|---|
| Fluid-Powered Physical AI | ✅ Deliverables 1, 6 |
| Digital Twins | ✅ Deliverables 1, 7 |
| Hydraulic Robotics | ✅ Deliverables 1, 4, 5 |
| 2-DOF Midterm Build | ✅ Deliverable 4 |
| 3-DOF Final Build | ✅ Deliverable 5 |

---

## Drift check (GREEN / YELLOW / RED)

| # | Item | Rating | Justification |
|---|---|---|---|
| 1 | Mission statement | 🟢 GREEN | Project-centered; names all five required elements. |
| 2 | Student personas | 🟡 YELLOW | Drafted, but cohort level/prereqs need instructor confirmation. |
| 3 | Learning outcomes | 🟡 YELLOW | Sound, but outcome 8 depends on the hardware-build pathway being real. |
| 4 | Midterm definition | 🟡 YELLOW | Matches directive; "functional hardware prototype" needs confirmation that students physically build (vs. kit/sim). |
| 5 | Final definition | 🟢 GREEN | Matches directive; scope clear. |
| 6 | Physical AI integration | 🟡 YELLOW | Strong as a statement; required-vs-optional scope of vision/learning undefined. |
| 7 | Digital twin integration | 🟢 GREEN | Twin-first is already the intended structure; simulator exists. |

**No RED items.** Four YELLOWs, all resolvable with three instructor confirmations (below).

---

## Gate 0 Review Dashboard

**Alignment metrics (of the *vision*, not the current site):**

- Physical AI alignment: **~90 %** (centered, pending scope)
- Digital Twin alignment: **~95 %** (twin-first; simulator already exists)
- Project-Based Learning alignment: **~95 %** (vision is project-spine; *current site is not — that is the Gate 1 rework*)
- Simulator alignment: **~80 %** (twin exists; hardware-sync pathway needs definition)
- Assessment coverage: **deferred to Gate 4**

**Risk register:**

| Risk | Level | Note |
|---|---|---|
| Hardware reality undefined (real build vs. kit vs. sim-only) | **HIGH** | Drives midterm/final deliverables and outcome 8 |
| Existing site is discipline-based (the original drift) | **HIGH** | Full reorganization is the Gate 1–5 work, not yet started |
| Physical AI scope (vision/learning required or optional) | **MEDIUM** | Could expand scope significantly |
| Student level/background unconfirmed | **MEDIUM** | Affects depth and pacing |
| Live MathJax not rendering on deployed site | **LOW** | Technical/deploy issue, not a vision issue |

---

## To approve Gate 0, please confirm three things

1. **Hardware:** do students physically **build** the machine, use a **shared lab kit**, or
   is the build **simulation-only**? (Turns items 3, 4 GREEN.)
2. **Physical AI scope:** are **learning control** and **vision** **required** or **optional**? (Turns item 6 GREEN.)
3. **Students:** confirm cohort level/prerequisites. (Turns item 2 GREEN.)

**On approval, Gate 1 (Curriculum Architecture Review) will deliver:** the Module 0–4
project-based module structure, the curriculum map, the dependency map, and the project
milestone map — with no module that exists only to teach theory.
