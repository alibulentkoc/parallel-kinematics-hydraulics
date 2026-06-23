# Learn Electrohydraulic Parallel Kinematics

Welcome. This is the student-facing course for the **Electrohydraulic Parallel
Kinematics Machine (PKM) Testbed** — a hands-on path through **parallel
kinematics, hydraulics, feedback control, and digital twins**, built around a
single running system you can drive in your browser.

Every topic is taught in layers: **physical intuition → visual understanding →
mathematical formulation → computational implementation → engineering practice**.
You won't just learn *how* the equations work, but *why* they matter in a real
hydraulic machine.

## Start here

- [**Lesson 1.1 — What Is a Parallel Kinematics Machine?**](module01/1-1-what-is-a-pkm.md) — the orientation lesson and the prototype of the full student experience (reading, diagram, interactive demo, code pointer, and knowledge check).

## How the materials fit together

Each lesson comes with:

- a **reading** (this site),
- **visuals** — SVG figures and Mermaid diagrams that build intuition,
- an **interactive demo** you can drag and tune,
- a **code pointer** into the tested source (`src/`) so you can see the idea running,
- and a formative **knowledge check** (unlimited attempts, immediate feedback — it doesn't affect any grade).

## The three ways to use this project

| | What it is | Where |
|---|---|---|
| **This course** | structured lessons with demos & checks | you're in it |
| **The simulator apps** | instructor / student / grading consoles | <a href="app/index.html" target="_blank">open the apps ↗</a> |
| **The reference handbook** | the full engineering theory | [Kinematics](handbook/02-kinematic-twin.md) · [Hydraulics](handbook/03-hydraulic-twin.md) · [Control](handbook/04-control-twin.md) · [Wiring](handbook/06-wiring-and-io-appendix.md) |

!!! note "About the machine"
    The running system is a planar electrohydraulic parallel manipulator: a moving
    platform held by hydraulic cylinders. A **2-DOF** version (position only) is the
    midterm machine; a **3-DOF** version (position + orientation) is the final. Every
    abstract tool in this course serves one concrete goal — *put the platform exactly
    where you command it, and know when you can't.*

---

*Begin with [Lesson 1.1](module01/1-1-what-is-a-pkm.md), or see the [roadmap](roadmap.md) for the full course plan.*
