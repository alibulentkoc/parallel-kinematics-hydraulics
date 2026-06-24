# Spec — `lesson_consistency_check.py` + CI + pre-commit

Status: **IMPLEMENTED** (script + CI + hook committed; see §10).
Goal: turn the Lesson Consistency Gate into an automated invariant that fails the build on drift —
the same failures we hit by hand (stale iframe titles, `handbook.md`, archived `assets/`, removed
demos, breadcrumb/Unit drift).

---

## 1. Deliverables (once approved)

1. `governance/lesson_consistency_check.py` — standalone, stdlib-only, no pip deps.
2. `.github/workflows/lesson-consistency.yml` — CI job on push + pull_request.
3. Pre-commit integration (one of two options — **decision needed**, see §7).

---

## 2. Scope of files checked

- **Lessons:** `docs/module01..04/*.md` and `docs/hardware-integration/*.md`, excluding `index.md`.
- **Asset resolution root:** `docs/` (so `../figures/X.svg` in a lesson → `docs/figures/X.svg`).
- Forward-proof: new module dirs are picked up by adding one entry to the `STAGE` map (§4).

---

## 3. Checks enforced (maps to the 10 rules / 13 fields)

| # | Check | Rule |
|---|---|---|
| 1 | Header stage matches the lesson's module dir (`STAGE[dir]`) | Module ownership |
| 2 | Header carries a Competency (`· C#` or `infrastructure`) | Artifact contribution |
| 3 | `Artifact contribution:` present | Artifact contribution |
| 4 | `Milestone:` present | Artifact contribution |
| 5 | Project-relevance note (`Why you need this`) present, **before first `##` section** | Project relevance |
| 6 | Equation provenance present **iff** the lesson contains math (`\(` or `$$`) | Equation provenance |
| 7 | Notebook verify (`Verify with the notebook`) — or `Verify at design review` for Hardware | Verification |
| 8 | Quiz link in the approved set `quiz-{1..6}-*` | Quiz linkage |
| 9 | Handbook link to a current chapter (`handbook/0[2-6]-*` or `handbook/index.md`) | Handbook linkage |
| 10 | **No legacy refs:** `assets/`, `_archive-`, `m*-l*.html`, `handbook.md`, `pid-tuning`, `cylinder-asymmetry`, `orifice-flow`, `Unit N`, `## Aligned assets` | Asset sync / naming |
| 11 | **Canonical iframe title:** every `<iframe>` title == `DEMOTITLE[src]` | Canonical naming |
| 12 | **Asset resolution:** every figure/demo/quiz/handbook/notebook ref resolves on disk | Asset sync |
| 13 | **Validation sequence:** module04 lessons contain `Measure → Compare → Diagnose → Correct` | Validation lessons |

Notes on two refinements vs the by-hand audit:
- **Check 6** becomes conditional on math presence (a future lesson with no equations is not forced to
  carry a provenance block). Current 23 lessons all have math + provenance, so behavior is unchanged.
- **Check 13** additionally asserts the grading lesson embeds the Twin Discrepancy Analysis figure
  (`B14-discrepancy-signatures`) in the body (before `## 9`). (Decision: keep this grading-specific,
  or require the discrepancy artifact in every validation lesson? — see §7.)

---

## 4. Canonical maps (single source of truth, top of script)

```python
STAGE = {
  "module01": "Kinematic Twin", "module02": "Hydraulic Twin",
  "module03": "Control Twin", "module04": "Validation Twin",
  "hardware-integration": "Hardware Integration",
}
DEMOTITLE = {
  "kinematics-explorer.html":     "Kinematics Explorer — interactive demo",
  "hydraulic-explorer.html":      "Hydraulic Explorer — interactive demo",
  "pwm-control-lab.html":         "PWM / Control Lab — interactive demo",
  "digital-twin-validation.html": "Digital Twin Validation Lab — interactive demo",
}
APPROVED_QUIZ = re.compile(r"quizzes/quiz-[1-6]-")
LEGACY = re.compile(r"assets/|_archive-|quizzes/m[0-9]-l|handbook\.md|"
                    r"pid-tuning|cylinder-asymmetry|orifice-flow|Unit [0-9]|## Aligned assets")
```
Adding a module / demo / quiz = edit these maps only.

---

## 5. CLI contract

```
python3 governance/lesson_consistency_check.py [--changed-only] [--json] [PATHS...]
```
- No args → scan all lessons in scope.
- `--changed-only` → scan only staged/changed lesson files (for the hook); resolves via
  `git diff --cached --name-only` (hook) or `git diff --name-only origin/main...` (CI PR).
- `PATHS...` → explicit files (overrides discovery).
- `--json` → machine-readable report for CI annotations.

**Exit codes:** `0` = all PASS · `1` = one or more lessons REVISE · `2` = usage/internal error.

**Human output:** per-failing-lesson list of failed check names, then a summary line
`TOTAL=n PASS=p REVISE=r · LINKS checked=c broken=b`. Clean run prints the summary and exits 0.

---

## 6. CI job (sketch — `.github/workflows/lesson-consistency.yml`)

```yaml
name: lesson-consistency
on:
  push: { branches: [main] }
  pull_request: {}
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }       # needed for PR diff
      - uses: actions/setup-python@v5
        with: { python-version: "3.x" }
      - run: python3 governance/lesson_consistency_check.py
```
Full-tree by default (cheap: ~23 files). PR-diff mode is available via `--changed-only` if you
prefer faster, scoped feedback — **decision in §7**.

---

## 7. Decisions needed before implementation

1. **Pre-commit mechanism:** (a) `pre-commit` framework via `.pre-commit-config.yaml` (nice UX, adds a
   dev dependency), or (b) a tracked `governance/hooks/pre-commit` raw script + a one-line installer
   (`git config core.hooksPath governance/hooks`, zero deps). Recommendation: **(b)**, consistent with
   the project's no-extra-deps posture.
2. **CI scope:** full-tree (simple, deterministic) vs `--changed-only` PR diff (faster). Recommendation:
   **full-tree** — 23 files is trivial and avoids missing cross-file breakage.
3. **Discrepancy artifact strictness (check 13):** require `B14` in the grading lesson only (current
   behavior) vs in every validation lesson. Recommendation: **grading-lesson only** (that is where
   diagnosis is taught; 1.1/2.1 reference it).
4. **Soft-fail provenance (check 6):** conditional on math presence (recommended) vs always-required.

---

## 8. Validation plan (run at implementation time)

1. Run against current tree → expect `exit 0`, `23/23 PASS, 129 links 0 broken`.
2. Smoke-test each failure class by temporarily breaking one lesson (stale iframe title; `handbook.md`
   link; `assets/` ref; removed-demo src; `Unit 2` breadcrumb) → expect `exit 1` naming the right check.
3. Revert smoke edits; confirm clean.
4. Commit script + CI; confirm the Action runs green on the resulting push.

---

## 9. Out of scope (kept separate)

- Engine `npm test` (already its own gate).
- MkDocs build/link-render (could be a second CI job later; this gate is content-consistency only).
- Prose quality / pedagogy (human review).

---

## 10. Implementation record

- `governance/lesson_consistency_check.py` — stdlib-only gate (13 checks, maps as single source of truth).
- `.github/workflows/lesson-consistency.yml` — full-tree CI on push + pull_request.
- `governance/hooks/pre-commit` (mode 100755) + `governance/hooks/README.md` — enable with
  `git config core.hooksPath governance/hooks`.
- Validated: clean tree → 23/23 PASS, 129 links, exit 0. Deliberate-fail smoke tests confirmed
  exit 1 with correct check names for: iframe-title, legacy-ref (`assets/`, `handbook.md`), stage,
  validation-sequence, discrepancy-artifact-in-body, asset-resolution (broken approved-namespace ref).
