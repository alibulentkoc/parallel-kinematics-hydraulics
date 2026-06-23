# Gate 0.1 — Curriculum Identity Clarification

**Stage-gate status:** Gate 0.1 submitted for review. Gate 1 will **not** begin until the
curriculum identity below is approved. No curriculum content is generated in this document.

**Why this gate exists:** the first directive framed the course around *Fluid-Powered
Physical AI*, and Gate 0 was written to that. A later stakeholder correction states the
core is a **Fluid Power curriculum**, with Physical AI as an *advanced extension*. The two
readings produce materially different architectures, so they are laid out in full below and
one is recommended.

---

## Option A — Physical AI is the organizing principle

**1. Mission.** Students design, simulate, build, control, and extend a hydraulic parallel
robot **as a Fluid-Powered Physical AI system**. Physical intelligence — perception,
decision, autonomous action — is the spine; the hydraulics and kinematics are the
embodiment that makes the intelligence physical.

**2. Module structure.**
- M0 — Physical AI & Digital Twins (the destination: an autonomous fluid-powered machine)
- M1 — Build the 2-DOF Digital Twin
- M2 — Build the Physical 2-DOF Machine
- M3 — Control & Upgrade to 3-DOF
- M4 — **Physical AI Integration** (autonomy, learning control, vision) — the climax

**3. Learning outcomes.** Frame a robot as physical intelligence; build a digital twin as a
world model; design sim-to-real autonomy; implement learning/vision-based control —
*alongside* the hydraulics and kinematics needed to support it.

**4. Midterm.** A 2-DOF electrohydraulic PKM as a **physical-AI testbed** (twin + basic
autonomous behavior).

**5. Final.** A 3-DOF system with **autonomous operation, learning control, and vision**
required as the Physical AI extension.

**6. Role of digital twin.** Central as the AI's **world model** and sim-to-real bridge.

**7. Role of Physical AI.** The **organizing principle** — every module is justified by how
it advances toward an autonomous fluid-powered robot.

---

## Option B — Fluid Power Systems is the organizing principle  *(recommended)*

**1. Mission.** Students design, simulate, build, and control an **electrohydraulic
parallel-kinematics machine** — a rigorous **fluid-power systems engineering** project.
Core competencies are electrohydraulic actuation, system sizing, and closed-loop control,
validated through a **digital twin**. Physical AI appears as an **advanced extension**, not
the backbone.

**2. Module structure.**
- M0 — The Machine & the Digital Twin (project roadmap; what a PKM is; why simulate first)
- M1 — Create the 2-DOF Digital Twin (coordinate systems, IK/FK, workspace — *as the build needs them*)
- M2 — Electrohydraulic Actuation & the Physical 2-DOF Build (cylinders, valves, flow/pressure, power units, sensors) — **the fluid-power core**; *midterm here*
- M3 — Control & Extension to 3-DOF (Jacobian, manipulability, singularities, coordinated/task-space control, 3-RPR)
- M4 — Integration, Validation & Extensions (twin↔hardware sync, validation/grading; **optional Physical AI elective:** trajectory/autonomy/vision)

**3. Learning outcomes.** Size and analyze electrohydraulic systems (cylinder/valve/pump,
flow, pressure, power, sensors); derive and implement IK/FK and Jacobian/singularity
analysis; design, tune, and validate closed-loop control; build and synchronize a digital
twin. *Optional advanced outcome:* extend toward autonomy (Physical AI).

**4. Midterm.** **Design and build a 2-DOF electrohydraulic PKM** — digital twin, workspace
analysis, IK/FK, hydraulic sizing, basic control, functional prototype.

**5. Final.** **Extend to a 3-DOF electrohydraulic PKM** — 3-RPR kinematics, Jacobian and
singularity analysis, coordinated control, digital-twin synchronization. *Optional Physical
AI extension as an advanced elective / research direction.*

**6. Role of digital twin.** A **core engineering instrument** — design tool, safety
sandbox, and sim-to-hardware validation oracle. Central, but as fluid-power engineering
practice, not as an "AI world model."

**7. Role of Physical AI.** An **advanced extension / research direction / elective** —
visible as a capstone option and a future pathway, deliberately **not** the organizing
principle.

---

## Side-by-side

| | Option A — Physical AI core | Option B — Fluid Power core *(rec.)* |
|---|---|---|
| Spine | Autonomy / physical intelligence | Electrohydraulic systems engineering |
| Hydraulics | Embodiment supporting the AI | **The core competency** |
| Physical AI | Required, the climax (M4) | Optional advanced extension |
| Digital twin | AI world model | Engineering design/validation tool |
| Risk | Over-scopes; under-serves fluid-power depth | Keeps fluid-power rigor; AI may feel "tacked on" if not signposted |
| Fits the existing simulator/engine | Needs new AI features | **Yes, directly** |

---

## Recommendation — **Option B (Fluid Power Systems)**

**Justification:**

1. **It matches the latest stakeholder correction**, which explicitly states the curriculum
   is a Fluid Power curriculum with Physical AI as an extension.
2. **It serves the actual core competencies.** The depth that students must own —
   electrohydraulic sizing, valves, pumps, power units, sensors, closed-loop control — is
   fluid-power engineering. Making autonomy the spine (Option A) risks crowding out that
   depth in a single semester.
3. **It fits the instructor and the existing assets.** The simulator/engine is already an
   electrohydraulic PKM testbed; Option B uses it as-is, with Physical AI features additive
   rather than prerequisite.
4. **It keeps the forward-looking angle without over-committing.** Digital twins,
   simulation, and project-based learning remain central; Physical AI stays visible as a
   capstone/elective and research path — satisfying both the fluid-power identity and the
   ambition, without forcing every student through vision/learning-control.

**What Option B changes versus the earlier Physical-AI-centric Gate 0:**

- Module 0 becomes "**The Machine & the Digital Twin**" (fluid-power roadmap), not "Physical AI & Digital Twins."
- Module 4 becomes "**Integration, Validation & Extensions**," with Physical AI as an **optional elective**, not the required climax.
- Learning outcomes re-center on electrohydraulic systems; the Physical AI outcome becomes optional/advanced.
- The digital twin is reframed as an engineering instrument rather than an AI world model.

---

## Decision requested

Please approve **one** of:

- ✅ **Option B (recommended)** — Fluid Power core, Physical AI as an extension.
- Option A — Physical AI core.
- A specific blend (tell me where Physical AI should sit on the required ↔ optional line).

**On approval I will:** (1) revise Gate 0 to the chosen identity, (2) carry over the two
still-open Gate 0 confirmations — **hardware reality** (build / kit / sim-only) and **student
cohort** — and then (3) begin **Gate 1 (Curriculum Architecture Review)**. I will not start
Gate 1 until identity is approved.
