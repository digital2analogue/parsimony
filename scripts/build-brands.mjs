/**
 * Build all brand CSS files including the base dark theme.
 * Usage: node scripts/build-brands.mjs
 *
 * Build order:
 *   1. base — dark phosphor theme (variables.css)
 *   2. decision-engine — light enterprise UI (decision-engine.css)
 *   3. dot-art — pure black canvas (dot-art.css)
 *   4. dot-blog — relaxed reading (dot-blog.css)
 *
 * Each brand merges: primitives + semantic tokens + brand overrides.
 * Brand override values win on any token path they define.
 * Output: build/css/{brand-name}.css
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import StyleDictionary from "style-dictionary";
import baseConfig, {
  decisionEngineConfig,
  dotArtConfig,
  dotBlogConfig,
} from "../style-dictionary.config.mjs";

const brands = [
  { name: "base", config: baseConfig },
  { name: "decision-engine", config: decisionEngineConfig },
  { name: "dot-art", config: dotArtConfig },
  { name: "dot-blog", config: dotBlogConfig },
];

/**
 * Reduced-motion guard — WCAG 2.3.3 (Animation from Interactions).
 * Zeroing the semantic durations collapses every token-driven transition
 * (the composite --motion-transition-* tokens reference these durations),
 * so consumers inherit reduced motion automatically. Infinite animations
 * that don't consume duration tokens (spinner, skeleton, progress, button
 * spinner) carry their own @media guards in the components — the token
 * override cannot reach a hardcoded keyframe duration. See issue #99.
 */
const REDUCED_MOTION_FOOTER = `
/* Reduced motion — WCAG 2.3.3. Token-level guard: every --motion-transition-*
   composite references these durations, so zeroing them stops token-driven
   motion system-wide. Appended by scripts/build-brands.mjs — build/ is
   generated, never hand-edit. */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-instant: 0ms;
    --motion-duration-standard: 0ms;
    --motion-duration-emphasized: 0ms;
  }
}
`;

for (const { name, config } of brands) {
  console.log(`\nBuilding brand: ${name}`);
  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();
  const outFile = name === "base" ? "variables" : name;
  const outPath = resolve(import.meta.dirname, `../build/css/${outFile}.css`);
  const css = readFileSync(outPath, "utf8");
  if (!css.includes("prefers-reduced-motion")) {
    writeFileSync(outPath, css + REDUCED_MOTION_FOOTER);
  }
  console.log(`  -> build/css/${outFile}.css (+ reduced-motion guard)`);
}
