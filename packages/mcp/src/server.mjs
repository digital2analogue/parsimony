/**
 * MCP server for the River Romney design system.
 *
 * Read-only tools:
 *   Components (from design-system.json):
 *     - list_components  → names + summaries
 *     - get_component    → full metadata for one component
 *     - check_usage      → lint a CSS/HTML snippet for violations
 *   Tokens (from tokens/ *.tokens.json, resolved):       [v0.2.0]
 *     - get_token        → resolve a token: value, primitive, brand overrides, usage
 *     - find_token       → search tokens by intent (substring over name + usage)
 *     - get_spacing      → the semantic spacing scale with usage descriptions
 *
 * Token values AND usage prose come from the *.tokens.json files (the
 * `$description` fields are authoritative and co-located with `$value`).
 * For external agents without the repo checked out, this is the path to the
 * foundations; in-repo sessions still get them as always-on context via AGENTS.md.
 *
 * Usage: node packages/mcp/src/server.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { lintSnippet, DEPRECATED } from '../../../scripts/rules.mjs';
import { loadTokens, resolveToken, findTokens, tokensUnder, toCssVar } from '../../../scripts/tokens.mjs';

// ── Load design-system.json ─────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const DS_PATH = resolve(ROOT, 'design-system.json');

let designSystem;
try {
  designSystem = JSON.parse(readFileSync(DS_PATH, 'utf8'));
} catch (e) {
  console.error(`Failed to load design-system.json: ${e.message}`);
  process.exit(1);
}

// Version guard: MCP refuses to serve if schema version doesn't match
const EXPECTED_MAJOR = '1';
const actualMajor = designSystem.$schemaVersion?.split('.')[0];
if (actualMajor !== EXPECTED_MAJOR) {
  console.error(
    `Schema version mismatch: expected major ${EXPECTED_MAJOR}, got ${designSystem.$schemaVersion}. ` +
    `Regenerate design-system.json or update the MCP server.`
  );
  process.exit(1);
}

// Lint rules for check_usage live in scripts/rules.mjs — the single source of
// truth shared with validate.mjs and the drift Action.

// ── Load tokens ───────────────────────────────────────────────────────────────
// Token walking + resolution lives in scripts/tokens.mjs (shared with validate).

const tokenStore = await loadTokens();

// Reverse index: CSS property → dotted path, so get_token accepts either form.
// (toCssVar is lossy to reverse — segments like "action-hover" contain hyphens —
// so we build the map rather than string-munging.)
const cssToPath = new Map();
for (const path of tokenStore.base.keys()) cssToPath.set(toCssVar(path), path);

// Drift cross-check: semantic tokens whose CSS property never appears in
// ai/DESIGN.md. Informational only (never fatal) — flags doc drift the Figma
// audit doesn't cover. Scoped to documented semantic families to avoid noise.
const DOCUMENTED_FAMILIES = ['color', 'spacing', 'font', 'radius', 'shadow', 'motion', 'icon'];
try {
  const designMd = readFileSync(resolve(ROOT, 'ai', 'DESIGN.md'), 'utf8');
  const undocumented = [...tokenStore.base.keys()].filter(
    (p) => DOCUMENTED_FAMILIES.includes(p.split('.')[0]) && !designMd.includes(toCssVar(p)),
  );
  if (undocumented.length) {
    console.error(`[tokens] ${undocumented.length} semantic token(s) not documented in ai/DESIGN.md (drift check)`);
  }
} catch {
  // DESIGN.md missing is not fatal — the token JSON is the source of truth.
}

// ── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'riverromney-design-system',
  version: '0.2.0',
});

// ── list_components ─────────────────────────────────────────────────────────

server.tool(
  'list_components',
  'List all components in the design system with names and summaries',
  {},
  async () => {
    const list = designSystem.components.map((c) => ({
      name: c.name,
      summary: c.summary,
    }));
    return {
      content: [{ type: 'text', text: JSON.stringify(list, null, 2) }],
    };
  }
);

// ── get_component ───────────────────────────────────────────────────────────

server.tool(
  'get_component',
  'Get full metadata for a component by name (props, slots, tokens, examples, accessibility)',
  { name: z.string().describe('Component name, e.g. "rr-badge"') },
  async ({ name }) => {
    const component = designSystem.components.find((c) => c.name === name);
    if (!component) {
      const available = designSystem.components.map((c) => c.name).join(', ');
      return {
        content: [{
          type: 'text',
          text: `Component "${name}" not found. Available: ${available || '(none)'}`,
        }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(component, null, 2) }],
    };
  }
);

// ── check_usage ─────────────────────────────────────────────────────────────

server.tool(
  'check_usage',
  'Lint a CSS/HTML snippet for design system violations: hex literals, primitive token refs, deprecated tokens',
  { snippet: z.string().describe('CSS or HTML string to check') },
  async ({ snippet }) => {
    // lintSnippet returns { id, rule, matches }[]; expose rule + matches.
    const violations = lintSnippet(snippet).map(({ rule, matches }) => ({ rule, matches }));

    if (violations.length === 0) {
      return {
        content: [{ type: 'text', text: 'No violations found.' }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ violations }, null, 2),
      }],
    };
  }
);

// ── get_token ─────────────────────────────────────────────────────────────────

server.tool(
  'get_token',
  'Resolve a design token by name or CSS property. Returns the resolved value, the primitive it bottoms out at, any sub-brand overrides, and usage guidance. Accepts a dotted path ("color.background.alt") or a CSS property ("--color-background-alt").',
  {
    name: z.string().describe('Token name — dotted path or CSS custom property'),
    brand: z.string().optional().describe('Sub-brand whose override layer to apply, e.g. "decision-engine"'),
  },
  async ({ name, brand }) => {
    if (brand && !tokenStore.brands.has(brand)) {
      const brands = [...tokenStore.brands.keys()].join(', ');
      return {
        content: [{ type: 'text', text: `Unknown brand "${brand}". Available: ${brands || '(none)'}` }],
        isError: true,
      };
    }
    const path = tokenStore.base.has(name) ? name : cssToPath.get(name) ?? name;
    const token = resolveToken(tokenStore, path, { brand });
    if (!token) {
      // Removed token? Point at the live replacement rather than a fuzzy guess.
      const dep = DEPRECATED.get(name) ?? DEPRECATED.get(toCssVar(path));
      if (dep) {
        return {
          content: [{ type: 'text', text: `Token "${name}" was removed (deprecated). Use ${dep.replacement} instead.` }],
          isError: true,
        };
      }
      const near = findTokens(tokenStore, name, { limit: 5 }).map((t) => t.name);
      const hint = near.length ? ` Did you mean: ${near.join(', ')}?` : '';
      return {
        content: [{ type: 'text', text: `Token "${name}" not found.${hint}` }],
        isError: true,
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify(token, null, 2) }] };
  }
);

// ── find_token ──────────────────────────────────────────────────────────────

server.tool(
  'find_token',
  'Find tokens by intent rather than exact name. Substring search over token names and usage descriptions — e.g. "card background" surfaces color.background.alt. Returns ranked matches; use get_token for the full resolved record.',
  {
    query: z.string().describe('What the token is for, e.g. "card background", "focus ring", "section gap"'),
    limit: z.number().int().positive().optional().describe('Max results (default 10)'),
  },
  async ({ query, limit }) => {
    const hits = findTokens(tokenStore, query, { limit: limit ?? 10 });
    if (hits.length === 0) {
      return { content: [{ type: 'text', text: `No tokens match "${query}". Try a broader term.` }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(hits, null, 2) }] };
  }
);

// ── get_spacing ─────────────────────────────────────────────────────────────

server.tool(
  'get_spacing',
  'Return the full semantic spacing scale with resolved values and usage descriptions, so layout gaps come from the scale instead of arbitrary pixels.',
  { brand: z.string().optional().describe('Sub-brand override layer to apply') },
  async ({ brand }) => {
    if (brand && !tokenStore.brands.has(brand)) {
      const brands = [...tokenStore.brands.keys()].join(', ');
      return {
        content: [{ type: 'text', text: `Unknown brand "${brand}". Available: ${brands || '(none)'}` }],
        isError: true,
      };
    }
    const scale = tokensUnder(tokenStore, 'spacing', { brand })
      .map((t) => ({ token: t.cssProperty, value: t.value, usage: t.usage }));
    return { content: [{ type: 'text', text: JSON.stringify(scale, null, 2) }] };
  }
);

// ── Start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
