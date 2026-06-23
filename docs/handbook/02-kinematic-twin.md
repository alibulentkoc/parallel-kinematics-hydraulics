# Chapter 2 — Kinematic Twin (M1)

*Operational reference. Produces the geometry, IK/FK, and workspace artifacts.*

## 1. Stage Goal
Establish a verified geometric model: map platform pose ↔ leg lengths, and bound the reachable,
non-singular workspace.

## 2. Artifact Produced
Geometry config · IK/FK implementation · **Workspace map**.

## 3. Required Inputs
Machine geometry (anchors, attach points, stroke limits) and a target pose or path.

| Parameter | 2-RPR (midterm) | 3-RPR (final) |
|---|---|---|
| Base anchors | (−0.6, 0), (0.6, 0) | (−0.8, 0), (0.8, 0), (0, 1.0) |
| Platform attach | platform centre | (−0.12,−0.07), (0.12,−0.07), (0, 0.14) |
| Stroke L | [0.40, 1.00] m | [0.30, 1.00] m |
| Singular floor \|det J\| | 0.02 | 0.02 (near-warn 0.08) |

## 4. Key Figures
![2-RPR geometry](../figures/A1-2rpr-geometry.svg)
![Workspace map](../figures/B1-workspace-map.svg)
3-DOF: `A2-3rpr-geometry`, `B2-manipulability-map`, `B3-safe-region-map`.

## 5. Key Equations (reference)
- Inverse: `Lᵢ = √((x ∓ bᵢ)² + (y − aᵢ)²)`
- Forward (2-DOF): `x = (L₁² − L₂²) / 4b`, `y = √(L₁² − (x + b)²)`
- Jacobian determinant (2-DOF): `det J = |2by / (L₁L₂)|`
- 3-DOF: numerical Jacobian; `det J` via its determinant.

## 6. Procedure
1. Enter anchors, attach points, stroke limits.
2. For a pose, run IK → leg lengths; reject any leg outside [L_min, L_max].
3. For legs, run FK → pose; select the correct branch (y > 0 working half).
4. Compute `det J`; flag poses below the singular floor.
5. Sweep the grid to render the workspace / manipulability / safe-region maps.

## 7. Acceptance Test
- IK→FK round-trip error **< 1e-6 m** (2-DOF) / **< 1e-4 m** (3-DOF).
- Operating poses have **|det J| ≥ 0.02**.
- Run **N1**; all asserts pass.

## 8. Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| Pose flagged UNREACHABLE | a required leg is outside [L_min, L_max] | move target into the reachable lens (lower \|x\|, moderate y) |
| FK returns wrong pose | branch (sign of y) selected wrong | force the working half-plane (y > 0) |
| Workspace misclassification | grid coords rounded / boundary cell | refine grid near the boundary; treat det J → 0 band as excluded |
| Joint rates blow up | near singularity (det J → 0) at y = 0 or symmetric pose | keep paths in the high-manipulability interior; route around the symmetric pose |

## 9. Related Demo Views
Family 1 — Live, Workspace, Manipulability, Singularity. Export the workspace CSV for N1.

## 10. Related Notebook
**N1 — Kinematics**: reproduces det J from the grid; verifies the round-trip threshold.

## 11. Related Quiz
**Q1** (kinematics), **Q4** (3-DOF manipulability / singularities).

## 12. Exit Criteria
Round-trip passes, the workspace map is exported, and all operating poses sit above the singular
floor. Proceed to Chapter 3.
