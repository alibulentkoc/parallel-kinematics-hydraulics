# Module 3 — Closed-Loop Control: How the Machine Stays on Target

We can compute the leg lengths (Module 1) and the forces and flows (Module 2). But
the real world never does exactly what you command — friction, leaks, loads, and the
valve's nonlinearity all push the platform off target. This module is about *closing
the loop*: measuring what actually happened and correcting it. We build up the PID
controller term by term, confront the fast-versus-stable tuning trade-off, and learn
the two ways to control a whole parallel machine — then add feedforward to track a
moving target.

## What you'll be able to do

- Explain the difference between open-loop and closed-loop control.
- Describe what each PID term (P, I, D) does and its failure mode.
- Judge a step response by rise time, overshoot, settling time, and steady-state error.
- Navigate the trade-off between fast response and low overshoot.
- Choose between joint-space and task-space control for a parallel machine.
- Add feedforward to track a trajectory with minimal lag.

## Lessons

**Unit 1 — The Feedback Loop**

- [1.1 Why Feedback](1-1-why-feedback.md)
- [1.2 PID Control](1-2-pid-control.md) · interactive
- [1.3 The Tuning Trade-off](1-3-tuning-tradeoff.md) · interactive

**Unit 2 — Controlling a Parallel Machine**

- [2.1 Joint-Space vs Task-Space](2-1-joint-vs-task-space.md)
- [2.2 Feedforward & Trajectory Tracking](2-2-feedforward.md)

---

*Start with [Lesson 1.1](1-1-why-feedback.md).*
