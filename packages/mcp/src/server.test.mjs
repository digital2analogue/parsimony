/**
 * Smoke tests for MCP server tool logic.
 * Tests the data and lint functions directly without starting the MCP transport.
 * The lint logic is imported from the shared rule module — no local copy.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lintSnippet, DEPRECATED } from '../../../scripts/rules.mjs';
import { loadTokens, resolveToken, findTokens, tokensUnder, toCssVar } from '../../../scripts/tokens.mjs';
import {
  parseRules, loadRules, findRules, getRule,
  parseDecisions, loadDecisions, findDecisions, getDecision,
} from '../../../scripts/reasoning.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const designSystem = JSON.parse(readFileSync(resolve(ROOT, 'design-system.json'), 'utf8'));
const tokenStore = await loadTokens();
const rules = loadRules();
const decisions = loadDecisions();

// ── Tests ───────────────────────────────────────────────────────────────────

describe('list_components', () => {
  it('returns rr-badge', () => {
    const list = designSystem.components.map((c) => ({ name: c.name, summary: c.summary }));
    expect(list.some((c) => c.name === 'rr-badge')).toBe(true);
  });
});

describe('get_component', () => {
  it('finds rr-badge by name', () => {
    const component = designSystem.components.find((c) => c.name === 'rr-badge');
    expect(component).toBeDefined();
    expect(component.props).toHaveLength(1);
    expect(component.props[0].name).toBe('variant');
    expect(component.tokensUsed.length).toBeGreaterThan(0);
    expect(component.accessibility.wcag).toContain('1.4.3 Contrast (Minimum)');
  });

  it('returns undefined for unknown component', () => {
    const component = designSystem.components.find((c) => c.name === 'rr-nope');
    expect(component).toBeUndefined();
  });
});

describe('check_usage (via shared rules)', () => {
  it('detects hex literals', () => {
    const v = lintSnippet('color: #4ADE6E;');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('no-hex');
    expect(v[0].matches).toContain('#4ADE6E');
  });

  it('detects primitive tokens', () => {
    const v = lintSnippet('var(--primitive-color-green-accent)');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('no-primitive');
  });

  it('detects deprecated tokens', () => {
    const v = lintSnippet('var(--color-foreground-accent)');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('deprecated-token');
  });

  it('passes clean snippet', () => {
    const v = lintSnippet('color: var(--color-foreground-default);');
    expect(v).toHaveLength(0);
  });

  it('detects multiple violations', () => {
    const v = lintSnippet('color: #fff; border: 1px solid var(--primitive-color-gray-200);');
    expect(v).toHaveLength(2);
  });
});

describe('get_token (via tokens.mjs)', () => {
  it('resolves a semantic color to its primitive value', () => {
    const t = resolveToken(tokenStore, 'color.background.alt');
    expect(t).not.toBeNull();
    expect(t.cssProperty).toBe('--color-background-alt');
    expect(t.value).toBe('#1E241E');
    expect(t.primitive).toBe('primitive.color.green.900');
    expect(t.usage.length).toBeGreaterThan(0);
  });

  it('surfaces sub-brand overrides', () => {
    // dot-art overrides the page canvas to pure black.
    const t = resolveToken(tokenStore, 'color.background.default');
    expect(t.brands?.['dot-art']).toBe('#000000');
  });

  it('applies a brand override layer when asked', () => {
    const base = resolveToken(tokenStore, 'color.background.default');
    const art = resolveToken(tokenStore, 'color.background.default', { brand: 'dot-art' });
    expect(base.value).not.toBe('#000000');
    expect(art.value).toBe('#000000');
  });

  it('returns null for an unknown token', () => {
    expect(resolveToken(tokenStore, 'color.background.nope')).toBeNull();
  });

  it('toCssVar round-trips a dotted path', () => {
    expect(toCssVar('color.background.action-hover')).toBe('--color-background-action-hover');
  });
});

describe('find_token (via tokens.mjs)', () => {
  it('finds the card background by intent, not name', () => {
    const hits = findTokens(tokenStore, 'card background');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.name === 'color.background.alt')).toBe(true);
  });

  it('ranks name matches ahead of usage-only matches', () => {
    const hits = findTokens(tokenStore, 'spacing');
    expect(hits[0].match).toBe('name');
  });

  it('returns nothing for gibberish', () => {
    expect(findTokens(tokenStore, 'zzzznotarealtoken')).toHaveLength(0);
  });
});

describe('get_spacing (via tokens.mjs)', () => {
  it('returns the full scale with resolved values and usage', () => {
    const scale = tokensUnder(tokenStore, 'spacing');
    expect(scale.length).toBeGreaterThanOrEqual(10);
    const micro = scale.find((t) => t.cssProperty === '--spacing-micro');
    expect(micro.value).toBe('4px');
    expect(micro.usage.length).toBeGreaterThan(0);
  });
});

describe('deprecation guidance', () => {
  it('maps removed tokens to their live replacements', () => {
    expect(DEPRECATED.get('--color-foreground-primary').replacement).toBe('--color-foreground-default');
    expect(DEPRECATED.get('--color-state-hover').replacement).toContain('--color-background-action-hover');
  });

  it('get_token not-found→guidance path: a removed token is absent from the store but present in DEPRECATED', () => {
    // This is exactly what the server's get_token handler keys on.
    expect(resolveToken(tokenStore, 'color.state.hover')).toBeNull();
    expect(DEPRECATED.get(toCssVar('color.state.hover'))).toBeDefined();
  });

  it('check_usage still flags a deprecated token under the {token,replacement} shape', () => {
    const v = lintSnippet('color: var(--color-state-hover);');
    expect(v.some((x) => x.id === 'deprecated-token' && x.matches.includes('--color-state-hover'))).toBe(true);
  });
});

describe('find_rule / get_rule (via reasoning.mjs)', () => {
  it('parses the 9 hard + 6 soft rules from ai/rules.md', () => {
    expect(rules.filter((r) => r.type === 'hard')).toHaveLength(9);
    expect(rules.filter((r) => r.type === 'soft')).toHaveLength(6);
  });

  it('find_rule surfaces the accent-green hard rule', () => {
    const hits = findRules(rules, 'accent green');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBe('hard-5');
    expect(hits[0].type).toBe('hard');
    expect(hits[0].rank).toBe(1);
  });

  it('extracts the post-em-dash clause as rationale, and null when there is no dash', () => {
    expect(getRule(rules, 'hard-5').rationale).toContain('interactivity');
    // Hard rule 3 ("No font families other than …") has no " — " separator.
    expect(getRule(rules, 'hard-3').rationale).toBeNull();
  });

  it('get_rule fetches by id and returns null for an unknown id', () => {
    expect(getRule(rules, 'hard-5').number).toBe(5);
    expect(getRule(rules, 'nope')).toBeNull();
  });

  it('parseRules ignores prose sections outside the two lists', () => {
    const fixture = [
      '## Hard Rules (never break these)',
      '1. First directive — its reason',
      '## Typography Hierarchy',
      '1. Not a rule, just a numbered prose item',
      '## Soft Rules (prefer but can flex)',
      '1. A preference — why it flexes',
    ].join('\n');
    const parsed = parseRules(fixture);
    expect(parsed).toHaveLength(2);
    expect(parsed.map((r) => r.id)).toEqual(['hard-1', 'soft-1']);
    expect(parsed[0].rationale).toBe('its reason');
  });
});

describe('find_decision / get_decision (via reasoning.mjs)', () => {
  it('parses both the dated entries and the archived ADR log', () => {
    expect(decisions.some((d) => d.source === 'dated')).toBe(true);
    expect(decisions.some((d) => d.source === 'archived-adr')).toBe(true);
    // D-01…D-34 are all present in the frozen archived sequence.
    expect(decisions.filter((d) => d.source === 'archived-adr')).toHaveLength(34);
  });

  it('get_decision resolves D-06 with its rejected alternative', () => {
    const d = getDecision(decisions, 'D-06');
    expect(d).not.toBeNull();
    expect(d.title).toContain('Dark-first');
    expect(d.decision).toContain('dark');
    expect(d.rejected).toContain('Blue or purple');
    expect(getDecision(decisions, 'nope')).toBeNull();
  });

  it('find_decision matches by topic, ranking title hits first', () => {
    const hits = findDecisions(decisions, 'dark theme');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].match).toBe('title');
  });

  it('normalizes both source formats onto one shape (Decided/Alternative → decision/rejected)', () => {
    const fixture = [
      '## 2026-06-23 — Sample dated entry',
      '**Decided:** Do the thing.',
      '**Why:** Because reasons.',
      '**Alternative considered:** Not doing it.',
      '**Status:** Shipped.',
      '',
      '---',
      '',
      '## 2026-06 — Month-only dated entry',
      '**Decided:** A choice with no day in the date.',
      '',
      '# Archived ADR Log',
      '',
      '### D-99 · Sample ADR',
      '**Date:** 2026-01-01  ',
      '**Decision:** The ADR decision.',
      '**Rejected:** The ADR alternative.',
    ].join('\n');
    const parsed = parseDecisions(fixture);
    const dated = parsed.find((d) => d.title === 'Sample dated entry');
    expect(dated.source).toBe('dated');
    expect(dated.decision).toBe('Do the thing.');
    expect(dated.rejected).toBe('Not doing it.');
    expect(dated.status).toBe('Shipped.');
    // A YYYY-MM-only heading still parses, with a null Status field.
    const monthOnly = parsed.find((d) => d.date === '2026-06');
    expect(monthOnly).toBeDefined();
    expect(monthOnly.status).toBeNull();
    // Archived format maps Decision/Rejected/Date onto the same shape.
    const adr = getDecision(parsed, 'D-99');
    expect(adr.source).toBe('archived-adr');
    expect(adr.date).toBe('2026-01-01');
    expect(adr.decision).toBe('The ADR decision.');
    expect(adr.rejected).toBe('The ADR alternative.');
  });
});
