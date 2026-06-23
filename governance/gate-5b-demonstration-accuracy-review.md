# Gate 5B — Demonstration Accuracy Review (new standing rule)

Adopted after the cylinder-view case, which was numerically correct but visually misleading.

> **Before any figure is exported (and before any demo view is published), three gates must
> all pass:**
> 1. **Numerical correctness** — values match the engine equations/constants.
> 2. **Visual correctness** — the picture explains the physics; it cannot imply something
>    false or unexplained.
> 3. **Standards compliance** — ISO 1219 / ANSI Y32.10 symbols; no invented symbols.

A view may pass one or two and still fail. The cylinder view passed (1) but failed (2) — the
rod-side area shrank with no visible cause — which is why all three are required.

---

## Family 2 view audit

| View | 1 Numerical | 2 Visual | 3 Standards | Action |
|---|---|---|---|---|
| **Cylinder** | ✓ areas/φ/forces match engine | was ✗ (A_rod shrank unexplained) → ✓ | ✓ ISO 1219 cylinder | annulus annotation (rod grows hole → ring shrinks); guard rod ≥ bore as unphysical |
| **Valve** | ✓ Q=7.42 L/min (ref 7.4) | ✓ √-law curve correct | was ✗ (no symbol) → ✓ | added ISO 1219 **4/3 DCV symbol** (parallel/closed/crossed, solenoids, P/T/A/B) |
| **Pump / Power** | ✓ flow 15.08, max 36, power 4.0/9.6 kW, hold 11.9 MPa | ✓ bars + clarified power label (required vs installed max) | was ✗ (no symbol) → ✓ | added ISO 1219 **pump + relief** symbols (circle+triangle, square+arrow+spring+pilot) |
| **Sensor** | ✓ 7.5 V, 16.67 V/m | ✓ added projection lines + axis labels (engineering units ↔ signal) | ✓ electrical instrument; linear transducer labeled; no invented symbols | over-range guard (reading > full scale clamps at V_max, flagged) |

### Numerical references confirmed (engine-grounded)

```
valve   Q(u=0.7, dP=½ rated) = 7.42 L/min        (engine ref 7.4)
pump    req flow @0.20 m/s    = 15.08 L/min       (engine ratedFlow 15)
pump    pump max              = 36.0 L/min        (engine 36)
pump    installed max power   = supply x pumpMax  = 9.6 kW   (engine ref 9.6)
pump    hold 15 kN            = 11.94 MPa         (relief 21)
sensor  read 0.45 m           = 7.50 V at 16.67 V/m
```

### New guards added (unphysical configurations now flagged, like rod ≥ bore)

- **rod ≥ bore** → red "unphysical" warning (cylinder).
- **reading > full scale** → OVER_RANGE warning; signal clamps at V_max (sensor).
- (existing) extend force < load, over-pressure, pump saturation, valve saturation.

---

All four Family 2 views now pass the three-gate review. With demonstration accuracy confirmed,
Category B.1 (Family 1 exports) can proceed knowing the exported figures will be numerically
**and** pedagogically **and** standards-correct.
