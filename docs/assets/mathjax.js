/* MathJax v3.2.2 configuration for pymdownx.arithmatex (generic mode).
 * Output: SVG (self-contained — glyphs are embedded as paths, so NO web fonts
 * and NO network requests are needed at runtime). The engine itself is vendored
 * locally at javascripts/mathjax/tex-mml-svg.js, so the site has zero external
 * runtime dependencies for math and cannot break if a CDN changes or is blocked. */
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  svg: { fontCache: "global" },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
    enableMenu: false,
  },
  startup: {
    typeset: true,            // typeset the first page on load
  },
};

// Re-typeset on mkdocs-material's (instant) navigation, guarded so it never
// throws if it fires before the engine has finished loading.
function pkmTypeset() {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetClear();
    MathJax.texReset();
    MathJax.typesetPromise();
  }
}
if (typeof document$ !== "undefined") {
  document$.subscribe(() => pkmTypeset());
}
