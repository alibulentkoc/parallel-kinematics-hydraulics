# Gate 5B — Figure Plan

**Governing constraint:** a figure may be hand-authored only if it communicates something
**better than a demo view or screenshot**. Otherwise it is an **exported view** from one of
the four approved demo families — so the demo remains the single source of truth and figures
never drift from the simulator.

Three categories: **A** canonical reference (hand-drawn SVG) · **B** derived engineering
(exported from a demo family) · **C** process / curriculum diagrams.

---

## Category A — Canonical reference figures (hand-authored SVG)

Each is justified because it labels structure/notation/concepts the interactive demos don't
present as a static labeled reference.

| ID | Title | Type | Source | Used in |
|---|---|---|---|---|
| A1 | 2-RPR geometry & notation (anchors, b, L₁/L₂, pose) | Canonical SVG | Hand-drawn | M1, handbook |
| A2 | 3-RPR geometry & notation (3 anchors, attach pts, θ) | Canonical SVG | Hand-drawn | M3, handbook |
| A3 | Hydraulic cylinder anatomy (bore, rod, cap/rod chambers, ports, seals) | Canonical SVG | Hand-drawn | M2, handbook |
| A4 | Solenoid DCV state diagram (extend / hold / retract spool, flow paths) | Canonical SVG | Hand-drawn | M2, handbook |
| A5 | Hydraulic power-unit architecture (pump, relief, reservoir, filter, lines) | Canonical SVG | Hand-drawn | M2, handbook |
| A6 | Jacobian / manipulability concept (velocity ellipse vs det J) | Canonical SVG | Hand-drawn | M3, handbook |
| A7 | PWM concept waveform (carrier, on-time, duty → average flow) | Canonical SVG | Hand-drawn | M2, handbook |
| A8 | On/off control concept (deadband, hysteresis, limit-cycle band) | Canonical SVG | Hand-drawn | M2, handbook |
| A9 | Twin synchronization workflow (rig log + twin log → shared schema) | Canonical SVG | Hand-drawn | M4, handbook |
| A10 | Validation workflow (measure → compare → diagnose → report loop) | Canonical SVG | Hand-drawn | M4, handbook |

**Canonical SVGs: 10.**

---

## Category B — Derived engineering figures (exported from demos)

Not redrawn. Each is captured from a demo family's SVG stage at a canonical preset, so the
figure, notebook, lesson, handbook, and assessment all show the same thing.

| ID | Title | Type | Source | Used in |
|---|---|---|---|---|
| B1 | Workspace map | Exported | Family 1 | M1 |
| B2 | Manipulability map | Exported | Family 1 | M3 |
| B3 | Safe-region map | Exported | Family 1 | M3 |
| B4 | Duty-cycle characterization curve | Exported | Family 3 | M2 |
| B5 | Step response: on/off vs PWM vs proportional | Exported | Family 3 | M2 |
| B6 | Tuned response (settling, limit cycle) | Exported | Family 3 | M3 |
| B7 | Coordinated path tracking | Exported | Family 3 | M3 |
| B8 | Orifice flow curve Q vs ΔP | Exported | Family 2 | M2 |
| B9 | Twin-vs-rig overlay | Exported | Family 4 | M2, M4 |
| B10 | Twin accuracy plot | Exported | Family 4 | M4 |
| B11 | Discrepancy signatures (5 fault patterns) | Exported | Family 4 | M4 |

**Exported demo figures: 11.**

### Export procedure (per exported figure)

| ID | Demo family | View | Export procedure |
|---|---|---|---|
| B1 | Family 1 | Workspace | set 2-DOF, Workspace view → export stage SVG |
| B2 | Family 1 | Manipulability | set 3-DOF, Manipulability view → export stage SVG |
| B3 | Family 1 | Singularity | set 3-DOF, Singularity view → export stage SVG |
| B4 | Family 3 | Duty sweep | default deadband → export stage SVG |
| B5 | Family 3 | Position | run each valve model, Instructor overlay on → export stage SVG |
| B6 | Family 3 | Tuning | tuned preset → export stage SVG |
| B7 | Family 3 | Coordinated | Kp at pass threshold → export stage SVG |
| B8 | Family 2 | Valve | u=0.7 → export stage SVG |
| B9 | Family 4 | Overlay | good-twin scenario → export stage SVG |
| B10 | Family 4 | Accuracy | good-twin scenario → export stage SVG |
| B11 | Family 4 | Diagnose | capture each of the 5 scenarios → export stage SVGs |

*Enabling note:* the demos already render their stage as SVG. To formalize export and keep
figures synced, I'll add a small **"Export SVG"** button to each family (one-line per demo)
during figure generation — so a figure is literally the demo's own output, not a copy.

---

## Category C — Process / curriculum figures (hand-authored)

Curriculum-level diagrams for the handbook and instructor materials.

| ID | Title | Type | Source | Used in |
|---|---|---|---|---|
| C1 | Twin Maturity Map (Observe → … → Validation) | Process SVG | Hand-drawn | handbook |
| C2 | Student Roadmap (15-week artifact spine) | Process SVG | Hand-drawn | handbook, instructor |
| C3 | Midterm Build Sprint (weeks 5–8) | Process SVG | Hand-drawn | instructor |
| C4 | Artifact Chain (15 headline artifacts) | Process SVG | Hand-drawn | handbook |
| C5 | Competency traceability (competency → … → threshold) | Process SVG | Hand-drawn | handbook, instructor |
| C6 | Demo Family ↔ Twin Maturity alignment | Process SVG | Hand-drawn | handbook |

**Process figures: 6.**

---

## Summary

```
Canonical SVGs (A):        10
Exported demo figures (B): 11
Process figures (C):        6
Total:                     27
```

**Duplication check:** no Category-A figure redraws a demo output (the demos' maps, curves,
responses, overlays, and accuracy plots are all Category B exports). The canonical SVGs cover
only geometry/anatomy/schematic/concept references the demos don't present statically. The
demos remain the single source of truth for every quantitative figure.

---

## Decision requested

Approve the **Figure Plan**, or mark figures to add/cut/recategorize. On approval I'll
generate them in order — **Category A canonical SVGs first** (they define the visual
language), then add the **Export SVG** capability and capture **Category B**, then **Category
C** — and present each batch for review before moving on. Then the sequence continues to
quizzes → notebooks → handbook → lesson prose.
