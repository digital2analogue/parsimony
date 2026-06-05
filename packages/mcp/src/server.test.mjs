/**
 * Smoke tests for MCP server tool logic.
 * Tests the data and lint functions directly without starting the MCP transport.
 * The lint logic is imported from the shared rule module — no local copy.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lintSnippet } from '../../../scripts/rules.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const designSystem = JSON.parse(readFileSync(resolve(ROOT, 'design-system.json'), 'utf8'));

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
