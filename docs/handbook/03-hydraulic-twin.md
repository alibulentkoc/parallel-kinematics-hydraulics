# Chapter 3 — Hydraulic Twin (M2)

*Operational reference. Produces the sizing report and the design-review package (midterm build).*

## 1. Stage Goal
Size the cylinder, valve, and pump so the machine meets force and speed demand within pressure
and flow limits.

## 2. Artifact Produced
**Hydraulic Sizing Report** · Design Review package (standards-compliant schematic + safety).

## 3. Required Inputs
Load (kN), required speed (m/s), and the supply/relief/pump limits.

| Parameter | Value |
|---|---|
| Bore / rod | 40 mm / 22 mm |
| A_cap / A_rod | 1257 mm² / 877 mm² |
| Area ratio φ | 1.43 |
| Supply / relief | 16 MPa / 21 MPa |
| Pump max | 36 L/min |
| Rated flow / ΔP | 15 L/min / 3.5 MPa |
| F_ext / F_ret @ supply | 20.1 kN / 14.0 kN |

## 4. Key Figures
![Cylinder (ISO 1219)](../figures/A3-cylinder-anatomy.svg)
![DCV states (ISO 1219)](../figures/A4-dcv-states.svg)
![HPU (ISO 1219)](../figures/A5-hpu-architecture.svg)
Sweeps: `B4-force-area`, `B5-flow-curve`, `B6-pump-power`.

## 5. Key Equations (reference)
- Areas: `A_cap = π/4·bore²`, `A_rod = A_cap − π/4·rod²`, `φ = A_cap / A_rod`
- Force: `F = P · A` (extend uses A_cap, retract uses A_rod)
- Orifice flow: `Q = u · Q_rated · √(ΔP / ΔP_rated)`
- Required flow: `Q_req = v · A_cap`; Hold pressure: `P_hold = F_load / A_cap`

## 6. Procedure
1. Compute areas and φ from bore/rod.
2. Check extend/retract force against load at supply pressure.
3. Compute required flow at target speed; compare to pump max.
4. Compute hold pressure; compare to relief setting.
5. Draw the circuit using **ISO 1219** symbols (single-source from A3–A5); annotate areas/ratings.

## 7. Acceptance Test
- **φ ≤ 1.6** · **F_ext ≥ load** · **Q_req ≤ pump max** · **P_hold ≤ relief** · values within **±15%** of engine.
- Run **N2**; all asserts pass.

## 8. Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| Unphysical geometry flag | rod ≥ bore | choose rod < bore; keep φ ≤ 1.6 |
| Speed cannot be reached | pump saturation (Q_req > pump max) | reduce target speed or bore, or raise pump capacity |
| Load not held / relief opens | relief set below demand (over-pressure) | raise relief within rating, or reduce load / increase A_cap |
| Force short of load | cylinder undersized | increase bore (re-check φ and flow) |

## 9. Related Demo Views
Family 2 — Cylinder, Valve, Pump, Sensor. The cylinder view shows the annulus area; the valve and
pump views carry the ISO DCV and relief symbols. Export the sweep CSVs for N2.

## 10. Related Notebook
**N2 — Hydraulics**: reproduces φ, forces, flow, power, hold pressure; verifies the sizing rules.

## 11. Related Quiz
**Q2** (hydraulic sizing; includes ISO 1219 symbol interpretation).

## 12. Exit Criteria
All four sizing rules pass, the ISO schematic is drawn, and the design review is signed off.
Proceed to Chapter 4. The commissioned 2-DOF twin is the **midterm**.
