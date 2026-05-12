/**
 * Smoke tests for MCP server tool logic.
 * Tests the data and lint functions directly without starting the MCP transport.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const designSystem = JSON.parse(readFileSync(resolve(ROOT, 'design-system.json'), 'utf8'));

// ── Lint patterns (mirrored from server.mjs) ───────────────────────────────

const HEX_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const PRIMITIVE_RE = /--primitive-[a-z][a-z-]*/g;
const DEPRECATED_TOKENS = [
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

function checkUsage(snippet) {
  const violations = [];
  const hexMatches = snippet.match(HEX_RE);
  if (hexMatches) {
    violations.push({ rule: 'no hex', matches: [...new Set(hexMatches)] });
  }
  const primMatches = snippet.match(PRIMITIVE_RE);
  if (primMatches) {
    violations.push({ rule: 'no primitives', matches: [...new Set(primMatches)] });
  }
  const depFound = DEPRECATED_TOKENS.filter((t) => snippet.includes(t));
  if (depFound.length > 0) {
    violations.push({ rule: 'deprecated', matches: depFound });
  }
  return violations;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('list_components', () => {
  it('returns rr-badge', () => {
    const list = designSystem.components.map((c) => ({ name: c.name, summary: c.summary }));
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('rr-badge');
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

describe('check_usage', () => {
  it('detects hex literals', () => {
    const v = checkUsage('color: #4ADE6E;');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('no hex');
    expect(v[0].matches).toContain('#4ADE6E');
  });

  it('detects primitive tokens', () => {
    const v = checkUsage('var(--primitive-color-green-accent)');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('no primitives');
  });

  it('detects deprecated tokens', () => {
    const v = checkUsage('var(--color-foreground-accent)');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('deprecated');
  });

  it('passes clean snippet', () => {
    const v = checkUsage('color: var(--color-foreground-default);');
    expect(v).toHaveLength(0);
  });

  it('detects multiple violations', () => {
    const v = checkUsage('color: #fff; border: 1px solid var(--primitive-color-gray-200);');
    expect(v).toHaveLength(2);
  });
});
