# Tutorial — Learning Electrohydraulic Parallel Kinematics with the PKM Testbed

This is a self-guided course. You don't need an instructor, a textbook, or any
hardware — just a browser. Work through it top to bottom and you'll learn how a
hydraulically driven parallel robot moves, why it sometimes *can't* move, how to
control it, and how to read the signals an engineer would watch on a real rig.

Each lesson follows the same rhythm:

> **Concept** — the idea, in plain language.
> **Try it** — exactly what to click.
> **Observe** — what to watch on screen.
> **Why** — the physics behind what you saw.
> **Check yourself** — a question to confirm you got it.

Total time: about 60–90 minutes for the full path. You can stop after any lesson.

---

## 0. Setup (2 minutes)

The simulator is plain HTML/JavaScript with no install step, but browsers block
the way it loads its code when you open a file directly (`file://`). So serve the
folder with any tiny web server:

```bash
# from inside the project folder:
npx serve            # if you have Node.js
# or
python3 -m http.server   # if you have Python
```

Then open the address it prints (usually `http://localhost:3000` or `:8000`) and
click **`index.html`**. You'll see four apps:

| App | Who it's for | What it does |
|-----|--------------|--------------|
| **Student Workbench** | learners | guided assignments, tune and submit |
| **Instructor Console** | teachers | full control, fault injection, answer keys |
| **Grading Console** | TAs | score a submission against a rubric |
| **Visualization Demo** | anyone | a sandbox with no objectives |

For the lessons below, start with the **Student Workbench**.

---

## 1. Reading the workspace (5 minutes)

Before doing anything, learn to read the picture. The big panel is a **top-down
view of a planar robot**. A moving platform (the "node") is held up by hydraulic
cylinders ("legs") anchored to the ground.

Here is what every element means:

- **Grey triangles** at the bottom — the fixed **base anchors** where the
  cylinders attach to the ground.
- **Thick colored bars** — the **cylinder legs**. Their color is the **load
  pressure** in that leg: blue = low, red = near the relief limit. Watch these;
  pressure is invisible on real machines and this is your X-ray view.
- **Dashed cyan shape** — the **commanded** pose (where you've told it to go).
- **Solid green dot/shape** — the **actual** pose (where it really is). The gap
  between cyan and green is your tracking error.
- **Crosshair circle** — the **target handle**. Its color is a traffic light:
  **green = safely reachable**, **amber = near a singularity** (control is
  getting fragile), **red = unreachable** (outside the workspace).
- **Faint background wash** — the **manipulability heatmap**. Bright = the robot
  is dexterous there; dark = it's losing the ability to move in some direction.
  You'll learn to predict the dark zones in Lesson 7.
- **Top-left bars** — **stroke gauges**, one per cylinder, showing how far each
  piston is extended. They turn red at the end of travel.
- **Bottom-right** — a **20 cm scale bar**.

> **Check yourself:** Which color tells you a leg is close to its pressure limit?
> (Answer: red.)

---

## 2. Lesson 1 — Making it move (point positioning)

**Concept.** A *parallel* robot is the opposite of a robot arm. An arm stacks
joints in a chain; here, several legs all connect the ground to one platform at
once. To move the platform, the controller has to change *all* the leg lengths in
a coordinated way. Figuring out "what leg lengths put the platform *there*" is
**inverse kinematics (IK)**; figuring out "where is the platform, given these leg
lengths" is **forward kinematics (FK)**.

**Try it.**
1. In the Workbench, the assignment dropdown should show **`[M] M1 — Point
   positioning`**. Leave it there.
2. Press **Recenter** so the platform sits at home.
3. Under **Target**, type `x = 0.14`, `y = 0.58`, and press Enter — or just
   **drag the crosshair** anywhere green in the workspace.

**Observe.** The green platform chases the cyan target. The two leg bars change
length and color as they push and pull. The **Pose error** chart at the bottom
spikes, then decays toward zero.

**Why.** When you set a target, the controller runs IK to find the leg lengths
that reach it, then commands the hydraulic valves to drive each cylinder toward
its target length. The platform converges because the controller keeps correcting
the difference between commanded and actual leg lengths.

> **Check yourself:** Drag the target slowly toward the very bottom of the screen.
> At some point the crosshair turns **red**. What does red mean, and why can't the
> robot follow it there? (It's unreachable — the legs can't get short or long
> enough to place the platform outside their stroke range.)

---

## 3. Lesson 2 — Why retracting is faster than extending (area asymmetry)

**Concept.** A hydraulic cylinder is not symmetric. On one side the piston has a
rod sticking through it, so that side has **less area** for oil to push on. Same
oil flow, smaller area → faster motion. The ratio of the two areas is called
**φ (phi)**, the *area asymmetry*:

```
A_cap = π·D²/4            (full bore — the side without the rod)
A_rod = π·(D² − d²)/4     (rod side — area lost to the rod of diameter d)
φ      = A_cap / A_rod    (always > 1)
```

This is one of the most important "gotchas" in hydraulic motion: a cylinder
**extends and retracts at different speeds for the same valve command.**

**Try it.** This phenomenon is strongest in a special preset, so switch apps for a
moment: open the **Instructor Console**, and from the preset dropdown choose
**`Area asymmetry (2-DOF)`**. Drag the target up (extend the legs), let it settle,
then drag it back down (retract).

**Observe.** Retraction is noticeably brisker than extension. With default tuning
you may see the platform *overshoot* on the way back down — the controller was
tuned for the slower extend direction and the fast retract direction outruns it.

**Why.** φ ≈ 2.3 in this preset, meaning the rod side moves more than twice as
fast per unit of oil. A controller that doesn't account for this will behave
differently depending on travel direction.

> **Check yourself:** If a cylinder's bore is 40 mm and its rod is 30 mm, is φ
> closer to 1.1 or 2.3? (Work it out: A_cap ∝ 40² = 1600, A_rod ∝ 40²−30² = 700,
> φ = 1600/700 ≈ 2.3.)

---

## 4. Lesson 3 — Tuning a controller (the gain trade-off)

**Concept.** The controller is a **PID** loop. The main knob is **Kp**
(proportional gain): how hard it pushes when there's an error. More Kp = faster
response, but too much causes **overshoot** and oscillation. **Kd** (derivative
gain) adds damping to calm overshoot. Real tuning is a balance, not a single
"best" number.

**Try it.** Back in the **Student Workbench**, choose assignment **`M3 — Tuning
trade-off`**.
1. Set **Kp** low (say `10`). Press **Run submission**.
2. Look at the self-check: it probably fails *"Settling time < 1.3 s"* — too slow.
3. Raise **Kp** to `120`. Run submission again.
4. Now it probably fails *"Overshoot < 20%"* — too aggressive.
5. Find a middle value (try `40`–`60`), and add a little **Kd** (`0.05`) to tame
   the overshoot. Run until **both** checks pass.

**Observe.** The **Pose error** chart tells the story: low Kp → a slow, lazy
decay; high Kp → a sharp drop that swings past zero and rings; good tuning → a
quick drop that settles without ringing.

**Why.** This is the core control trade-off. The assignment deliberately demands
*fast settling AND low overshoot at the same time*, which you can only satisfy in
a narrow band of gains — exactly the lesson.

> **Check yourself:** Which gain would you increase to reduce overshoot without
> making the response slower? (Kd — it adds damping.)

---

## 5. Lesson 4 — Limits and faults (when the machine says no)

**Concept.** Real machines hit limits, and a good operator recognizes the
symptoms. This tool models the important ones and flags them with a severity
(warn → limit → fault). You'll meet:

- **Unreachable** — target outside the workspace.
- **Stroke end** — a cylinder hit the end of its travel.
- **Pump saturation** — you demanded more oil flow than the pump can supply.
- **Over-pressure** — the load needs more pressure than the relief valve allows;
  the relief opens and motion sags.
- **Near-singular / singular** — the geometry is losing a degree of freedom
  (Lesson 7).

**Try it — unreachable.** In the Workbench, choose **`M2 — Workspace limits`** and
press **Run submission**. The assignment commands a target far above the reachable
zone on purpose.

**Observe.** The status pill turns to a **LIMIT**-level fault, the crosshair is
**red**, and the platform stops at the boundary instead of flying off or producing
nonsense. The self-check confirms *"Target flagged unreachable"* and *"State stays
finite (no NaN)"* — meaning the math stayed sane.

**Try it — pump starvation.** Open the **Instructor Console**, load the
**`Flow starvation (2-DOF)`** preset, and drag the target in a big fast move.

**Observe.** A **PUMP_SATURATED** fault appears and *both* legs slow down together
— they're sharing one undersized pump and can't both have full flow.

**Why.** All cylinders draw from a single pump. When the sum of their flow demands
exceeds the pump's capacity, the controller can't deliver the commanded speeds and
everything decelerates proportionally. This is why pump sizing matters.

> **Check yourself:** If only one leg needs to move fast, will the pump saturate?
> (Usually no — saturation comes from the *combined* demand of all legs.)

---

## 6. Lesson 5 — Going 3-DOF (position *and* orientation)

**Concept.** So far the platform could only move in x and y. A 3-DOF parallel
machine adds **orientation (θ)** — the platform can also *rotate*. Now the
controller juggles three coordinates at once, and you can choose *how* it thinks:

- **Joint-space control** — the controller targets individual leg lengths.
- **Task-space control** — the controller targets the pose (x, y, θ) directly,
  using the **Jacobian** to translate pose errors into leg commands.

**Try it.** In the Workbench, choose **`F1 — Pose + orientation`**. Set the
**mode** to `joint-space`, raise **Kp** to ~50, and **Run submission**. Then watch
the third row of the **Pose** table — that's **θ** (theta), the platform angle,
converging along with x and y.

Now switch **mode** to `task-space` and run again. Compare how the two strategies
track the same target.

**Observe.** Both can reach the target, but they distribute the work differently.
The pose table shows all three axes (x, y, θ) settling. Try **`F2 — Orientation
sweep`**, which holds position and only rotates — proof that orientation is an
independent, controllable degree of freedom.

**Why.** With three legs and three coordinates, the **Jacobian** matrix is the
dictionary between "how the platform moves" and "how each leg must change." Task
-space control uses it directly; joint-space control reaches the same place by a
different route.

> **Check yourself:** What does the θ column in the pose table represent? (The
> platform's rotation angle.)

---

## 7. Lesson 6 — Following a path (trajectory tracking)

**Concept.** Holding a point is easy; smoothly following a *moving* target is
harder, because the controller is always chasing. **Feedforward** helps: instead
of only reacting to error, the controller also *predicts* the motion it knows is
coming.

**Try it.** Choose **`F3 — Trajectory tracking`**. The target now traces a circle.
1. Run submission with **feedforward off**. Note the mean error in the self-check.
2. Turn **feedforward on** (the checkbox), raise **Kp**, and run again.

**Observe.** With feedforward off, the actual path **lags** the commanded circle —
the green shape trails the cyan one. With feedforward on, the lag shrinks and the
two circles nearly overlap.

**Why.** Pure feedback always lags a moving target because it only acts *after* an
error appears. Feedforward injects the expected command in advance, so feedback
only has to clean up the small remaining error.

> **Check yourself:** Why does a feedback-only controller lag a moving target?
> (It can only respond *after* an error has already built up.)

---

## 8. Lesson 7 — Singularities (the deepest idea here)

**Concept.** A **singularity** is a pose where the robot momentarily *loses a
degree of freedom* — no matter how you drive the legs, the platform can't move in
some direction (or needs near-infinite force to do so). **Manipulability (w)** is
a single number that measures how far you are from one: high = healthy, zero =
singular. This is the most important concept in parallel kinematics, and the tool
makes it visible.

For the 2-DOF machine there's a clean formula:

```
det(J) = 2·b·y / (L1·L2)
```

where `b` is the half-spacing of the base and `y` is the platform height. As the
platform approaches the **base line** (`y → 0`), `det(J) → 0` — that's the
singularity. The dark band along the bottom of the manipulability heatmap is
exactly this region.

**Try it — see it in 2-DOF.** In the Workbench, go back to **`M1`** and slowly
drag the target straight down toward the base line. Watch the **`w`** value in the
status bar shrink, the crosshair turn **amber**, and the heatmap go dark.

**Try it — feel it in 3-DOF.** Choose **`F4 — Find a singularity`**. This loads a
*deliberately broken* geometry (a symmetric "diamond") that is singular whenever
the platform angle θ = 0. Command θ = 0 and **Run submission**.

**Observe.** The manipulability `w` collapses toward zero and a **SINGULAR** fault
fires. If you nudge θ slightly away from 0, the robot recovers — proving the
singularity is tied to that exact configuration.

**Why.** At a singularity the leg directions line up such that they can no longer
independently control every direction of platform motion. The Jacobian becomes
non-invertible (its determinant hits zero), and the controller "loses" an axis.
Engineers design geometries to keep the working area *away* from these poses — and
this preset shows what happens when they don't.

> **Check yourself:** For the 2-DOF machine, near which line does manipulability
> drop to zero? (The base line, y = 0.)

---

## 9. The instructor side (optional, 10 minutes)

Open the **Instructor Console** to see the machine from the teacher's chair. You
have everything the student doesn't:

- **Presets** — eight ready-made teaching scenarios in the dropdown. Each one is
  built to expose a single phenomenon (asymmetry, weak pump, on/off valve, low
  relief, near-singular, the singular diamond, etc.).
- **Live parameters** — edit geometry, pressures, gains, and fault thresholds and
  watch the effect immediately. (Changing a *dimension* rebuilds the machine;
  changing a *gain or pressure* applies on the fly.)
- **Fault injection** — deliberately break things: derate the pump, spike the
  payload, jam a valve, drop the relief setting. This is how you create a "what's
  wrong with this machine?" diagnostic exercise.
- **Validation checklist** — press **Run** and the tool tests *itself* against the
  current configuration (IK/FK round-trip, singularity detection, pump headroom,
  and so on). It's a live demonstration that the physics is self-consistent.
- **Answer key** — record a reference run, then import a student's log to see how
  far they deviated.

Try this mini-exercise: load **`Solenoid on/off (2-DOF)`** and compare its valve
behavior to the smooth **`Baseline`**. The on/off valve can only slam fully open
or closed, so it parks coarsely within a deadband instead of settling precisely —
the classic difference between cheap on/off and expensive proportional valves.

---

## 10. The grading workflow (optional, 5 minutes)

Every assignment can produce a **submission file**. In the Workbench, press
**Run submission** then **Download submission** — you'll get a `.json` log.

Open the **Grading Console**, load that file, and press **Grade**. You'll see a
scored report: each rubric criterion with partial credit, the overall percentage
and letter grade, the measured metrics, and any faults that were demonstrated.

The interesting part: the grader reads a **canonical data format**, so it scores a
log from this simulator and a log from a *real hydraulic rig* through the exact
same path. That's the "digital twin" idea — the same analysis works on simulated
and physical data.

---

## 11. Physics quick reference

Keep this handy; it's everything the lessons used.

**Kinematics (2-DOF, two cylinders):**
```
Base anchors:   B1 = (−b, 0),  B2 = (+b, 0)
Leg length:     L_i = distance(platform, B_i)        ← inverse kinematics
Platform x:     x = (L1² − L2²) / (4b)                ← forward kinematics
Platform y:     y = √(L1² − (x + b)²)
Singularity:    det(J) = 2·b·y / (L1·L2) → 0 as y → 0
```

**Hydraulics:**
```
Cap-side area:  A_cap = π·D²/4
Rod-side area:  A_rod = π·(D² − d²)/4
Asymmetry:      φ = A_cap / A_rod                      (> 1 always)
Valve flow:     Q = u · Q_rated · √(ΔP / ΔP_rated)     (u = valve command, −1..1)
Pump limit:     Σ Q_i ≤ pump capacity  → else PUMP_SATURATED
Over-pressure:  load pressure > relief setting → relief opens
```

**Control:**
```
PID:            command = Kp·error + Ki·∫error + Kd·d(measurement)/dt
Anti-windup:    the integral term is clamped so it can't "wind up" during saturation
Joint-space:    controller targets leg lengths
Task-space:     controller targets pose (x, y, θ) via the Jacobian
Feedforward:    adds the predicted command for a moving target, reducing lag
```

---

## 12. Glossary

- **DOF (degree of freedom)** — an independent way the platform can move. 2-DOF =
  x, y. 3-DOF = x, y, θ.
- **Inverse kinematics (IK)** — pose → leg lengths.
- **Forward kinematics (FK)** — leg lengths → pose.
- **Jacobian** — the matrix relating leg-length changes to platform motion.
- **Manipulability (w)** — how dexterous the robot is at a pose; 0 = singular.
- **Singularity** — a pose where a degree of freedom is lost.
- **φ (area asymmetry)** — cap-area ÷ rod-area; why extend ≠ retract speed.
- **Relief valve** — a pressure safety cap; opens to dump flow above a setpoint.
- **Pump saturation** — total flow demand exceeds pump capacity.
- **Proportional vs on/off valve** — smooth, continuous control vs slam-open/closed.
- **Digital twin** — the same data format/analysis for simulated and real machines.

---

## 13. Troubleshooting

- **A page is blank when opened directly.** You opened it as a `file://` path.
  Serve the folder (`npx serve` or `python3 -m http.server`) and use the
  `http://localhost` address instead.
- **The crosshair is red and nothing moves.** The target is unreachable. Drag it
  back into the green zone.
- **The platform overshoots and oscillates.** Kp is too high — lower it or add Kd.
- **Motion is sluggish and the legs go red.** You may be over-pressured or
  pump-saturated; reduce the payload, speed, or relief pressure (Instructor
  Console), or check the active-faults panel.
- **Everything looks dark / stuck near the bottom.** You're near a singularity.
  Raise the target (more y) to return to a dexterous region.

---

## Where to go next

You've now touched every idea the testbed teaches: parallel kinematics, the
hydraulic peculiarities of real cylinders, PID tuning, fault diagnosis,
trajectory tracking, and singularities. To go deeper:

- **Read the [engineering handbook](docs/handbook.md)** for the full theory behind
  what you just did: the [mathematics of motion](docs/01-kinematics-and-motion.md)
  (derivations + worked examples), [hydraulic design calculations](docs/02-hydraulic-design.md),
  the [control system](docs/03-control-system.md), the [electrical & control
  wiring](docs/04-electrical-and-control-wiring.md) that maps the simulator to real
  hardware, and a [complete worked design](docs/05-design-worked-example.md).
- Re-run each assignment and try to make the self-check pass with the *fewest*
  changes — it forces you to reason about cause and effect.
- In the Instructor Console, invent a "broken machine" with fault injection and
  see if a friend can diagnose it from the workspace view alone.
- Read `src/` if you're curious how the physics is implemented — every module has
  a matching test in `test/` that documents exactly what it guarantees.

Happy experimenting.
