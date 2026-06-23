# Gate 5B — Engineering Graphics & Symbol Standards Compliance

**Status: MANDATORY directive adopted.** All fluid-power, pneumatic, and electrical graphics
across the curriculum (figures, demos, notebooks, handbook, lessons, quizzes, assessments)
must use recognized standard symbols. No invented symbols, even where a custom graphic would
look clearer — clarity is achieved through annotation and callouts, never by replacing the
standard symbol.

## Standards

- **Hydraulic / pneumatic:** ISO 1219 (ISO 1219-1 symbols), ANSI Y32.10 / ASME equivalent.
- **Electrical:** ANSI / IEEE / IEC symbols.
- **Technical drawings:** standard engineering notation and conventions.

## Standards review checklist (gate before any fluid-power figure/demo is published)

```
□ ISO 1219 compliant
□ ANSI Y32.10 compliant where applicable
□ No custom / invented hydraulic symbols
□ Standard notation used
□ Labels and annotations correct
```

Failure of any item blocks publication. This checklist is now part of the figure/demo review
gate alongside the export specification.

## Single-source rule

A given component uses the **same** standards-compliant symbol everywhere it appears — figure,
demo, notebook, lesson, handbook. No alternate symbol sets.

## Demo rule

Demos may highlight, animate, color, annotate, and explain symbols, but the underlying symbol
stays standards-compliant (e.g., an ISO 1219 4/3 valve symbol with an animated flow path — not
a cartoon valve).

## Assessment rule

Symbol interpretation is now a required competency: quizzes include reading standard symbols,
labs require reading schematics, design reviews and final reports must use standards-compliant
diagrams.

---

## Audit & remediation (this pass)

Every figure and diagram was checked. Items containing fluid-power components were rebuilt to
ISO 1219; items with no schematic symbols (kinematic geometry, plots, workflow box/arrow
diagrams) are compliant as-is.

| Item | Finding | Action |
|---|---|---|
| **A3 cylinder** | non-standard cutaway | **rebuilt** as ISO 1219-1 double-acting single-rod cylinder symbol; area asymmetry shown as annotation (to-scale callout), not a substitute symbol |
| **A4 DCV** | non-standard boxes | **rebuilt** as ISO 1219 4/3 closed-centre, solenoid-operated, spring-centred valve symbol (standard envelope, flow paths, blocked centre, solenoids, springs, P/T/A/B) |
| **A5 HPU** | partially standard | **corrected** to ISO 1219: open-top reservoir, fixed-displacement pump (circle + directional triangle), motor, pressure-relief valve (square + arrow + spring + dashed pilot), filter (diamond + dashed element), gauge; solid working / dashed pilot lines |
| **Family 2 demo — cylinder view** | cartoon cylinder | **rebuilt** as ISO 1219 cylinder symbol; bore/rod sliders now drive a to-scale **area annotation** (cap vs rod circles) beside the fixed symbol — interactivity preserved via annotation |
| A1, A2 (geometry) | kinematic notation, no fluid-power symbols | compliant — no change |
| A6 (manipulability), A7 (PWM waveform), A8 (on/off plot) | concept/plot, no symbols | compliant — no change |
| A9, A10 (workflows) | Category-C box/arrow process diagrams | compliant — no change |
| Family 1, 3, 4 demos | kinematic / control / validation plots, no schematic symbols | compliant — no change |

**Checklist result for the four updated items:** ISO 1219 ✓ · no custom symbols ✓ · standard
notation ✓ · labels/annotations correct ✓.

## Forward application

All remaining Category B exports, Category C diagrams, quizzes, notebooks, handbook, and
lesson prose inherit this directive. Any new fluid-power graphic passes the checklist above
before commit. The single-source rule means these now-standard symbols are the canonical
representation reused everywhere downstream.
