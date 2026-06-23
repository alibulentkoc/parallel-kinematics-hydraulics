# Appendix A — Wiring & I/O Reference

*Operational reference. Hardware channels for commissioning and for mapping the twin to a real rig.*

## Position & pressure feedback

| Sensor | Output | Notes |
|---|---|---|
| Magnetostrictive linear transducer | analog 0–10 V / 4–20 mA, or SSI | absolute, robust, fits inside the cylinder — industrial default |
| LVDT | analog AC → conditioned DC | precise over short strokes |
| Linear potentiometer | analog 0–10 V | low cost; fine for a teaching rig |
| Draw-wire encoder | quadrature pulses | easy external retrofit |
| Pressure transducer (per line) | 4–20 mA (typical) | current loop resists noise over long runs |

## Controller I/O (per axis)

| I/O | Count | Purpose | Typical spec |
|---|---|---|---|
| Analog in | 1 position + 1 pressure | read transducers | 12–16-bit ADC, ±10 V / 4–20 mA |
| Analog out | 1 | proportional valve command | 12–16-bit DAC, ±10 V / 4–20 mA |
| Digital out | 1–2 | on/off solenoids, enable | 24 V, flyback-protected |
| Digital in | as needed | limit/pressure switches, E-stop status | 24 V |
| PWM | optional | PWM valve drive | frequency sufficient for the solenoid |

## Safety chain (hard-wired, independent of software)

- **E-stop loop** — series circuit; when broken, de-energizes the pump contactor and dumps valves to a safe state.
- **Relief valve** — mechanical pressure cap (see [Hydraulic Twin](03-hydraulic-twin.md)); always present.
- **Pressure switches** — hardware trips on overpressure, independent of the analog transducer.
- **Limit switches** — hardware end-of-travel backing the soft stroke limits.
- **Fail-safe valve state** — loss of power = safe (blocked/vented), never an uncommanded move.

## Simulator signal ↔ real channel map

The bridge that makes the testbed a true twin — every simulator quantity is a physical wire.

| Simulator quantity | Meaning | Real-world signal | Direction |
|---|---|---|---|
| `u[i]` | valve command, −1…+1 | ±10 V / 4–20 mA / PWM duty | controller → valve |
| `stroke[i]` / `Lact[i]` | piston position / leg length | position transducer (0–10 V / SSI) | sensor → controller |
| `pLoad[i]` | load pressure in leg | pressure transducer (4–20 mA) | sensor → controller |
| `Q[i]` | oil flow to leg | derived, or flow meter | — |
| `pumpSaturated` | flow demand > pump | pump/flow monitoring, drive status | sensor/logic → controller |
| `strokeEnd[i]` | end of travel | limit switch (DI) | sensor → controller |
| `faults[]` | condition flags | controller logic + hard-wired interlocks | computed |
| logged CSV row | one control cycle | controller data-acquisition record | logged |

Because the log format is identical, a real-rig capture drops straight into the twin tools and
notebooks — the same analysis runs on simulated and physical data. This is what makes the
**Validation Twin** (Chapter 5) possible.

## Minimal teaching-bench BOM (one axis to start)

Small HPU (pump + motor + tank + relief, ~1.5 kW) · 1 double-acting cylinder/axis (small bore,
e.g. 25 mm) · 1 proportional directional valve/axis (with OBE) · 1 linear position
transducer/cylinder · 1 pressure transducer/line (optional) · microcontroller or PLC with AI/AO
(or PWM) · 24 VDC supply + signal conditioning · E-stop + relief safety · hoses, fittings,
manifold, frame. Master one axis (position loop) before adding a second cylinder and shared
platform for the 2-DOF machine.
