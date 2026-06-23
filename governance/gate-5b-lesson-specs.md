# Gate 5B — Content Production (1: Lesson Specifications)

Gate 5A complete; Gate 5B unlocked. Per your order, the first content stage is **lesson
specifications**, then demos → figures → quizzes → notebooks → handbook. A lesson
specification is **not the lesson** — it is the contract a lesson must satisfy, so the
written lesson cannot drift from the frozen architecture.

This document establishes the **specification format** and applies it to **Module 0** as the
template. On your sign-off of the format, I'll produce M1–M4 the same way before any prose is
written.

---

## Lesson-specification format (one per lesson)

Each spec carries exactly these fields:

- **ID / title**
- **Competency(ies)** — from the frozen C1–C16 map
- **Objective** — "after this, students can …"
- **Prerequisites** — prior lessons/artifacts required
- **Content outline** — the teaching beats (topics in order; not prose)
- **Artifact produced** — the deliverable, and which anchor it feeds
- **Simulator hooks** — engine features / demos the lesson uses
- **Assessment + threshold** — from the Gate 4 rubric / Gate 5A thresholds
- **Future Directions / Physical AI** — one-line connection (required per module rule)
- **Est. effort** — week placement

---

## Module 0 — The Machine & the Digital Twin  *(twin maturity: Observe)*

### Spec 0.1 — The PKM project & fluid-power system
- **Competency:** C1
- **Objective:** describe the machine and its subsystems, and how fluid power drives it.
- **Prerequisites:** none (course entry).
- **Content outline:** what a parallel-kinematics machine is; the 2-RPR → 3-RPR semester arc;
  fluid-power subsystems (power unit, cylinders, solenoid DCVs, sensors); why this is a
  *fluid-power* course with a robot as the vehicle.
- **Artifact:** system block diagram (→ all anchors).
- **Simulator hooks:** reference-machine viz (preset run, read-only).
- **Assessment + threshold:** brief check — all subsystems correctly identified.
- **Future Directions / Physical AI:** name the horizon — a fluid-powered robot that could
  later sense and learn; framed as where the course points, not a requirement.
- **Est. effort:** Week 1 (part).

### Spec 0.2 — Why a digital twin, and twin-first
- **Competency:** C1 (sets up C2–C4)
- **Objective:** run and read the reference twin; explain why we simulate before building.
- **Prerequisites:** 0.1.
- **Content outline:** what a digital twin is *at this stage* (Observe); inputs → outputs of
  the reference model; reading a run log; the twin-first safety/cost argument.
- **Artifact:** annotated observation log of a reference run (→ twin).
- **Simulator hooks:** run a preset; inspect telemetry (length, pressure, error channels).
- **Assessment + threshold:** observation check — correctly reads pose/pressure/error from a log.
- **Future Directions / Physical AI:** the twin as a future training ground for learned control.
- **Est. effort:** Week 1 (part).

### Spec 0.3 — Proposal & architecture sketch
- **Competency:** C1
- **Objective:** scope the build and commit to a machine architecture.
- **Prerequisites:** 0.1, 0.2.
- **Content outline:** the proposal template; subsystem choices; the kit (power pack,
  cylinders, **solenoid DCVs**); naming risks; the 15-week artifact roadmap.
- **Artifact:** **Project proposal + architecture sketch** (→ all anchors) — the M0 deliverable.
- **Simulator hooks:** none (planning).
- **Assessment + threshold:** **proposal rubric** — subsystems present, scope feasible (pass/revise).
- **Future Directions / Physical AI:** a one-paragraph "where could this go" section students
  carry forward and revisit at M4.
- **Est. effort:** Week 1.

---

## What I need from you

**Sign off on the specification format** (the field set above), or adjust it. On your nod I'll
produce **M1–M4** lesson specs (the remaining 22 lessons) in this exact format, then move to
the next 5B stage (demos). No prose lessons are written until the full spec set is approved.
