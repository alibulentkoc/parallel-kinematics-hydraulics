# Git hooks — Lesson Consistency Gate

Enable the pre-commit hook once per clone:

```sh
git config core.hooksPath governance/hooks
```

After that, `pre-commit` runs `lesson_consistency_check.py --changed-only` on every commit and
blocks it if any staged lesson fails the gate. The same script runs full-tree in CI
(`.github/workflows/lesson-consistency.yml`) on every push and pull request.

To run the gate manually at any time:

```sh
python3 governance/lesson_consistency_check.py          # full tree
python3 governance/lesson_consistency_check.py --json   # machine-readable
```
