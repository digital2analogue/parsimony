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

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const designSystem = JSON.parse(readFileSync(resolve(ROOT, 'design-system.json'), 'utf8'));
const tokenStore = await loadTokens();

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
