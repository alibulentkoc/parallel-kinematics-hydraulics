# Gate 5B — Standards-Compliance Report (FC-5)

Verification that **ISO 1219** (fluid-power graphic symbols) and **ANSI Y32.10** are applied
consistently wherever hydraulic schematics appear, across every surface of the curriculum.

## Result: COMPLIANT

| Surface | Evidence | Status |
|---|---|---|
| **Figures** | A3 (cylinder anatomy), A4 (4/3 DCV states), A5 (HPU architecture) each declare ISO 1219 / ANSI Y32.10 in-figure | **PASS** |
| **Demos** | Family 2 (hydraulic-explorer) renders the ISO 1219 circuit and declares the standard | **PASS** |
| **Quizzes** | Quiz 2 (hydraulic sizing) tests reading of A3/A4/A5 ISO symbols; Quiz 3 references the DCV symbol | **PASS** |
| **Handbook** | Ch 3 (Hydraulic Twin) and the orientation index state the standard; schematics use ISO symbols | **PASS** |
| **Lessons** | All 6 Module 2 lessons carry an explicit "Symbols follow ISO 1219 / ANSI Y32.10" note; the ISO 4/3 DCV (A4) is in the body of the valve lesson | **PASS** |

## Scope notes

- ISO 1219 / ANSI Y32.10 are **fluid-power** symbol standards; they apply to the hydraulic
  schematics (cylinder, DCV, pump/relief, HPU). They are enforced in Module 2, Family 2, the
  canonical A3/A4/A5 figures, Quiz 2, and Handbook Ch 3.
- **Hardware Integration** (electrical I/O, sensors, wiring, safety chain) is the **signal/power**
  domain; its reference home is **Handbook Appendix A** (channel maps and BOM tables), which is
  electrical rather than fluid-power and therefore outside the ISO 1219 scope by design.
- Kinematic and Control schematic content uses the project's canonical figure set (A1/A2/A6 and
  A7/A8) rather than fluid-power symbols, which is correct for those domains.

## Conclusion

The fluid-power identity of the curriculum is standards-compliant everywhere it appears. Students
read **real ISO 1219 / ANSI Y32.10 documentation**, not course-specific graphics.
