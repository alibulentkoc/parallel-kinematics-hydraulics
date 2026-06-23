# Gate 5B — Category B.0: Export Specification

The contract that binds **Demo → Figure → Data** before any exported figure is captured. No
figures generated here. On approval, exports follow in order B.1 → B.4.

---

## 1. Export formats (every exported figure ships all three)

| Format | What it is | How it is produced |
|---|---|---|
| **SVG** | the figure | serialize the demo's stage `<svg>` verbatim (vector, editable) |
| **PNG** | raster fallback | rasterize the same SVG at 2× for print/slides |
| **CSV** | the underlying data | dump the arrays the view plotted (grid, curve, trace) |

The SVG is the demo's *own* output — not a redraw — so the figure cannot diverge from the
simulator. The CSV lets notebooks and assessments reuse the exact numbers behind the figure.

---

## 2. Figure metadata (embedded automatically in every export)

Each export carries, in an SVG `<metadata>` block + a visible footer + a sidecar `.json`:

```
source   : Family N
view     : <view name>
params   : <frozen parameter set name>
exported : <ISO-8601 timestamp>
key      : <the few numbers that define this figure>
```

So "which version of the workspace map is this?" is always answerable from the figure itself.

---

## 3. Frozen parameter sets (locked — the same figure everywhere)

Exported figures may only use these named, locked sets. Changing a set is a governed action
(it re-issues every figure built from it), so the handbook map and the lesson map stay
identical.

| Set | Locked values |
|---|---|
| **baseline_2dof** | b=0.6, L∈[0.4,1.0], sweep 46×46, x∈[−1.1,1.1], y∈[−0.1,1.25] |
| **baseline_3dof** | anchors (−0.8,0)(0.8,0)(0,1.0); attach (−0.12,−0.07)(0.12,−0.07)(0,0.14); L∈[0.3,1.0]; θ=0 for maps; reference pose (0.05,0.55,0.10) |
| **baseline_hydraulic** | bore=0.040, rod=0.022, supply=16 MPa, relief=21 MPa, pumpMax=6e-4, ratedFlow=2.5e-4, ratedΔP=3.5 MPa, load=15 kN, u=0.7, ΔP=½ rated, v_target=0.20 |
| **baseline_control** | dt=0.001, target=0.10, Kp=30, deadband=0.010, hysteresis=0.004, pwmFreq=40; tracking Kp=40 |
| **baseline_twin_good** | scenario = good twin (no injected fault) |
| **baseline_twin_faults** | the five scenarios: geometry, sensor, deadband, pressure, timing |

---

## 4. Exported figure table (B1–B13)

| ID | Figure | Family | View | Format | Source data | Parameter set |
|---|---|---|---|---|---|---|
| B1 | Workspace map | 1 | Workspace | SVG+PNG+CSV | reachability grid | baseline_2dof |
| B2 | Manipulability map | 1 | Manipulability | SVG+PNG+CSV | manipulability field | baseline_3dof |
| B3 | Safe-region map | 1 | Singularity | SVG+PNG+CSV | det(J) field | baseline_3dof |
| B4 | Force / area | 2 | Cylinder | SVG+PNG+CSV | areas, forces vs bore/rod | baseline_hydraulic |
| B5 | Flow curve | 2 | Valve | SVG+PNG+CSV | Q vs ΔP | baseline_hydraulic |
| B6 | Pump / power | 2 | Pump/Power | SVG+PNG+CSV | flow, power, relief | baseline_hydraulic |
| B7 | Duty-cycle curve | 3 | Duty sweep | SVG+PNG+CSV | duty → speed | baseline_control |
| B8 | Step response | 3 | Position | SVG+PNG+CSV | pos(t), 3 valve models | baseline_control |
| B9 | Coordinated tracking | 3 | Coordinated | SVG+PNG+CSV | target vs actual path | baseline_control |
| B10 | Tuned response | 3 | Tuning | SVG+PNG+CSV | pos(t), settling, limit cycle | baseline_control |
| B11 | Twin-vs-rig overlay | 4 | Overlay | SVG+PNG+CSV | twin & rig pos(t) | baseline_twin_good |
| B12 | Twin accuracy | 4 | Accuracy | SVG+PNG+CSV | metrics + thresholds | baseline_twin_good |
| B13 | Discrepancy signatures | 4 | Diagnose | SVG+PNG+CSV | 5 fault traces + cues | baseline_twin_faults |

**13 exported figures** (Family 2 expanded from 1 → 3 per the approved B.2 grouping).

---

## 5. Pipeline implementation (applied per family during B.1–B.4)

Each family gains an **Export bar**: `Export SVG · Export PNG · Export CSV`. Exporting (a)
applies the figure's frozen parameter set, (b) serializes the stage SVG with the metadata
block, (c) rasterizes the PNG, (d) writes the CSV with a metadata header. The committed
figures in `docs/figures/` are these exact outputs.

---

## Order (on approval)

- **B.1 Family 1** → B1, B2, B3
- **B.2 Family 2** → B4, B5, B6
- **B.3 Family 3** → B7, B8, B9, B10
- **B.4 Family 4** → B11, B12, B13

Each batch presented for review; the full B set reviewed before Category C.

---

## Decision requested

Approve the **Export Specification** (formats, metadata, frozen parameter sets, the 13-figure
table). On approval I'll implement the export pipeline in **Family 1** and capture **B1–B3**
first.
