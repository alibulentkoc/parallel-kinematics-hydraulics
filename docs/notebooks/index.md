# Python & Jupyter Notebooks

Every lesson's worked example is also a **runnable Python cell**. These notebooks
reproduce each module's calculations using only Python's standard library — there
is **nothing to `pip install`** to make them run, so they can't break when a
package updates.

## Run them — pick whichever is easiest

You do **not** have to install anything. Three ways, easiest first:

**1. Run in your browser (Google Colab, zero setup).** Opens the notebook and runs
it online — just press the ▶ button on each cell, top to bottom.

- [▶ Module 1 — Kinematics, in Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module01.ipynb)
- [▶ Module 2 — Hydraulic Actuation, in Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb)
- [▶ Module 3 — Closed-Loop Control, in Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module03.ipynb)
- [▶ Module 4 — From Simulator to Hardware, in Colab](https://colab.research.google.com/github/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module04.ipynb)

**2. Run locally in Jupyter / VS Code.** View or download each notebook on GitHub
(the **Download raw file** button on that page saves the `.ipynb`), then open it:

```bash
pip install notebook        # one-time, only for the Jupyter interface
jupyter notebook            # then open the downloaded module0N.ipynb
```

- [View/download on GitHub — Module 1](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module01.ipynb) · [Module 2](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module02.ipynb) · [Module 3](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module03.ipynb) · [Module 4](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/module04.ipynb)

**3. Just copy the snippet.** Every lesson's *Code & Computation* box shows the
same Python — paste it into any Python 3 prompt. It needs only the standard library.

## Reference module

[`pkm_reference.py`](https://github.com/alibulentkoc/parallel-kinematics-hydraulics/blob/main/docs/notebooks/pkm_reference.py) collects all the formulas in one small,
dependency-free file. Run `python pkm_reference.py` to print the headline numbers
used throughout the course, or import the functions into your own scripts.

!!! note
    The notebooks are **illustrative reference implementations** in Python. The
    production simulation engine is written in JavaScript (the `src/` tree); each
    lesson's *Code & Computation* section links the matching engine source.
