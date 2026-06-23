# PKM Curriculum — Design Guideline & Architecture Review

*A candid description of how this curriculum site was built, the principles behind it,
and — importantly — the known weaknesses. Written so an external architect can quickly
see the decisions and judge the mistakes. It does not gloss over problems.*

---

## 1. What the project is

A browser-based teaching package for **electrohydraulic parallel-kinematics machines**:
a 2-DOF (2-RPR) machine and a 3-DOF (3-RPR) machine. It has two halves:

1. **A simulation engine** — JavaScript (ES modules), ~38 files, ~3,900 lines, with a
   247-check test suite. It powers interactive apps (`instructor.html`, `student.html`,
   `grade.html`) and the demos.
2. **A curriculum site** — MkDocs Material: 4 modules / 23 lessons, a 5-chapter reference
   handbook, 4 interactive demos, 5 SVG figures, 23 quizzes, 4 Python notebooks, and a
   new end-to-end design capstone.

---

## 2. Information architecture

```
Course
├── Modules (4)        Kinematics · Hydraulics · Control · Sim→Hardware
│   └── Units          a module has 2–3 units
│       └── Lessons    23 total (7 / 6 / 5 / 5)
├── Capstone           end-to-end 2-DOF and 3-DOF design walkthroughs
├── Reference Handbook 5 chapters (a parallel, deeper reference)
├── Demos              4 interactive HTML widgets
├── Notebooks          4 Jupyter notebooks + a Python reference
└── Quizzes            23 self-check pages
```

**Decision:** lessons (narrative, sequential) and the handbook (reference, random-access)
are kept as two separate tracks covering the same material at different depths.
*Architect's question: is two parallel tracks clarifying, or is it duplication?*

---

## 3. The lesson template — and its central trade-off

Every one of the 23 lessons uses the **same 12-section template**: objectives → concept →
math → worked example → engineering example → **interactive demonstration** → **figure** →
code & computation → quiz → connections → summary.

- **Upside:** total consistency; a student always knows where to find each thing.
- **Downside (this is the big one):** the template makes a demo *and* a figure
  **mandatory in every lesson**. With only 4 demos and 5 figures for 23 lessons, the
  same asset is reused to fill the slot. **This is the repetition you are seeing, and it
  is a structural mistake, not a content accident.**

---

## 4. Asset strategy — where the repetition comes from (measured)

| Module | Lessons | Distinct demos used | Result |
|---|---|---|---|
| 1 — Kinematics | 7 | **1** (`kinematics-explorer`) | same demo in all 7 lessons; `2-rpr-geometry.svg` in 4 of them |
| 2 — Hydraulics | 6 | 3 | `cylinder-asymmetry` repeated 3×, `orifice-flow` 2× |
| 3 — Control | 5 | ~2 | `pid-tuning` repeated |
| 4 — Hardware | 5 | gallery links | mixed |

**Known bug:** `module02/2-2` (load & pressure) currently embeds the *kinematics* explorer
— the wrong demo.

**Three ways to fix this (an architectural choice):**

1. **Demote demos/figures to module-level resources.** Show each demo **once**, in the
   single lesson where it's most relevant (or on a module overview), and have other
   lessons *link* to it instead of re-embedding. Smallest change; removes ~80 % of the
   repetition immediately.
2. **Build more, lesson-specific assets** — one focused micro-demo/figure per concept.
   Best learning experience; much more authoring work (and more JS to maintain).
3. **Make the demo/figure sections optional** in the template — include a visual only
   where it genuinely adds something, and let other lessons be prose + math + code.

*Recommendation: option 1 now (quick, high impact), option 2 over time for the concepts
that most need their own visual.*

---

## 5. Content & pedagogy principles actually used

- **Evidence-based numbers.** Every figure in the lessons (leg lengths 0.990/0.860 m,
  areas 1257/877 mm², φ = 1.43, 20.1/14.0 kN, 9.6 kW, …) is produced by the engine or the
  Python reference and verified, not asserted.
- **Python for learning, JavaScript for the system.** Lessons teach in runnable Python
  (standard-library only); the production engine stays in JavaScript. *Architect's
  question: does the two-language split help or confuse? It is a real source of friction.*
- **One spec carried end-to-end** (the new capstone) vs. concepts taught in isolation
  (the modules). The capstone was added precisely because the modules never assembled a
  whole machine.

---

## 6. Technical architecture

- **MkDocs Material**, pinned exactly (`mkdocs==1.6.1`, `mkdocs-material==9.7.6`,
  `pymdown-extensions==10.21.2`).
- **Zero external runtime dependencies** by design: MathJax (SVG) and Mermaid are
  **self-hosted**, Google Fonts disabled. The site cannot break because a CDN changed.
- **Deployed via GitHub Actions** (not branch deploy). The simulator apps are bundled into
  `/app/` at build time.
- **Notebooks** are linked to Google Colab / GitHub (static hosting can't *run* `.ipynb`).

---

## 7. Known issues & risks (read this part first)

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | **Demo/figure repetition** across lessons (§4) | High | **open — needs the §4 decision** |
| 2 | Wrong demo embedded in `module02/2-2` | Medium | open (quick fix) |
| 3 | **Math not rendering on the live site** despite a verified-correct local pipeline → almost certainly a deploy/cache issue; needs a browser Network-tab check (is `tex-mml-svg.js` 200/404, or is a cached page still hitting a CDN?) | High | open — needs one check |
| 4 | Handbook depth is uneven — more summary than working reference | Medium | open |
| 5 | Two parallel tracks (lessons + handbook) and two languages (Python + JS) | Design | for review |
| 6 | Wiring originally assumed 400 V / 3-phase as the only option | Medium | fixed (now a labelled choice) |
| 7 | Deploying requires pushing from the handed-over repo zip; commits made in the build sandbox don't reach GitHub until pushed | Process | recurring friction |

---

## 8. What is solid and worth preserving

- The **engine is real and tested** (247 checks); the numbers are trustworthy.
- The build is **dependency-resilient** (fully self-hosted).
- The structure is **consistent and navigable** once the repetition is resolved.
- The **capstone** now gives a genuine end-to-end design for both machines.

---

## 9. Decisions to bring to the architect

1. **§4 repetition:** option 1, 2, or 3 — or a mix?
2. **Lesson template:** keep all 12 sections mandatory, or make demo/figure/quiz optional?
3. **Two tracks:** keep lessons + handbook separate, merge, or cross-link more tightly?
4. **Two languages:** is Python-teaches / JavaScript-runs acceptable, or should the engine
   be reimplemented in one language?
5. **Handbook:** invest in turning it into a true design reference (sizing tables,
   procedures), or fold its unique content into the capstone?
