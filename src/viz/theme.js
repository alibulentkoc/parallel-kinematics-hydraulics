/**
 * @file theme.js
 * Design tokens + color scales for the visualization layer.
 *
 * Aesthetic: a hydraulic control panel / oscilloscope, not a SaaS dashboard.
 * Dark instrument surface, phosphor-green "safe", amber "warn", red "fault",
 * cyan for commanded/data. Monospace is the native vernacular of telemetry, so
 * the chrome leans mono; the workspace canvas (with its pressure-lit legs and
 * manipulability dead-zone field) is the one place we spend boldness.
 *
 * Color-scale functions are pure (rgb arrays) so they are unit-testable headless.
 */

export const THEME = {
  bg: "#0e1217", // deep instrument slate
  panel: "#151b22",
  panel2: "#1b232c",
  grid: "#22303c", // metric grid hairlines
  rule: "#2c3a47", // dividers
  ink: "#cdd6df", // primary text
  inkDim: "#8a97a3",
  inkFaint: "#5b6975",
  accent: "#39c5e0", // commanded / target / data (cyan)
  accent2: "#c792ea", // secondary series (violet)
  ok: "#3fe0a0", // safe (phosphor green)
  warn: "#ffb454", // near-limit (amber)
  limit: "#ff8c42", // limit (orange)
  fault: "#ff5470", // fault / unreachable (red)
  legBase: "#7f8c99", // unpressurized leg
  fontMono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
  fontSans: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
};

/** Inject theme as CSS custom properties on a root element (browser only). */
export function injectTheme(root = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root) return;
  const map = {
    "--bg": THEME.bg,
    "--panel": THEME.panel,
    "--panel-2": THEME.panel2,
    "--grid": THEME.grid,
    "--rule": THEME.rule,
    "--ink": THEME.ink,
    "--ink-dim": THEME.inkDim,
    "--ink-faint": THEME.inkFaint,
    "--accent": THEME.accent,
    "--accent-2": THEME.accent2,
    "--ok": THEME.ok,
    "--warn": THEME.warn,
    "--limit": THEME.limit,
    "--fault": THEME.fault,
    "--font-mono": THEME.fontMono,
    "--font-sans": THEME.fontSans,
  };
  for (const [k, v] of Object.entries(map)) root.style.setProperty(k, v);
}

/* --- pure color helpers ---------------------------------------------- */

/** "#rrggbb" -> [r,g,b]. */
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** [r,g,b] + alpha -> "rgba(...)". */
export function rgbToCss(rgb, a = 1) {
  return `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Linear blend between two rgb arrays. */
export function lerpColor(c1, c2, t) {
  t = clamp01(t);
  return [c1[0] + (c2[0] - c1[0]) * t, c1[1] + (c2[1] - c1[1]) * t, c1[2] + (c2[2] - c1[2]) * t];
}

/** Piecewise ramp across sorted stops [{t, rgb}]. */
export function rampColor(stops, t) {
  t = clamp01(t);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t <= b.t) {
      const f = (t - a.t) / (b.t - a.t || 1);
      return lerpColor(a.rgb, b.rgb, f);
    }
  }
  return stops[stops.length - 1].rgb;
}

// Pressure: blue (cool) -> amber -> red (hot).
const PRESSURE_STOPS = [
  { t: 0.0, rgb: [42, 111, 151] },
  { t: 0.55, rgb: [233, 196, 106] },
  { t: 1.0, rgb: [230, 84, 112] },
];
/** Map normalized pressure [0,1] to an rgb array. */
export function pressureColor(norm) {
  return rampColor(PRESSURE_STOPS, norm);
}

/**
 * Manipulability "conditioning field" wash: subtle teal where well-conditioned,
 * red where ill-conditioned. Returns {rgb, alpha}; alpha high in the dead zone.
 * @param {number} norm normalized manipulability [0,1] (1 = best)
 */
export function manipWash(norm) {
  norm = clamp01(norm);
  const teal = [57, 197, 224];
  const red = [230, 84, 112];
  const rgb = lerpColor(red, teal, norm);
  const alpha = lerpColor([0.5], [0.06], norm)[0]; // red dead zone is opaque-ish
  return { rgb, alpha };
}

/** Fault severity -> theme color. */
export function severityColor(level) {
  switch (level) {
    case "fault":
      return THEME.fault;
    case "limit":
      return THEME.limit;
    case "warn":
      return THEME.warn;
    default:
      return THEME.ok;
  }
}
