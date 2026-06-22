# Python & Jupyter Notebooks

Every lesson's worked example is also a **runnable Python cell**. The notebooks
below reproduce the calculations from each module using only Python's standard
library — there is **nothing to `pip install`**, so they can't break when a package
updates.

## Download the notebooks

- [Module 1 — Kinematics](module01.ipynb) — inverse/forward kinematics, the Jacobian, singularities
- [Module 2 — Hydraulic Actuation](module02.ipynb) — areas, asymmetry φ, force/speed, valve flow, power
- [Module 3 — Closed-Loop Control](module03.ipynb) — the error signal, a PID, a step-response simulation
- [Module 4 — From Simulator to Hardware](module04.ipynb) — signal scaling, safety guards, logging, grading

## Reference module

- [`pkm_reference.py`](pkm_reference.py) — all the formulas in one small, dependency-free file. Run `python pkm_reference.py` to print the headline numbers used throughout the course, or `from pkm_reference import inverse_kinematics, asymmetry, valve_flow` in your own scripts.

## How to run them

These need only Python 3 (standard library). If you also want the Jupyter interface:

```bash
pip install notebook        # one-time, optional — only for the Jupyter UI
jupyter notebook            # then open any module0N.ipynb
```

Or open them in any environment that runs notebooks (JupyterLab, VS Code, Google Colab). The first cell defines everything; run top to bottom.

!!! note
    The notebooks are **illustrative reference implementations** in Python. The
    production simulation engine is written in JavaScript (the `src/` tree); each
    lesson's *Code & Computation* section links the matching engine source.
