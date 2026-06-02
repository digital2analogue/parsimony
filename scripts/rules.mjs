/**
 * rules.mjs — the single source of truth for design-system lint rules.
 *
 * Every checker imports from here:
 *   - scripts/validate.mjs        (lints component source on build)
 *   - scripts/drift-lint.mjs      (scans consumer repos, used by the CI Action)
 *   - packages/mcp/src/server.mjs (the agent-facing check_usage tool)
 *
 * Before this module existed, each of those re-implemented the same regexes
 * by hand and they had already drifted apart. If a rule needs to change,
 * change it once, here.
 */

// ── Patterns ────────────────────────────────────────────────────────────────

// Valid CSS hex colors: 3, 4, 6, or 8 digits. (Catches #RGBA / #RRGGBBAA too.)
const HEX = '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b';
// Primitive token references — never allowed in UI/component code.
const PRIMITIVE = '--primitive-[a-z][a-z-]*';
// Hardcoded numeric font-size (e.g. `font-size: 14px`) — use font tokens.
const FONT_SIZE = 'font-size:\\s*[0-9]';

// Deprecated tokens — removed from the system; flag any lingering references.
// See ai/DECISION-ENGINE.md "Tokens That Were Deleted".
export const DEPRECATED_TOKENS = [
  '--color-foreground-accent',
  '--color-background-accent',
  '--color-foreground-on-accent',
  '--color-foreground-primary',
  '--color-feedback-error',
  '--color-feedback-danger-foreground',
  '--color-foreground-accent-red',
  '--color-foreground-on-accent-red',
  '--color-state-hover',
];

// Lines matching these are exempt from the hex rule (false positives).
export const HEX_ALLOWLIST = [
  /url\(#/,           // SVG fragment IDs, e.g. fill="url(#grad)"
  /sourceMappingURL/, // source maps
];

/**
 * The canonical rule set. `id` is stable for programmatic use; `message` is
 * what humans and agents see. `test` finds matches in a string.
 */
export const RULES = [
  {
    id: 'no-hex',
    hardRule: 1,
    message: 'No hardcoded colors — use var(--color-*) custom properties',
    find: (text) => matchAll(text, HEX),
    allowlist: HEX_ALLOWLIST,
  },
  {
    id: 'no-primitive',
    hardRule: 9,
    message: 'Never reference primitive tokens (--primitive-*) in UI code — use the semantic layer',
    find: (text) => matchAll(text, PRIMITIVE),
  },
  {
    id: 'no-hardcoded-font-size',
    hardRule: 8,
    message: 'No hardcoded font sizes — use var(--font-size-*) primitives or a font shorthand token',
    find: (text) => matchAll(text, FONT_SIZE),
  },
  {
    id: 'deprecated-token',
    hardRule: null,
    message: 'Deprecated token — see ai/DECISION-ENGINE.md "Tokens That Were Deleted"',
    find: (text) => DEPRECATED_TOKENS.filter((t) => text.includes(t)),
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

// Fresh regex per call so the global lastIndex never leaks between scans.
function matchAll(text, pattern) {
  return text.match(new RegExp(pattern, 'g')) ?? [];
}

function allowlisted(rule, line) {
  return rule.allowlist?.some((re) => re.test(line)) ?? false;
}

// ── Public linters ──────────────────────────────────────────────────────────

/**
 * Lint a snippet (the agent-facing check_usage path).
 * Returns one entry per violated rule: { id, rule, matches }.
 */
export function lintSnippet(text) {
  const violations = [];
  for (const rule of RULES) {
    const matches = [...new Set(rule.find(text))];
    if (matches.length > 0) {
      violations.push({ id: rule.id, rule: rule.message, matches });
    }
  }
  return violations;
}

/**
 * Lint file content line by line (validate + drift scanning).
 * Returns one entry per offending line: { line, id, rule, match }.
 */
export function lintLines(text) {
  const violations = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (allowlisted(rule, line)) continue;
      const matches = rule.find(line);
      if (matches.length > 0) {
        violations.push({ line: i + 1, id: rule.id, rule: rule.message, match: matches[0] });
      }
    }
  });
  return violations;
}
