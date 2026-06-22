# Course Roadmap

This course is built as a true sibling of a lesson-based curriculum: **Module →
Unit → Lesson**, each lesson with a reading, visuals, an interactive demo, a code
pointer, and a formative knowledge check.

**All four modules are now authored in full** — 23 lessons across kinematics,
hydraulics, control, and the hardware digital twin, each with visuals, an
interactive demo or code pointer, and a knowledge check. The [reference
handbook](handbook.md) and [interactive demos](demos/index.html) back them up.

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

## ✅ Module 2 — Hydraulic Actuation *(complete)*

Reference: [Hydraulic Design & Calculations](02-hydraulic-design.md) · demos:
[Cylinder Asymmetry](demos/cylinder-asymmetry.html), [Valve Flow Law](demos/orifice-flow.html)

- **Unit 1 — Cylinders & Asymmetry**
    - [1.1 The Hydraulic Cylinder](module02/1-1-the-hydraulic-cylinder.md)
    - [1.2 Area Asymmetry φ](module02/1-2-area-asymmetry.md) · demo
    - [1.3 Force and Speed](module02/1-3-force-and-speed.md)
- **Unit 2 — Valves, Flow & Pressure**
    - [2.1 The Valve Flow Law](module02/2-1-valve-flow-law.md) · demo
    - [2.2 Load Pressure & the Jacobian](module02/2-2-load-pressure.md)
    - [2.3 Pump & Relief Sizing](module02/2-3-pump-and-relief.md)

## ✅ Module 3 — Closed-Loop Control *(complete)*

Reference: [The Control System](03-control-system.md) · demo: [PID Tuning](demos/pid-tuning.html)

- **Unit 1 — The Feedback Loop**
    - [1.1 Why Feedback](module03/1-1-why-feedback.md)
    - [1.2 PID Control](module03/1-2-pid-control.md) · demo
    - [1.3 The Tuning Trade-off](module03/1-3-tuning-tradeoff.md) · demo
- **Unit 2 — Controlling a Parallel Machine**
    - [2.1 Joint-Space vs Task-Space](module03/2-1-joint-vs-task-space.md)
    - [2.2 Feedforward & Trajectory Tracking](module03/2-2-feedforward.md)

## ✅ Module 4 — From Simulator to Hardware *(complete)*

Reference: [Electrical & Control Wiring](04-electrical-and-control-wiring.md),
[Worked Design Example](05-design-worked-example.md)

- **Unit 1 — Electrical & Control Wiring**
    - [1.1 The Three Domains](module04/1-1-three-domains.md)
    - [1.2 Sensors & Valve Drivers](module04/1-2-sensors-and-drivers.md)
    - [1.3 The Closed-Loop Wiring & Safety Chain](module04/1-3-wiring-and-safety.md)
- **Unit 2 — The Digital Twin**
    - [2.1 Logging & the Canonical Schema](module04/2-1-logging-and-schema.md)
    - [2.2 Grading Simulator and Hardware Identically](module04/2-2-grading-sim-and-hardware.md)

---

*The [handbook chapters](handbook.md) are the continuous engineering reference; the
23 module lessons are the guided, step-by-step path. Together they cover the machine
from geometry to a hardware-ready digital twin.*
