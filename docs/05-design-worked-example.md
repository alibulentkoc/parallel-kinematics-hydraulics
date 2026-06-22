# 5 · Worked Design Example

This document walks one complete design from a blank-page specification to chosen
hardware, pulling together the kinematics, hydraulics, control, and wiring of
Documents 1–4. At each step it cross-checks against the simulator's defaults so
you can immediately try your design in the tool.

---

## 5.1 The specification

> **Design a planar 2-DOF electrohydraulic positioner** that places a **200 kg**
> payload anywhere in a **roughly 0.6 m × 0.4 m** working area, at speeds up to
> **0.15 m/s**, settling to within **±2 mm**, with safe handling of unreachable
> commands and singular poses.

Everything below flows from these four numbers: load, workspace, speed, accuracy.

---

## 5.2 Step 1 — Geometry (Document 1)

Choose the base spacing and stroke so the **working area sits in the dexterous
region**, away from the `y = 0` singularity.

- **Base half-spacing `b = 0.6 m`** (1.2 m between anchors). Wide enough that the
  legs meet the platform at healthy angles across the workspace.
- **Cylinder stroke 0.6 m, closed length 0.4 m** → leg length range **0.4–1.0 m**.
- **Centre the workspace around `y ≈ 0.7 m`.** From [§1.8](01-kinematics-and-motion.md#18-worked-example--locating-the-platform-and-moving-the-cylinders),
  at `(0, 0.7)` each leg is 0.922 m (mid-stroke ✓) and manipulability is high
  (`w ≈ 0.99`). Keeping the work area near here keeps you far from singularities.

**Check the corners with IK.** Compute leg lengths at the four corners of the
0.6 × 0.4 box around `(0, 0.7)` and confirm all stay within 0.4–1.0 m and that `w`
never drops near zero. (The instructor console's validation checklist does exactly
this sweep automatically.)

✅ *Matches the `baseline_2dof` preset geometry.*

---

## 5.3 Step 2 — Cylinder sizing (Document 2)

**Force.** Worst-case per-cylinder force from the 200 kg payload plus dynamic and
orientation factors: budget ~3 kN.

**Working pressure.** Choose `p = 16 MPa` (160 bar) — a standard, compact level.

**Bore.** Need `A_cap ≥ F/p = 3000 / 16e6 = 1.9 × 10⁻⁴ m²` → `D ≥ 15.5 mm`.
Select **D = 40 mm** for generous margin: at 16 MPa it produces 20 kN (vs the 3 kN
needed), leaving headroom for acceleration and the pressure spikes that occur near
singular poses.

**Rod.** Pick **d = 22 mm**, giving area asymmetry:

```
φ = A_cap / A_rod = 1257 / 877 = 1.43
```

The rod must also resist buckling under compressive load over the 0.6 m stroke;
22 mm is comfortable here. Note the design consequence: this cylinder will
**retract 1.43× faster** and **push 1.43× harder than it pulls** — the controller
must cope with both.

✅ *Matches the default cylinder (40 mm bore, 22 mm rod).*

---

## 5.4 Step 3 — Flow, pump, relief (Document 2)

**Flow per cylinder for target speed.** To extend at 0.15 m/s:

```
Q = v · A_cap = 0.15 · 1.257e−3 = 1.9 × 10⁻⁴ m³/s ≈ 11 L/min
```

Round up the valve rating to **15 L/min** so the valve isn't the bottleneck.

**Pump.** Worst case both cylinders move fast at once → ~30 L/min. Size the pump
at **36 L/min (6 × 10⁻⁴ m³/s)** for margin. (Add a gas accumulator if you need
brief bursts above this.)

**Hydraulic power → motor.** `P_hyd = p · Q = 16e6 · 6e−4 = 9.6 kW`; with ~80%
pump+motor efficiency choose a **~12 kW motor** ([Wiring §4.2](04-electrical-and-control-wiring.md#42-power-distribution)).

**Relief.** Set at **21 MPa** — above the 16 MPa working pressure (no nuisance
tripping) and safely below component burst ratings.

✅ *Matches defaults: 15 L/min rated flow, 36 L/min pump, 21 MPa relief.*

---

## 5.5 Step 4 — Sensors for the accuracy target (Document 4)

The ±2 mm requirement sets the **position transducer** spec. Over a 0.6 m stroke,
2 mm is 1 part in 300, so even a modest transducer clears it — but choose with
margin:

- **Magnetostrictive linear transducer**, ~0.01 mm resolution, SSI or 0–10 V
  output, mounted inside each cylinder. Resolution far finer than 2 mm leaves room
  for filtering and control error.
- **Pressure transducers**, 4–20 mA, 0–25 MPa range (above the 21 MPa relief), on
  each line for load monitoring and over-pressure detection.

The transducer resolution, not the controller, is usually the floor on achievable
accuracy — so spend here.

---

## 5.6 Step 5 — Valve and driver (Documents 2 & 4)

- **Proportional directional valve** per axis, **15 L/min** rated at the expected
  valve pressure drop, with **on-board electronics** accepting a ±10 V command.
- Command mapping `u = +1 → +10 V` (extend), `u = −1 → −10 V` (retract).
- For a budget teaching rig, a PWM-driven solenoid valve is a cheaper stand-in
  (the `pwm` model) — coarser, but it teaches the same loop.

---

## 5.7 Step 6 — Controller and loop rate (Document 3)

- **Real-time controller / PLC** with per axis: 2 analog inputs (position,
  pressure), 1 analog output (valve), plus digital I/O for limits and the E-stop
  status.
- **Loop rate 1 kHz.** Fast enough that the hydraulic position loop behaves like
  the continuous ideal and well above the mechanical bandwidth of the cylinders.
- **Control law:** joint-space PID per cylinder to start (robust, simple), with
  IK converting the operator's pose target into per-leg setpoints. Move to
  task-space + feedforward once point positioning is solid and you want better
  path tracking.

**Tuning** follows the [§3.7 procedure](03-control-system.md#37-a-practical-tuning-procedure):
raise Kp to the edge of overshoot, add Kd to damp, a touch of Ki for any sag, then
re-verify across the workspace.

---

## 5.8 Step 7 — Safety (Document 4)

- Hard-wired **E-stop loop** dropping the motor contactor and venting valves.
- **Relief valve** at 21 MPa (mechanical, always active).
- **Pressure switches** and **limit switches** wired into the E-stop loop,
  independent of the analog sensors.
- **Fail-safe valves**: loss of power → safe (blocked/vented), never an
  uncommanded move.

---

## 5.9 The finished design, at a glance

| Parameter | Value | Source |
|-----------|-------|--------|
| Configuration | planar 2-DOF, 2-RPR | Doc 1 |
| Base half-spacing `b` | 0.6 m | Doc 1 |
| Cylinder bore / rod | 40 mm / 22 mm | Doc 2 |
| Stroke / closed length | 0.6 m / 0.4 m | Doc 1 |
| Area asymmetry `φ` | 1.43 | Doc 2 |
| Working pressure / relief | 16 MPa / 21 MPa | Doc 2 |
| Rated valve flow | 15 L/min | Doc 2 |
| Pump flow / motor | 36 L/min / ~12 kW | Doc 2, Doc 4 |
| Max cylinder speed (ext/ret) | 0.20 / 0.28 m/s | Doc 2 |
| Max cylinder force (ext/ret) | 20.1 / 14.0 kN | Doc 2 |
| Position transducer | magnetostrictive, ~0.01 mm | Doc 4 |
| Controller rate | 1 kHz | Doc 3 |
| Control law | joint-space PID (+ FF later) | Doc 3 |

**Now try it.** Open the **Instructor Console**, load `baseline_2dof`, and these
are the numbers you're driving. Change one — drop the pump to 18 L/min, or shrink
the rod to raise φ — and watch the design consequence appear immediately. That
loop between calculation and observation is exactly what makes this a learning
tool rather than a black box.

---

**Back to:** [Course home](index.md) · [Roadmap](roadmap.md)
