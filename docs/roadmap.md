# Course Roadmap

This course is built as a true sibling of a lesson-based curriculum: **Module →
Unit → Lesson**, each lesson with a reading, visuals, an interactive demo, a code
pointer, and a formative knowledge check.

**Module 1 — Kinematics is authored in full.** Modules 2–4 are mapped below and
draw on material that already exists in the [reference handbook](01-kinematics-and-motion.md)
and the [interactive demos](demos/index.html); they are being expanded into the
same per-lesson format.

## ✅ Module 1 — Kinematics *(complete)*

- **Unit 1 — The Parallel Machine**
    - [1.1 What Is a Parallel Kinematics Machine?](module01/1-1-what-is-a-pkm.md)
    - [1.2 The 2-RPR Geometry & Pose](module01/1-2-geometry-and-pose.md)
- **Unit 2 — Solving the Motion**
    - [2.1 Inverse Kinematics](module01/2-1-inverse-kinematics.md) · demo
    - [2.2 Forward Kinematics](module01/2-2-forward-kinematics.md)
    - [2.3 Reachability & the Workspace](module01/2-3-reachability.md)
- **Unit 3 — Differential Motion**
    - [3.1 The Jacobian & Manipulability](module01/3-1-jacobian.md) · demo
    - [3.2 Singularities](module01/3-2-singularities.md) · demo

## 🔜 Module 2 — Hydraulic Actuation

Reference: [Hydraulic Design & Calculations](02-hydraulic-design.md) · demos:
[Cylinder Asymmetry](demos/cylinder-asymmetry.html), [Valve Flow Law](demos/orifice-flow.html)

- **Unit 1 — Cylinders & Asymmetry**
    - 1.1 The Hydraulic Cylinder
    - 1.2 Area Asymmetry φ · demo
    - 1.3 Force and Speed
- **Unit 2 — Valves, Flow & Pressure**
    - 2.1 The Valve Flow Law · demo
    - 2.2 Load Pressure & the Jacobian
    - 2.3 Pump & Relief Sizing

## 🔜 Module 3 — Closed-Loop Control

Reference: [The Control System](03-control-system.md) · demo: [PID Tuning](demos/pid-tuning.html)

- **Unit 1 — The Feedback Loop**
    - 1.1 Why Feedback
    - 1.2 PID Control · demo
    - 1.3 The Tuning Trade-off · demo
- **Unit 2 — Controlling a Parallel Machine**
    - 2.1 Joint-Space vs Task-Space
    - 2.2 Feedforward & Trajectory Tracking

## 🔜 Module 4 — From Simulator to Hardware

Reference: [Electrical & Control Wiring](04-electrical-and-control-wiring.md),
[Worked Design Example](05-design-worked-example.md)

- **Unit 1 — Electrical & Control Wiring**
    - 1.1 The Three Domains (Power, Signal, Control)
    - 1.2 Sensors & Valve Drivers
    - 1.3 The Closed-Loop Wiring & Safety Chain
- **Unit 2 — The Digital Twin**
    - 2.1 Logging & the Canonical Schema
    - 2.2 Grading Simulator and Hardware Identically

---

*The handbook chapters above are complete engineering references today; the
per-lesson Module 2–4 pages will follow Module 1's template, each with its own demo
and knowledge check.*
