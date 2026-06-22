# 2 · Hydraulic Design & Calculations

[Document 1](01-kinematics-and-motion.md) ended with a leg that needs to extend
68 mm. This document is about *making that happen with oil*: how much force a
cylinder produces, how fast it moves, how much flow that costs, and how to size
the pump, valves, and relief to deliver it. These are the calculations you'd do on
paper before ordering parts.

---

## 2.1 The cylinder is not symmetric

A hydraulic cylinder has a piston inside a bore of diameter **D**. A **rod** of
diameter **d** sticks out one side. That rod steals area from the rod side, so the
two faces of the piston have **different areas**:

```
Cap-side area (no rod):   A_cap = π · D² / 4
Rod-side area (rod here): A_rod = π · (D² − d²) / 4
```

Push oil into the cap side and the cylinder **extends**; push it into the rod side
and it **retracts**. Because `A_rod < A_cap`, the two directions behave
differently — this single fact drives much of hydraulic system behaviour.

The ratio is the **area asymmetry φ**:

```
φ = A_cap / A_rod  > 1   (always)
```

**Worked numbers (simulator defaults: D = 40 mm, d = 22 mm):**

```
A_cap = π · (0.040)² / 4              = 1.257 × 10⁻³ m²   (1257 mm²)
A_rod = π · (0.040² − 0.022²) / 4     = 8.77 × 10⁻⁴ m²   (877 mm²)
φ     = 1257 / 877                    = 1.43
```

(The test `hydraulics.test.js` asserts "asymmetry ~ 1.43" against exactly this.)

> ▶ **Interactive:** [**Cylinder Asymmetry**](demos/cylinder-asymmetry.html) — drag
> bore and rod diameters and watch the cap/rod areas (drawn to scale), φ, and the
> resulting force and speed difference between extend and retract. Animate the
> piston to feel the speed gap.

---

## 2.2 Force — pressure acting on area

Hydraulic force is pressure × area. The achievable force depends on **which side**
is pressurized:

```
Extend force:   F_ext = p · A_cap
Retract force:  F_ret = p · A_rod
```

**Worked numbers** at the default supply pressure **p = 16 MPa (160 bar)**:

```
F_ext = 16 × 10⁶ · 1.257 × 10⁻³ = 20 100 N ≈ 20.1 kN  per cylinder (extending)
F_ret = 16 × 10⁶ · 8.77 × 10⁻⁴  = 14 030 N ≈ 14.0 kN  per cylinder (retracting)
```

At the relief ceiling (21 MPa) the extend force rises to ≈ 26.4 kN. So a single
40 mm cylinder at modest pressure produces tonnes of force — and notice the
machine is **~43% stronger pushing than pulling**, the force-side consequence of
φ.

---

## 2.3 Flow and speed

Cylinder **speed** is the oil flow rate divided by the area being filled:

```
v = Q / A
```

Same flow, different area → different speed for extend vs retract. This is the
*speed-side* consequence of φ, and it's the mirror image of the force trade-off.

**Worked numbers** at the default rated flow **Q = 2.5 × 10⁻⁴ m³/s (15 L/min):**

```
Extend speed:   v_ext = Q / A_cap = 2.5e−4 / 1.257e−3 = 0.199 m/s  (≈ 0.20 m/s)
Retract speed:  v_ret = Q / A_rod = 2.5e−4 / 8.77e−4  = 0.285 m/s  (≈ 0.28 m/s)
```

Retract is **φ = 1.43× faster** than extend for the same flow. Combined with §2.2:
a cylinder pushes harder but slower, and pulls faster but weaker. (Useful unit:
1 L/min = 1.667 × 10⁻⁵ m³/s.)

> This is why the `asymmetry_demo` preset overshoots on the way back: a controller
> tuned for the slow extend direction is outrun by the fast retract direction.

---

## 2.4 The valve — controlling the flow

The platform speed is set by a **directional control valve** that meters oil to
the cylinder. The controller's output is a normalized command **u ∈ [−1, +1]**
(full retract … neutral … full extend). Real proportional valves follow a
square-root flow law (an orifice), because flow through a restriction depends on
the square root of the pressure drop across it:

```
General orifice:   Q = C_d · A_valve · √( 2 ΔP / ρ )
```

The simulator uses the standard normalized form (rated flow at a rated pressure
drop), which captures the same physics without needing the discharge coefficient
and density explicitly:

```
Q = u · Q_rated · √( ΔP / ΔP_rated )
```

- `u` — valve opening (the controller's command).
- `Q_rated` — flow the valve passes wide-open at the rated pressure drop.
- `ΔP` — actual pressure drop across the valve right now.
- The **√** is the key nonlinearity: halve the pressure drop and you get only
  ~71% of the flow, not 50%.

> ▶ **Interactive:** [**Valve Flow Law**](demos/orifice-flow.html) — move the
> command and pressure-drop sliders and watch the square-root curve against a naive
> linear valve. The gap between the two is the nonlinearity in one picture.

**Valve types modelled** (selectable in the dashboards):

| Model | Behaviour | Real-world analogue |
|-------|-----------|---------------------|
| `proportional` | smooth, continuous `u` | proportional / servo valve |
| `pwm` | rapidly switched, time-averaged | solenoid valve driven by PWM |
| `bangbang` | fully open / closed with a deadband | cheap on/off solenoid DCV |

> The on/off valve can't meter, so it parks within a **deadband** — coarse
> positioning. That's the `onoff_valve` preset's whole point.

---

## 2.5 Load pressure

How much pressure does a move actually *demand*? That comes from the load the
platform must support — gravity, its own acceleration, and any external force —
projected back onto the legs through the Jacobian (see
[Kinematics §1.4](01-kinematics-and-motion.md#why-the-jacobian-is-the-workhorse)):

```
Required leg forces:   f = J⁻ᵀ · (M · a − F_ext)
Load pressure in leg:  p_load,i = | f_i | / A_eff,i
```

`A_eff` is `A_cap` when extending, `A_rod` when retracting (whichever side is being
pressurized). Two consequences fall straight out of this:

- **Near a singularity**, `J⁻ᵀ` blows up, so `f` and therefore `p_load` spike —
  the legs glow red on screen exactly where manipulability collapses.
- If `p_load` exceeds the **relief setting**, the relief valve opens and the move
  sags. That's the `OVER_PRESSURE` fault.

> Verified in `hydraulics.test.js`: "force balance Jᵀf ≈ [0, m·g]" confirms the
> leg forces correctly hold up the platform's weight.

---

## 2.6 The pump and the relief valve

**One pump feeds all cylinders.** Its maximum flow is a shared budget:

```
Σ Q_i  ≤  Q_pump        else → PUMP_SATURATED, every leg slows proportionally
```

**Worked numbers (defaults):** pump max **6 × 10⁻⁴ m³/s = 36 L/min**; each cylinder
rated at 15 L/min. One cylinder at full tilt is fine; a fast coordinated move that
asks both for 15 L/min needs 30 L/min (OK), but a faster or three-cylinder demand
can exceed 36 L/min and saturate — the `weak_pump` preset is tuned to make this
happen.

**Hydraulic power** the pump must provide:

```
P_hyd = p · Q = 16 × 10⁶ · 6 × 10⁻⁴ = 9 600 W ≈ 9.6 kW
```

(The electric motor driving the pump must supply this plus losses — see
[Electrical Wiring §4.2](04-electrical-and-control-wiring.md#42-power-distribution).)

The **relief valve** is the pressure safety cap. If pressure anywhere exceeds its
setting (default 21 MPa), it opens and dumps flow back to tank, protecting hoses,
seals, and the cylinder. It is the hydraulic counterpart to an electrical fuse.

---

## 2.7 An accumulator (real machines, not modelled here)

Real rigs often add a **gas accumulator** — a pressure reservoir — to absorb pump
ripple and supply brief flow surges beyond the pump's steady rate. The simulator
deliberately omits it (and treats oil as incompressible) to keep the teaching
model clean; it's noted here so you know what a physical build would add.

---

## 2.8 Worked sizing example — choosing a cylinder and pump

Suppose you must **lift a 200 kg payload at up to 0.15 m/s**, with margin.

**Step 1 — force needed.** Weight = `m·g` = 200 · 9.81 ≈ 1 962 N, shared across
legs but with a safety/orientation factor take ~3 kN per cylinder at worst pose.

**Step 2 — pick a pressure.** Choose a working pressure `p = 16 MPa` (common for
compact industrial cylinders).

**Step 3 — bore from force.** Need `A_cap ≥ F / p = 3 000 / 16e6 = 1.9 × 10⁻⁴ m²`,
so `D ≥ √(4A/π) = √(4·1.9e−4/π) ≈ 15.5 mm`. A 40 mm bore (A_cap = 1257 mm²) gives
huge margin — at 16 MPa it makes 20 kN, far above 3 kN, leaving headroom for
dynamic loads and singular-pose pressure spikes.

**Step 4 — flow from speed.** To extend at 0.15 m/s: `Q = v · A_cap =
0.15 · 1.257e−3 = 1.9 × 10⁻⁴ m³/s ≈ 11 L/min` per cylinder.

**Step 5 — pump from simultaneous flow.** Worst case all cylinders move at once;
for three legs that's ~33 L/min, so a ~36 L/min pump (the default) covers it. Add
an accumulator if you need brief faster bursts.

**Step 6 — valve from flow at ΔP.** Size each valve so `Q_rated` ≥ 15 L/min at the
expected valve pressure drop, so it isn't the bottleneck at the speeds you want.

**Step 7 — relief above working, below burst.** Set relief at ~21 MPa: above the
16 MPa working pressure (so it doesn't nuisance-trip) but safely below component
burst ratings.

Notice the result lands right on the simulator's defaults — they were chosen to be
a realistic, internally consistent design you can reason about.

---

**Next:** [The Control System →](03-control-system.md) — how the controller
decides the valve command `u` every timestep.
