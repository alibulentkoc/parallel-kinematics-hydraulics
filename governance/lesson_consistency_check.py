#!/usr/bin/env python3
"""Lesson Consistency Gate — automated invariant.

Enforces the approved curriculum architecture across every lesson (retroactive + forward).
Stdlib only. Run from the repo root.

  python3 governance/lesson_consistency_check.py [--changed-only] [--json] [PATHS...]

Exit codes: 0 = all PASS · 1 = one or more REVISE · 2 = usage/internal error.
Single source of truth = the maps below; add a module/demo/quiz by editing them.
"""
import sys, os, re, json, subprocess, glob

DOCS = "docs"

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
LEGACY = re.compile(
    r"assets/|_archive-|quizzes/m[0-9]-l|handbook\.md|"
    r"pid-tuning|cylinder-asymmetry|orifice-flow|Units? [0-9]|## Aligned assets"
)
MATH = re.compile(r"\\\(|\$\$")
GRADING_LESSON = "2-2-grading-sim-and-hardware.md"

# asset references the resolver understands (relative to a lesson, i.e. under docs/)
ASSET_REF = re.compile(
    r"\.\./(figures/[A-Za-z0-9_-]+\.svg|demos/[a-z0-9_-]+\.html|"
    r"quizzes/quiz-[0-9a-z-]+\.md|handbook/[0-9a-z-]+\.md|notebooks/index\.md)"
)


def lesson_dir(path):
    parts = path.replace("\\", "/").split("/")
    return parts[parts.index(DOCS) + 1] if DOCS in parts else parts[-2]


def discover():
    out = []
    for d in STAGE:
        out += sorted(glob.glob(os.path.join(DOCS, d, "*.md")))
    return [p for p in out if os.path.basename(p) != "index.md"]


def changed_only():
    try:
        r = subprocess.run(["git", "diff", "--cached", "--name-only"],
                           capture_output=True, text=True, check=True)
    except Exception:
        return []
    files = [f for f in r.stdout.split() if f.endswith(".md")]
    keep = []
    for f in files:
        d = lesson_dir(f)
        if d in STAGE and os.path.basename(f) != "index.md" and os.path.exists(f):
            keep.append(f)
    return keep


def check_lesson(path):
    """Return (list_of_failed_check_names, list_of_broken_asset_refs)."""
    d = lesson_dir(path)
    stage = STAGE.get(d, "?")
    t = open(path, encoding="utf-8").read()
    fails, broken = [], []

    # 1 module/stage ownership
    if not re.search(rf'abstract "{re.escape(stage)} ·', t):
        fails.append("stage")
    # 2 competency in header
    if not re.search(r'abstract "[^"]*(· C[0-9]|infrastructure)', t):
        fails.append("competency")
    # 3 artifact contribution / 4 milestone
    if "Artifact contribution:" not in t:
        fails.append("artifact")
    if "Milestone:" not in t:
        fails.append("milestone")
    # 5 project relevance BEFORE first section heading
    m_sec = re.search(r"\n## ", t)
    m_rel = re.search(r"Why you need this", t)
    if not m_rel or (m_sec and m_rel.start() > m_sec.start()):
        fails.append("project-relevance")
    # 6 equation provenance — only if the lesson contains math
    if MATH.search(t) and "provenance" not in t:
        fails.append("equation-provenance")
    # 7 verification (notebook for twin stages; design-review for hardware)
    if d == "hardware-integration":
        if "Verify at design review" not in t:
            fails.append("verification")
    else:
        if "Verify with the notebook" not in t:
            fails.append("verification")
    # 8 approved quiz
    if not APPROVED_QUIZ.search(t):
        fails.append("quiz")
    # 9 current handbook chapter
    if not re.search(r"\.\./handbook/0[2-6]-|\.\./handbook/index\.md", t):
        fails.append("handbook")
    # 10 no legacy references
    if LEGACY.search(t):
        fails.append("legacy-ref")
    # 11 canonical iframe titles
    for ifr in re.findall(r"<iframe[^>]*>", t):
        s = re.search(r'src="[^"]*?([a-z0-9_-]+\.html)"', ifr)
        ttl = re.search(r'title="([^"]*)"', ifr)
        if s and DEMOTITLE.get(s.group(1)):
            if not ttl or ttl.group(1) != DEMOTITLE[s.group(1)]:
                fails.append("iframe-title")
                break
    # 12 asset resolution (every referenced asset exists on disk)
    for rel in sorted(set(ASSET_REF.findall(t))):
        if not os.path.exists(os.path.join(DOCS, rel)):
            broken.append(rel)
    if broken:
        fails.append("asset-resolution")
    # 13 validation lessons: Measure->Compare->Diagnose->Correct; grading embeds B14 in body
    if d == "module04":
        if "Measure → Compare → Diagnose → Correct" not in t:
            fails.append("validation-sequence")
        if os.path.basename(path) == GRADING_LESSON:
            kc = t.find("## 9")
            b14 = t.find("B14-discrepancy-signatures")
            if b14 == -1 or (kc != -1 and b14 > kc):
                fails.append("discrepancy-artifact-in-body")

    return fails, broken



def check_site_structure():
    """Gate the nav + homepage too (mkdocs.yml, docs/index.md). Returns list of failures."""
    fails = []
    try:
        cfg = open("mkdocs.yml", encoding="utf-8").read()
    except OSError:
        return ["mkdocs.yml-missing"]
    # inspect only the nav: block (not extra_javascript/css/theme asset paths)
    m = re.search(r"^nav:.*?(?=^[A-Za-z_]+:)", cfg, re.S | re.M)
    nav = m.group(0) if m else cfg
    if re.search(r"Units? [0-9]", nav):
        fails.append("nav:unit-framing")
    if "Reference Handbook" in nav:
        fails.append("nav:reference-handbook-label")
    if re.search(r"/archive/|_archive-|handbook\.md|quizzes/m[0-9]-l", nav):
        fails.append("nav:legacy-page-link")
    try:
        home = open(os.path.join(DOCS, "index.md"), encoding="utf-8").read()
        if re.search(r"code pointer|tested source \(`src/`\)", home):
            fails.append("home:src-code-pointer")
        if re.search(r"reference handbook", home, re.I):
            fails.append("home:reference-handbook")
        if re.search(r"Units? [0-9]", home):
            fails.append("home:unit-framing")
    except OSError:
        fails.append("index.md-missing")
    return fails


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    flags = {a for a in argv if a.startswith("--")}
    if not os.path.isdir(DOCS):
        print("error: run from the repo root (no ./docs found)", file=sys.stderr)
        return 2
    if args:
        files = args
    elif "--changed-only" in flags:
        files = changed_only()
    else:
        files = discover()

    results, n_pass, n_rev, links, broken_total = [], 0, 0, 0, 0
    for f in files:
        if not os.path.exists(f):
            continue
        fails, broken = check_lesson(f)
        links += len(set(ASSET_REF.findall(open(f, encoding="utf-8").read())))
        broken_total += len(broken)
        status = "PASS" if not fails else "REVISE"
        if fails:
            n_rev += 1
        else:
            n_pass += 1
        results.append({"lesson": os.path.basename(f), "status": status,
                        "failed_checks": fails, "broken_assets": broken})

    site_fails = check_site_structure() if (not args and "--changed-only" not in flags) else []
    for sf in site_fails:
        print("  REVISE  mkdocs.yml/index.md -> " + sf)
    if site_fails:
        n_rev += 1

    if "--json" in flags:
        print(json.dumps({"results": results, "pass": n_pass, "revise": n_rev,
                          "links_checked": links, "links_broken": broken_total}, indent=2))
    else:
        for r in results:
            if r["status"] == "REVISE":
                detail = ", ".join(r["failed_checks"])
                if r["broken_assets"]:
                    detail += " [broken: " + ", ".join(r["broken_assets"]) + "]"
                print(f"  REVISE  {r['lesson']:34s} -> {detail}")
        print(f"TOTAL={len(results)} PASS={n_pass} REVISE={n_rev} · "
              f"LINKS checked={links} broken={broken_total}")
        if n_rev == 0 and not args and "--changed-only" not in flags:
            print("Lesson Consistency Gate: PASS — all lessons conform.")

    return 1 if (n_rev or site_fails) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
