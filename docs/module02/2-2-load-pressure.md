!!! abstract "You are here"
    **Module 2 — Hydraulic Actuation** · **Unit 2 — Valves, Flow & Pressure** · **Lesson 2.2 — Load Pressure & the Jacobian**

# Lesson 2.2 — Load Pressure & the Jacobian

> **Module 2 · Unit 2 · Lesson 2.2**
> The bridge between Module 1 and Module 2: the platform's load becomes leg forces
> through the Jacobian, and leg forces become cylinder pressures through the piston
> area. This is where geometry and hydraulics finally meet.

---

## 1. Why This Matters

A load sitting on the platform doesn't press on the cylinders directly — it presses
through the *geometry*. How much pressure each cylinder needs depends on **where**
the platform is, because the Jacobian (Lesson 1.3.1) changes with pose. This is why
the same payload can be easy in one part of the workspace and pressure-saturating in
another, and why singularities are a hydraulic problem, not just a geometric one.

## 2. Physical Intuition

Imagine pushing a platform straight up while the legs splay out sideways. Only the
*vertical part* of each leg's push supports the load, so the legs must push much
harder along their length than the load itself — and that extra push is pressure.
When the legs are near-vertical the geometry is efficient; when they're near-flat
(approaching a singularity) the required leg force, and so the pressure, climbs
toward infinity.

## 3. Mathematical Foundations

From Lesson 1.3.1, leg forces \(f\) and platform wrench \(F\) are related by the
Jacobian transpose:

\[
F = J^{\mathsf T} f \quad\Longrightarrow\quad f = J^{-\mathsf T} F.
\]

To hold a payload of mass \(M\) (and accelerate it at \(a\)) against external force
\(F_\text{ext}\):

\[
f = J^{-\mathsf T}\,(M a - F_\text{ext}).
\]

Each leg force then becomes a **pressure** through the relevant piston area
(extend uses \(A_\text{cap}\), retract uses \(A_\text{rod}\)):

\[
p_i = \frac{f_i}{A_i}.
\]

As \(\det(J)\to 0\) near a singularity, \(J^{-\mathsf T}\) blows up, so \(f\) — and
the demanded pressure — diverges. The relief valve (next lesson) is what stops that
from destroying the machine.

## 4. Visual Explanation

```mermaid
flowchart LR
    LOAD["platform load<br/>Ma − F_ext"] -->|"J⁻ᵀ (pose-dependent)"| LEGF["leg forces f"]
    LEGF -->|"÷ piston area A_i"| PRES["cylinder pressure p_i"]
    PRES --> CHK{"p_i > relief?"}
    CHK -->|no| OK["holds the load"]
    CHK -->|yes| SAT["pressure-limited —<br/>can't hold here"]
```

The chain is: **load → (Jacobian) → leg force → (area) → pressure**. Both
conversions can amplify: a bad pose inflates the leg force, a small area inflates
the pressure.

## 5. Engineering Example

In the simulator, the hydraulics module asks the kinematics for the current
Jacobian every cycle, computes the leg forces for the commanded motion and payload,
and converts them to the pressures it then checks against the relief limit. When you
drive a heavy preset toward the workspace edge, you can watch the demanded pressure
climb — and the fault engine raise an over-pressure warning before the relief opens.

## 6. Worked Example

Hold a 12 kg payload statically (\(a = 0\), \(F_\text{ext} = Mg\) downward) near a
healthy pose where, say, each leg must supply about 90 N of vertical-support force
that geometry turns into roughly 130 N along the leg. On the extend (cap) side:

\[
p = \frac{f}{A_\text{cap}} = \frac{130}{1257\times10^{-6}} \approx 0.10\ \text{MPa}.
\]

A trivial pressure — far below the 16 MPa supply. Now move the same load toward the
base line: the geometry factor inflates, the required leg force climbs by 10× or
more, and the pressure marches toward the relief limit. *Same load, same cylinders —
only the pose changed.*

## 7. Interactive Demonstration

<iframe src="../../demos/kinematics-explorer.html" title="Kinematics Explorer — interactive demo" loading="lazy" style="width:100%;height:780px;border:1px solid var(--md-default-fg-color--lightest);border-radius:8px;background:#0e1217"></iframe>

[Open this demo full-screen in a new tab ↗](../demos/kinematics-explorer.html){ target=_blank }

While this demo shows manipulability rather than pressure directly, the connection
is exact: the dark (low-\(w\)) regions are precisely where \(J^{-\mathsf T}\) — and
therefore the required leg force and pressure — blow up. Drag toward the base line
and read the collapsing manipulability as a pressure-danger map.

## 8. Code & Computation

```python
from math import pi
# leg force -> pressure through the piston area:  p = f / A
A_cap = pi * 0.040**2 / 4
f = 130.0                       # N along the leg (from J^-T * load, pose-dependent)
print(f"pressure = {f / A_cap / 1e6:.3f} MPa")     # ~0.10 MPa at a healthy pose
# near a singularity J^-T blows up, so f -- and this pressure -- diverge.
```

!!! tip "Run this yourself — three ways"
    The Python above is a ready-to-run cell from the **Module 2 notebook**. Pick whichever is easiest:

    1. **Run in your browser, no setup —** open it in Google Colab and press the ▶ button on each cell: [Open Module 2 in Colab ↗](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb){ target=_blank }
    2. **Run locally —** [view/download the notebook on GitHub ↗](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb){ target=_blank }, then open it in Jupyter, JupyterLab, or VS Code (`pip install notebook`, then `jupyter notebook`).
    3. **Just try the snippet —** copy the code above into any Python 3 prompt; it needs only the standard library.

    The force-to-pressure path uses the Jacobian from [`src/kinematics/`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/src/kinematics) in [`src/hydraulics/hydraulics.js`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/src/hydraulics/hydraulics.js).

## 9. Knowledge Check

[Open the Lesson 2.2.2 check ↗](../quizzes/m2-l22.html){ target=_blank }

## 10. Challenge Problem

Explain, in two or three sentences, why a parallel machine can be perfectly
*reachable* at a pose yet still *unable to hold a load* there. Which quantity — leg
length or manipulability — warns you about each failure?

## 11. Common Mistakes

- **Assuming pressure depends only on the load.** It depends on the load *and the
  pose*, through the Jacobian.
- **Using the wrong area.** Extend pressure uses \(A_\text{cap}\); retract uses
  \(A_\text{rod}\) — mixing them gives the wrong number by the factor φ.
- **Forgetting the singularity blow-up.** Near \(\det(J)=0\), demanded pressure
  diverges no matter how light the load.

## 12. Key Takeaways

- Load becomes leg force through the **Jacobian transpose**: \(f = J^{-\mathsf T}(Ma
  - F_\text{ext})\).
- Leg force becomes **pressure** through the piston area: \(p_i = f_i/A_i\).
- Both conversions are **pose-dependent**, so the same load needs different pressure
  in different places.
- Near a **singularity**, demanded pressure **diverges** — geometry is a hydraulic
  constraint.

## AI Learning Companion

**Tutor**
```
Explain how a load on a parallel machine's platform becomes pressure in each
cylinder, via f = J⁻ᵀ(Ma − F_ext) and p = f/A. Why does pose matter so much?
```
**Explore**
```
Explain why the required cylinder pressure blows up near a kinematic singularity,
and what a real machine does (relief valve, motion limits) to survive it.
```

---

*Next lesson: [2.3 — Pump & Relief Sizing](2-3-pump-and-relief.md), where we size the power unit to supply the flow and cap the pressure.*
