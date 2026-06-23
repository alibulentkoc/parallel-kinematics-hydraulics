# Module 4 — From Simulator to Hardware: The Digital Twin

The simulator computes commands and reads sensors as clean numbers. A real machine
has to carry those numbers as actual voltages and currents through real wires, detect
its own faults, and record everything it did. This final module maps every simulator
signal to the hardware that would carry it — across the three domains of power,
signal, and control — wraps the loop in a safety chain, and shows how one canonical
log and one grader make "it works in simulation" mean "it works on the machine."

!!! warning "Scope"
    The electrical and wiring content here is descriptive engineering to build
    intuition, **not** a certified schematic. Real machines require qualified
    engineers and standards compliance.

## What you'll be able to do

- Map each simulator signal to its hardware domain: control, signal, or power.
- Explain what a position sensor and a valve driver do, and their scaling.
- Describe a safety chain and why it must be independent of the controller.
- Explain why a canonical log schema lets sim and hardware share one set of tools.
- Show how one grader and rubric score simulator and hardware runs identically.

## Lessons

**Unit 1 — Electrical & Control Wiring**

- [1.1 The Three Domains](1-1-three-domains.md)

**Unit 2 — The Digital Twin**

- [2.1 Logging & the Canonical Schema](2-1-logging-and-schema.md)
- [2.2 Grading Simulator and Hardware Identically](2-2-grading-sim-and-hardware.md)

---

*Start with [Lesson 1.1](1-1-three-domains.md).*
