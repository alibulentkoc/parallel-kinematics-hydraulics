# PKM Testbed — Engineering Handbook

This `docs/` folder is the deep reference behind the simulator. Where
[`../TUTORIAL.md`](../TUTORIAL.md) teaches you to *use* the tool, this handbook
explains the engineering *underneath* it — the kind of detail you'd need to
understand, design, or actually build an electrohydraulic parallel kinematics
machine.

Read in order, or jump to what you need.

> ▶ **[Interactive demos](demos/index.html)** — self-contained SVG explorers for
> kinematics, cylinder asymmetry, the valve flow law, and PID tuning. Each one is
> linked from the chapter it belongs to, and runs straight from the page (no
> install).

| # | Document | What it covers |
|---|----------|----------------|
| 1 | [Kinematics & the Math of Motion](01-kinematics-and-motion.md) | How platform position is determined and turned into cylinder lengths: inverse/forward kinematics, the Jacobian, velocity & force relationships, manipulability, and singularities. With full derivations and a worked "locate-and-move" example. |
| 2 | [Hydraulic Design & Calculations](02-hydraulic-design.md) | Cylinder areas and the asymmetry ratio φ, force and speed, the orifice flow equation, pump and relief sizing, load pressure, and a worked cylinder/pump sizing example. |
| 3 | [The Control System](03-control-system.md) | The closed loop: PID with derivative-on-measurement and anti-windup, joint-space vs task-space control, feedforward, discretization, and a tuning procedure. |
| 4 | [Electrical & Control Wiring](04-electrical-and-control-wiring.md) | How the abstract simulator maps to real hardware: power distribution, position & pressure sensors, proportional/on-off valve drivers, controller I/O, signal conditioning, the closed-loop wiring, the safety chain, and a full I/O map. |
| 5 | [Worked Design Example](05-design-worked-example.md) | An end-to-end design: from a payload/workspace/speed spec to chosen geometry, cylinder bore, pump, valves, sensors, and controller rate — cross-checked against the simulator's defaults. |

## Notation used throughout

```
P, q        platform pose. 2-DOF: P = (x, y). 3-DOF: q = (x, y, θ)
B_i         base anchor of leg i (fixed to ground)
p_i         platform attachment point of leg i, in the platform's body frame
L_i         length of leg i (the hydraulic cylinder)
s_i         piston stroke of leg i (L_i minus the cylinder's closed length)
û_i         unit vector pointing along leg i, from anchor to platform
J           the Jacobian: maps platform motion to leg-length rates  (L̇ = J · q̇)
w           manipulability (a scalar; 0 at a singularity)
A_cap,A_rod cap-side and rod-side piston areas
φ           area asymmetry = A_cap / A_rod  (always > 1)
Q           volumetric oil flow rate
u           valve command, −1 … +1  (the controller's output)
p_i (press.) hydraulic load pressure in leg i
```

## How the math connects to the code

Every equation in this handbook is implemented and tested in the repository.
The mapping:

| Topic | Source | Tests |
|-------|--------|-------|
| Vectors, matrices, solve, det/inverse | `src/math/` | `test/math.test.js` |
| IK / FK / Jacobian / manipulability | `src/kinematics/` | `test/kinematics.test.js` |
| Areas, flow, pressure, pump, relief | `src/hydraulics/` | `test/hydraulics.test.js` |
| PID, joint/task space, feedforward | `src/control/` | `test/controller.test.js` |

So if you want to see any formula "in action," open the matching test — each
assertion states exactly what the code guarantees.
