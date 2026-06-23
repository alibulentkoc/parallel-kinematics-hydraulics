!!! abstract "You are here"
    **Module 1 — Kinematics** · **Unit 1 — The Parallel Machine** · **Lesson 1.2 — The 2-RPR Geometry & Pose**

# Lesson 1.2 — The 2-RPR Geometry & Pose

> **Module 1 · Unit 1 · Lesson 1.2**
> We turn the picture from Lesson 1.1 into precise coordinates: where the anchors
> sit, what a leg length means, and exactly what a "pose" is. From here on, every
> claim can be a calculation.

---

## 1. Why This Matters

You can't compute with a picture. Before inverse and forward kinematics can become
formulas, we need a **coordinate system**: a fixed origin, named anchor points, and
an agreed meaning for "platform pose." This lesson sets that frame once, and the
rest of the module lives inside it.

## 2. Physical Intuition

Lay the machine flat on a table and draw an x–y grid on it. Put the origin halfway
between the two cylinder base-pivots. Now the left pivot is at some \((-b, 0)\) and
the right at \((+b, 0)\), where \(b\) is *half* the spacing between them. The
platform is a single point \(P\) floating above the base line. Each cylinder is a
straight line from its pivot to \(P\); its length is just how far apart those two
points are.

That's the entire 2-DOF geometry: two fixed dots on the x-axis, one moving dot
above, and two stretchy lines connecting them.

## 3. Mathematical Foundations

**The name.** Each leg is an **R-P-R** chain: a **R**evolute pivot at the base, a
**P**rismatic (sliding) cylinder, and a **R**evolute pivot at the platform. Two such
legs make a **2-RPR** mechanism.

**The anchors.** Symmetric about the origin:

\[
B_1 = (-b,\ 0), \qquad B_2 = (+b,\ 0)
\]

**The pose.** For the 2-DOF machine the platform is a point, so its pose is just

\[
P = (x,\ y).
\]

(The 3-DOF machine adds an orientation \(\theta\), giving \((x, y, \theta)\); we'll
get there in the final module.)

**Leg length** is the Euclidean distance from anchor to platform:

\[
L_i = \lVert P - B_i \rVert.
\]

**Stroke vs. length.** A real cylinder has a *closed length* \(L_\text{closed}\)
(its length fully retracted) and a *stroke* (how far it extends). So the usable leg
length lives in a band:

\[
L_\text{closed} \le L_i \le L_\text{closed} + \text{stroke},
\]

and the **stroke** the controller actually commands is \(s_i = L_i -
L_\text{closed}\). Keep these separate: *length* is geometry, *stroke* is the
piston travel the hydraulics produce.

## 4. Visual Explanation

![2-RPR geometry with anchors B1, B2 at (±b, 0), legs L1, L2, and platform P](../assets/2-rpr-geometry.svg)

Everything is labelled: the half-spacing \(b\), the two anchors on the base line,
the two leg lengths, and the platform point \(P = (x, y)\). The small green arrows
at \(P\) are the **unit leg directions** \(\hat{u}_1, \hat{u}_2\) — the way each leg
points. They look like a detail now; in Lesson 3.1 they become the rows of the
Jacobian.

## 5. Engineering Example

Choosing \(b\) is a real design decision. Our default machine uses a base spacing
of 1.2 m, so \(b = 0.6\) m. Why not tiny or huge?

- **Too small a \(b\):** the legs are nearly parallel and the platform is wobbly
  side-to-side — poor sideways stiffness and an early singularity.
- **Too large a \(b\):** the legs splay out; reaching high requires very long
  cylinders, and the machine gets bulky.

A spacing comparable to the working height is the usual compromise — which is
exactly why our defaults pair \(b = 0.6\) m with a working region around
\(y \approx 0.7\) m.

## 6. Worked Example

Place the platform at \(P = (0.10,\ 0.70)\) with \(b = 0.6\). Compute both leg
lengths:

\[
L_1 = \sqrt{(0.10 + 0.6)^2 + 0.70^2} = \sqrt{0.49 + 0.49} = \sqrt{0.98} = 0.990\ \text{m}
\]
\[
L_2 = \sqrt{(0.10 - 0.6)^2 + 0.70^2} = \sqrt{0.25 + 0.49} = \sqrt{0.74} = 0.860\ \text{m}
\]

With \(L_\text{closed} = 0.4\) m, the strokes are \(s_1 = 0.590\) m and
\(s_2 = 0.460\) m. If the stroke limit is 0.6 m, both are inside the range — this
pose is reachable. Slide \(P\) right and \(L_1\) grows while \(L_2\) shrinks: the
coordinated motion from Lesson 1.1, now in numbers.

## 7. Interactive Demonstration

<iframe src="../../demos/kinematics-explorer.html" title="Kinematics Explorer — interactive demo" loading="lazy" style="width:100%;height:780px;border:1px solid var(--md-default-fg-color--lightest);border-radius:8px;background:#0e1217"></iframe>

[Open this demo full-screen in a new tab ↗](../demos/kinematics-explorer.html){ target=_blank }

Use the **base half-spacing** slider to change \(b\) and watch the whole reachable
region and dexterity field redraw. Then drag the platform and read \(L_1, L_2\) and
the strokes \(s_1, s_2\) live — confirm the worked example above by dragging near
\((0.1, 0.7)\).

## 8. Code & Computation

```python
from math import hypot
b = 0.6
B1, B2 = (-b, 0.0), (+b, 0.0)   # the two base anchors
def ik(x, y):
    return hypot(x - B1[0], y - B1[1]), hypot(x - B2[0], y - B2[1])
L1, L2 = ik(0.10, 0.70)
print(f"L1={L1:.3f} m, L2={L2:.3f} m")   # 0.990, 0.860
```

!!! tip "Run this yourself — three ways"
    The Python above is a ready-to-run cell from the **Module 1 notebook**. Pick whichever is easiest:

    1. **Run in your browser, no setup —** open it in Google Colab and press the ▶ button on each cell: [Open Module 1 in Colab ↗](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module01.ipynb){ target=_blank }
    2. **Run locally —** [view/download the notebook on GitHub ↗](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module01.ipynb){ target=_blank }, then open it in Jupyter, JupyterLab, or VS Code (`pip install notebook`, then `jupyter notebook`).
    3. **Just try the snippet —** copy the code above into any Python 3 prompt; it needs only the standard library.

    See [`src/kinematics/kinematics2dof.js`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/src/kinematics/kinematics2dof.js).

## 9. Knowledge Check

[Open the Lesson 1.2 check ↗](../quizzes/m1-l12.html){ target=_blank }

## 10. Challenge Problem

Suppose you double the base spacing (so \(b = 1.2\) m) but keep the same cylinders.
Sketch or describe what happens to the reachable region and to the leg lengths
needed to reach the point \((0, 0.7)\). Would the platform be stiffer or wobblier
side-to-side? Use the explorer's \(b\) slider to check your prediction.

## 11. Common Mistakes

- **Confusing \(b\) with the full spacing.** \(b\) is *half* the distance between
  anchors. The anchors are \(2b\) apart.
- **Confusing length with stroke.** \(L_i\) is the full anchor-to-platform
  distance; \(s_i = L_i - L_\text{closed}\) is only the piston travel. The
  hydraulics command stroke; the geometry uses length.
- **Forgetting the upper-half rule.** The platform sits *above* the base line
  (\(y > 0\)); the mirror-image solution below is physically the legs folding the
  wrong way.

## 12. Key Takeaways

- The 2-DOF machine is a **2-RPR**: two revolute-prismatic-revolute legs, anchors
  at \((\pm b, 0)\), platform point \(P = (x, y)\).
- **Leg length** \(L_i = \lVert P - B_i\rVert\); **stroke** \(s_i = L_i -
  L_\text{closed}\) is bounded by the cylinder's travel.
- The **half-spacing \(b\)** is a design knob trading stiffness against bulk.
- The **unit leg directions** \(\hat{u}_i\) are quietly introduced here and become
  central in Unit 3.

## AI Learning Companion

**Tutor**
```
Explain the difference between a hydraulic cylinder's "length" and its "stroke"
in a 2-RPR machine, and why a controller commands stroke but geometry uses length.
```
**Practice**
```
Give me 4 practice problems computing leg lengths L1, L2 for a 2-RPR machine with
b = 0.6 m and various platform positions (x, y). Include worked solutions.
```

---

*Next lesson: [2.1 — Inverse Kinematics](2-1-inverse-kinematics.md), where pose → leg lengths becomes a method you can run anywhere in the workspace.*
