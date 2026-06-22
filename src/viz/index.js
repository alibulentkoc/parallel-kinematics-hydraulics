/**
 * @file index.js
 * Public surface of the visualization module.
 */
export { THEME, injectTheme, pressureColor, manipWash, severityColor, rampColor, lerpColor, hexToRgb, rgbToCss } from "./theme.js";
export { ViewTransform, computeWorldBounds } from "./transform.js";
export { sampleField, renderFieldToCanvas } from "./heatmap.js";
export { StripChart } from "./stripchart.js";
export { WorkspaceRenderer } from "./workspace.js";
export { RenderLoop } from "./loop.js";
