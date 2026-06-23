!!! abstract "Hydraulic Twin · C5 · area ratio φ · Milestone: midterm 2-DOF build (W8)"
    **Artifact contribution:** the area-ratio / force-asymmetry result in the Sizing Report

# Lesson 1.2 — Area Asymmetry φ

!!! note "Why you need this — before the theory"
    The rod steals area from one side, so a cylinder is stronger extending than retracting. Quantifying that asymmetry (φ) is a sizing decision the Hydraulic Sizing Report must defend.

!!! info "Standards — read real documentation"
    Symbols in this lesson follow **ISO 1219 / ANSI Y32.10**. Learn to read them: these are the
    symbols on real hydraulic schematics and datasheets, not course-specific drawings.

---

## 1. Why This Matters

If you assume a cylinder behaves the same in both directions, your force budget,
your speed estimates, and your controller's feedforward will all be wrong — by tens
of percent. The asymmetry is not a defect to ignore; it's a permanent feature of
any rod-on-one-side cylinder, and the ratio φ is how engineers account for it.

## 2. Physical Intuition

Look at the two faces of the piston. The **cap side** is a full circle of oil. The
**rod side** is a circle with a smaller circle (the rod) punched out of it — the rod
passes through that chamber, so oil can only press on the *ring* around it. Less
area on the rod side means: for the same pressure, **less force**; and for the same
flow, **more speed** (the oil has a smaller volume to fill). Extending (pushing on
the big cap face) is therefore strong and slow; retracting (pushing on the small
ring) is weaker and faster.

## 3. Mathematical Foundations

Cap-side (full bore) and rod-side (annulus) areas:

\[
A_\text{cap} = \frac{\pi D^2}{4}, \qquad
A_\text{rod} = \frac{\pi (D^2 - d^2)}{4},
\]

where \(D\) is the bore and \(d\) the rod diameter. The **asymmetry ratio** is their
quotient:

\[
\boxed{\;\varphi = \frac{A_\text{cap}}{A_\text{rod}} = \frac{D^2}{D^2 - d^2}\;}
\]

Because \(d > 0\), the denominator is always smaller than the numerator, so
\(\varphi > 1\) — always. A thicker rod (larger \(d\)) makes φ larger and the
asymmetry more severe.

!!! quote "Equation provenance"
    **Source:** Engine (src/hydraulics, areas, φ) · A3 · B4 · Family 2

## 4. Visual Explanation

![The cap face is a full circle; the rod face is an annulus — hence φ > 1](../figures/A3-cylinder-anatomy.svg)

The two circles at the bottom of the figure are the faces *to scale*: the rod
punches a hole in the rod-side face. The amount of "missing" area is exactly what
makes φ exceed 1.

```mermaid
flowchart LR
    Acap["A_cap = πD²/4<br/>(full circle)"] --> R["φ = A_cap / A_rod"]
    Arod["A_rod = π(D²−d²)/4<br/>(ring)"] --> R
    R --> E["φ > 1 always<br/>strong+slow extend,<br/>weak+fast retract"]
```

## 5. Engineering Example

Our default cylinder: bore \(D = 40\) mm, rod \(d = 22\) mm.

\[
A_\text{cap} = \frac{\pi (40)^2}{4} = 1257\ \text{mm}^2, \quad
A_\text{rod} = \frac{\pi (40^2 - 22^2)}{4} = 877\ \text{mm}^2,
\]
\[
\varphi = \frac{1257}{877} = 1.43.
\]

So this cylinder pushes 43% harder than it pulls, and retracts 43% faster than it
extends. The engine's automated test suite asserts exactly this — it checks
"asymmetry ≈ 1.43."

## 6. Worked Example

Keep the bore at 40 mm but use a *thicker* 28 mm rod. What happens to φ?

\[
A_\text{rod} = \frac{\pi (40^2 - 28^2)}{4} = \frac{\pi (1600 - 784)}{4}
= 641\ \text{mm}^2,
\]
\[
\varphi = \frac{1257}{641} = 1.96.
\]

A thicker rod nearly *doubled* the asymmetry. The rod isn't just a structural part —
its diameter is a design lever on how lopsided the cylinder behaves.

![Force vs area](../figures/B4-force-area.svg)

*Read this directly — it is exported from the simulator at frozen parameters and feeds the artifact.*

## 7. Interactive Demonstration

<iframe src="../../demos/hydraulic-explorer.html" title="Cylinder Asymmetry — interactive demo" loading="lazy" style="width:100%;height:700px;border:1px solid var(--md-default-fg-color--lightest);border-radius:8px;background:#0e1217"></iframe>

[Open this demo full-screen in a new tab](../demos/hydraulic-explorer.html){ target=_blank }

Set bore 40 mm, rod 22 mm and read φ = 1.43. Now drag the rod slider toward 28 mm
and watch φ climb toward ~1.96 while the cap and rod area circles redraw to scale —
the worked example, live.

!!! tip "Use the demo — Observe → Interpret → Apply"
    - **Observe:** Sweep rod diameter; watch φ and the force gap change.
    - **Interpret:** φ = A_cap/A_rod; a fatter rod widens the asymmetry.
    - **Apply:** Pick a rod that keeps φ ≤ 1.6 for your load case.

## 8. Code & Computation

```python
from math import pi
D, d = 0.040, 0.022
A_cap = pi * D**2 / 4
A_rod = pi * (D**2 - d**2) / 4
print(f"A_cap={A_cap*1e6:.0f} mm^2, A_rod={A_rod*1e6:.0f} mm^2, phi={A_cap/A_rod:.2f}")
# thicker 28 mm rod:
print("phi (28 mm rod) =", round((pi*D**2/4)/(pi*(D**2-0.028**2)/4), 2))   # 1.96
```

!!! tip "Run it"
    The code above is self-contained Python (standard library only) — paste it into any Python 3 prompt to run it. To run the whole module interactively with nothing to install, open it in Google Colab (opens in a new browser tab): [Open Module 2 in Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb){ target=_blank }.

!!! success "Verify with the notebook"
    Run **[Notebook N2 — Hydraulics](../notebooks/index.md)** to reproduce these values from the exported CSV. The acceptance test (**φ ≤ 1.6**) is owned by the artifact and stated in **[Handbook Ch 3 — Hydraulic Twin](../handbook/03-hydraulic-twin.md)**; this lesson references it, it is not re-defined here.

## 9. Knowledge Check

[Check your understanding — Quiz 2](../quizzes/quiz-2-hydraulic-sizing.md)

## 10. Challenge Problem

For what rod diameter \(d\) (with bore \(D = 40\) mm) would φ equal exactly 2.0?
(Set \(D^2/(D^2 - d^2) = 2\) and solve for \(d\).) What does φ = 2 mean for the
retract-versus-extend force?

## 11. Common Mistakes

- **Using bore area for both directions.** The rod side is an *annulus*; using the
  full bore overestimates retract force and underestimates retract speed.
- **Thinking φ < 1 is possible.** It never is for a single-rod cylinder — the rod
  can only remove area.
- **Ignoring the rod in speed estimates.** Retract is faster precisely because the
  rod-side area is smaller.

## 12. Key Takeaways

- The rod makes the two piston faces unequal: cap is a full circle, rod side is a
  ring.
- The **asymmetry ratio** \(\varphi = A_\text{cap}/A_\text{rod} = D^2/(D^2 - d^2)\)
  is **always > 1**.
- At defaults (40/22 mm), \(\varphi = 1.43\): 43% stronger and slower extending.
- **Rod diameter** is a design lever on how asymmetric the cylinder is.

## AI Learning Companion

**Tutor**
```
Explain why a hydraulic cylinder's rod side has less area than its cap side, and
why that makes φ = A_cap/A_rod always greater than 1. Use D and d.
```
**Practice**
```
Give me 5 problems computing A_cap, A_rod, and φ for various bore/rod pairs, and
interpreting what φ means for force and speed. Include answers.
```

---

*Next lesson: [1.3 — Force and Speed](1-3-force-and-speed.md), where φ turns into the actual numbers the machine produces.*

