/**
 * contrast.mjs — check_contrast + validate_brand (MCP) logic.
 *
 * The design system is WCAG-AA-first (ai/rules.md hard rule #6; the consumer
 * repos run their own check-contrast gates). These two tools expose that check
 * directly through the MCP instead of as a side effect of check_assembly.
 *
 * Single-source: the WCAG relative-luminance math lives once in assembly.mjs
 * (contrastRatio); colour resolution comes from tokens.mjs. Nothing is
 * re-implemented here.
 */

import { resolveToken, toCssVar } from './tokens.mjs';
import { contrastRatio } from './assembly.mjs';

// WCAG 2.x thresholds.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;
const AAA_NORMAL = 7.0;
const AAA_LARGE = 4.5;

// WCAG "large text": ≥ 24px, or ≥ 18.66px (14pt) when bold.
const LARGE_PX = 24;
const LARGE_BOLD_PX = 18.66;

const HEX6 = /^#?[0-9a-fA-F]{6}$/;

/** A CSS length string/number → px (rem/em assume a 16px root). null if unparseable. */
function toPx(fontSize) {
  if (fontSize == null) return null;
  if (typeof fontSize === 'number') return fontSize;
  const m = /^([\d.]+)\s*(px|rem|em)?$/.exec(String(fontSize).trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
}

/**
 * Resolve a colour input to a #rrggbb value. Accepts a hex literal, a CSS custom
 * property (--color-…), or a dotted token path (color.…). Applies a sub-brand's
 * overrides when `brand` is given.
 * @returns {{ value: string, token: string|null }|null} null if the token is unknown
 */
function resolveColor(store, cssToPath, input, brand) {
  const s = String(input).trim();
  if (HEX6.test(s)) return { value: s.startsWith('#') ? s : `#${s}`, token: null };
  const path = s.startsWith('--') ? cssToPath.get(s) : store.base.has(s) ? s : null;
  if (!path) return null;
  const tok = resolveToken(store, path, { brand });
  return tok ? { value: tok.value, token: toCssVar(path) } : null;
}

function cssToPathMap(store) {
  const m = new Map();
  for (const path of store.base.keys()) m.set(toCssVar(path), path);
  return m;
}

/**
 * Contrast ratio + AA/AAA verdict for a foreground/background pair.
 * @param {object} store   loadTokens() result
 * @param {object} input   { foreground, background, brand?, fontSize?, bold? }
 * @returns {object} verdict, or { error } for an unknown token, or
 *   { opinion:false } when a value isn't a flat hex (gradient / color-mix).
 */
export function checkContrast(store, { foreground, background, brand, fontSize, bold = false } = {}) {
  const cssToPath = cssToPathMap(store);
  const fg = resolveColor(store, cssToPath, foreground, brand);
  const bg = resolveColor(store, cssToPath, background, brand);
  if (!fg) return { error: `Unknown colour or token: ${foreground}` };
  if (!bg) return { error: `Unknown colour or token: ${background}` };

  const px = toPx(fontSize);
  const largeText = px != null && (px >= LARGE_PX || (bold && px >= LARGE_BOLD_PX));
  const ratio = contrastRatio(fg.value, bg.value);

  const base = {
    foreground: fg.token ?? fg.value,
    background: bg.token ?? bg.value,
    foregroundValue: fg.value,
    backgroundValue: bg.value,
    ...(brand ? { brand } : {}),
    largeText,
  };

  if (ratio === null) {
    // A resolved value wasn't a flat 6-digit hex (gradient, color-mix, …).
    return { ...base, opinion: false, note: 'One value is not a flat hex colour — no contrast opinion.' };
  }

  const aa = largeText ? AA_LARGE : AA_NORMAL;
  const aaa = largeText ? AAA_LARGE : AAA_NORMAL;
  return {
    ...base,
    ratio: Math.round(ratio * 100) / 100,
    threshold: aa,
    passesAA: ratio >= aa,
    passesAAA: ratio >= aaa,
  };
}

// Base text roles that sit on the page surfaces (background default/alt).
const BASE_TEXT = ['default', 'alt', 'muted', 'action'];
const BASE_SURFACES = ['color.background.default', 'color.background.alt'];

/**
 * The foreground/background token pairs the system *intends* to be used together,
 * derived by naming convention from the base color tokens. v1 covers only the
 * pairings where a failure is unambiguously a bug:
 *   - foreground.on-<role>  →  background.<role>   ("text ON the <role> fill")
 *   - foreground.{default,alt,muted,action}  →  background.{default,alt}  (text on surfaces)
 * foreground.disabled is exempt (WCAG exempts disabled controls).
 *
 * Deliberately NOT covered: the accent family (foreground.accent-* /
 * accent-on-* over background.accent-* / accent-*-bold). The accent taxonomy has
 * both subtle (`accent-green`) and bold (`accent-green-bold`) fills and its
 * fg/bg names aren't cleanly parallel, so convention-derived pairing mis-matches
 * (producing impossible <2:1 "failures"). Auditing accent pairings needs an
 * explicit pairing map — see the contrast-tooling decision entry. Same "no
 * opinion outside the known rules" stance as check_assembly.
 */
export function intendedPairings(store) {
  const has = (p) => store.base.has(p);
  const pairs = [];
  const add = (fg, bg) => { if (has(fg) && has(bg)) pairs.push({ fg, bg }); };

  for (const path of store.base.keys()) {
    if (!path.startsWith('color.foreground.')) continue;
    const seg = path.slice('color.foreground.'.length);
    if (seg.startsWith('on-')) {
      add(path, `color.background.${seg.slice(3)}`);
    } else if (BASE_TEXT.includes(seg)) {
      for (const bg of BASE_SURFACES) add(path, bg);
    }
    // accent-* and disabled: out of v1 scope (see doc comment).
  }
  return pairs;
}

/**
 * Validate that every intended foreground/background pairing keeps WCAG AA
 * (4.5:1, normal text) once a sub-brand's overrides are applied. Catches the
 * classic regression: a brand re-tints a background but not its on-colour.
 * @returns {object|null} null if the brand is unknown
 */
export function validateBrand(store, brand) {
  if (!store.brands.has(brand)) return null;
  const failures = [];
  const pairs = intendedPairings(store);
  for (const { fg, bg } of pairs) {
    const fgVal = resolveToken(store, fg, { brand })?.value;
    const bgVal = resolveToken(store, bg, { brand })?.value;
    const ratio = fgVal && bgVal ? contrastRatio(fgVal, bgVal) : null;
    if (ratio !== null && ratio < AA_NORMAL) {
      failures.push({
        foreground: toCssVar(fg),
        background: toCssVar(bg),
        ratio: Math.round(ratio * 100) / 100,
        threshold: AA_NORMAL,
      });
    }
  }
  failures.sort((a, b) => a.ratio - b.ratio);
  return { brand, checkedPairs: pairs.length, failures, valid: failures.length === 0 };
}
