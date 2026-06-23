# Python & Jupyter Notebooks

Every lesson's worked example is also a **runnable Python cell**. The notebooks
reproduce each module's calculations using only Python's standard library — there
is **nothing to `pip install`**, so they can't break when a package updates.

## View the notebooks (rendered on GitHub)

GitHub renders notebooks with their output, and every page has a **Download**
button (the **⋯ → Download** or **Raw** option) if you want to run them locally.

- [Module 1 — Kinematics](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module01.ipynb) — inverse/forward kinematics, the Jacobian, singularities
- [Module 2 — Hydraulic Actuation](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb) — areas, asymmetry φ, force/speed, valve flow, power
- [Module 3 — Closed-Loop Control](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module03.ipynb) — the error signal, a PID, a step-response simulation
- [Module 4 — From Simulator to Hardware](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module04.ipynb) — signal scaling, safety guards, logging, grading

## Reference module

- [`pkm_reference.py`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/pkm_reference.py) — all the formulas in one small, dependency-free file. Run `python pkm_reference.py` to print the headline numbers used throughout the course.

## How to run them

These need only Python 3 (standard library). To use the Jupyter interface:

```bash
pip install notebook        # one-time, optional — only for the Jupyter UI
jupyter notebook            # then open any module0N.ipynb
```

They also open directly in JupyterLab, VS Code, or Google Colab. The first cell
defines everything; run top to bottom.

!!! note
    The notebooks are **illustrative reference implementations** in Python. The
    production simulation engine is written in JavaScript (the `src/` tree); each
    lesson's *Code & Computation* section links the matching engine source.
