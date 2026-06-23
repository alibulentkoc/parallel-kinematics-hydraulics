# Gate 5B — Module 3 Re-Audit (post-REVISE)

Control Twin lessons re-audited after the ALIGN pass. Criteria = compliant template **plus** H2
(Path A) and **H3 (Control Identity)**. The control concepts are preserved; the lessons are reframed
as fluid-power PWM control of the PKM, not generic control theory.

## Result: 5 / 5 PASS

| Lesson | Status |
|---|---|
| 1.1 Why Feedback | **PASS** |
| 1.2 PID Control (+ PWM on/off) | **PASS** |
| 1.3 The Tuning Trade-off | **PASS** |
| 2.1 Joint-Space vs Task-Space | **PASS** |
| 2.2 Feedforward & Trajectory Tracking | **PASS** |

## Per-check verification (all lessons)

| Check | Status |
|---|---|
| Header: `Control Twin · Competency · Artifact contribution · Milestone` | OK ×5 |
| Project relevance before theory | OK ×5 |
| Canonical figures at point of use (A7,A8,B7,B8,B9,B10) | OK ×5 |
| Equation provenance (`Source:`) | OK ×5 |
| Demo as instructional object (Observe → Interpret → Apply, Family 3) | OK ×5 |
| Verification: N3, referencing (not duplicating) the artifact acceptance test | OK ×5 |
| Assessment: Gate 5B Quiz 3 / Quiz 5 (per map) | OK ×5 |
| No old `m3-l*` quiz / `pid-tuning` demo / `assets/pid-loop` references | OK ×5 |
| No Unit framing | OK ×5 |
| **H2 — Path A:** PWM on/off primary; proportional benchmark only | **PASS ×5** |
| **H3 — Control Identity:** fluid-power PWM control of the PKM, not generic | **PASS ×5** |

## H3 Control Identity — evidence (before → after)

The pre-REVISE module was generic control theory: **PWM, on/off, and solenoid appeared 0 times** in
any lesson. After REVISE:

| Lesson | PWM | on/off | solenoid |
|---|---|---|---|
| 1.1 Why Feedback | 7 | 4 | 1 |
| 1.2 PID Control | 14 | 9 | 2 |
| 1.3 Tuning Trade-off | 8 | 3 | 1 |
| 2.1 Joint vs Task-Space | 5 | 2 | 1 |
| 2.2 Feedforward | 5 | 2 | 1 |

The identity is integrated, not bolted on: each lesson carries a **Control identity — Path A** note,
embeds the PWM/on-off figures (A7 waveform, A8 on/off control, B8 on/off-vs-PWM-vs-proportional step,
B7 duty, B9 tracking, B10 tuned), and its Observe→Interpret→Apply prompt drives the Family 3
PWM-control lab. The old generic feedback-loop graphic (`assets/pid-loop.svg`) is replaced by the
canonical **A8 on/off control** figure; the removed `pid-tuning` demo is repointed to **Family 3**.

## H2 Path-A — detail

Every lesson states the command `u` drives a **solenoid on/off DCV via PWM** as the primary path,
with a proportional valve only as a labelled benchmark. The PID "proportional/integral/derivative"
terms (the P/I/D of the controller) are retained — they are controller gains, not a proportional
valve, and are clearly distinct from the benchmark proportional-valve framing.

## Notes

- Control concepts (feedback, PID, tuning, task-space, feedforward) preserved as the *how*; Path A
  is the *implementation*. Lessons reference the acceptance test (Handbook Ch 4), never re-define it.
- Old per-lesson quizzes (`m3-l*.html`) remain on disk until all modules are de-referenced.

## Gate

Module 3 is at a clean **5/5 PASS** including H2 and H3 — the course identity (Fluid Power + Digital
Twin + PWM Control) holds. Clear to proceed to Module 4 REVISE.
