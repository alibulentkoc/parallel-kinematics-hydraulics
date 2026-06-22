# Module 1 — Kinematics: How the Machine Knows Where It Is

This module is the geometric foundation of everything that follows. Before we can
control a hydraulic platform or diagnose why it misbehaves, we have to answer two
questions precisely: **given where I want the platform, how long must each cylinder
be?** and **given the cylinder lengths I can measure, where actually is the
platform?** Those are inverse and forward kinematics, and they lead directly to the
Jacobian, manipulability, and the singularities that make parallel machines both
powerful and tricky.

## What you'll be able to do

- Explain what makes a machine *parallel* and why that changes the math.
- Compute the leg lengths for any platform pose (inverse kinematics).
- Recover the platform pose from leg lengths (forward kinematics).
- Decide whether a target is reachable, and why some aren't.
- Read the Jacobian as the bridge between platform motion and leg motion.
- Predict where the machine loses dexterity — its singularities.

## Lessons

**Unit 1 — The Parallel Machine**

- [1.1 What Is a Parallel Kinematics Machine?](1-1-what-is-a-pkm.md)
- [1.2 The 2-RPR Geometry & Pose](1-2-geometry-and-pose.md)

**Unit 2 — Solving the Motion**

- [2.1 Inverse Kinematics — Pose to Leg Lengths](2-1-inverse-kinematics.md) · interactive
- [2.2 Forward Kinematics — Leg Lengths to Pose](2-2-forward-kinematics.md)
- [2.3 Reachability & the Workspace](2-3-reachability.md)

**Unit 3 — Differential Motion**

- [3.1 The Jacobian & Manipulability](3-1-jacobian.md) · interactive
- [3.2 Singularities](3-2-singularities.md) · interactive

---

*Start with [Lesson 1.1](1-1-what-is-a-pkm.md).*
