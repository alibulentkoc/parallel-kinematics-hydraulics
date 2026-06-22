/* MathJax v3 configuration for pymdownx.arithmatex (generic mode).
 * Robust against load-order races: only typesets once both the
 * mkdocs-material document observable AND MathJax are ready. */
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};

function pkmTypeset() {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.startup.output.clearCache();
    MathJax.typesetClear();
    MathJax.texReset();
    MathJax.typesetPromise();
  }
}

// Re-typeset on every (instant) navigation in mkdocs-material.
if (typeof document$ !== "undefined") {
  document$.subscribe(() => pkmTypeset());
}
