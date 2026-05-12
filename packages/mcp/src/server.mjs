/**
 * MCP server for the River Romney design system.
 *
 * Three read-only tools:
 *   - list_components  → names + summaries
 *   - get_component    → full metadata for one component
 *   - check_usage      → lint a CSS/HTML snippet for violations
 *
 * Data source: design-system.json (committed artifact at repo root).
 * Foundations (tokens, rules, typography) are NOT served here —
 * they load as always-on context via AGENTS.md.
 *
 * Usage: node packages/mcp/src/server.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

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

// ── Lint patterns for check_usage ───────────────────────────────────────────

const HEX_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const PRIMITIVE_RE = /--primitive-[a-z][a-z-]*/g;

// Deprecated tokens (add entries here as tokens are removed)
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

// ── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'riverromney-design-system',
  version: '0.1.0',
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
    const violations = [];

    // Check hex literals
    const hexMatches = snippet.match(HEX_RE);
    if (hexMatches) {
      const unique = [...new Set(hexMatches)];
      violations.push({
        rule: 'No hardcoded colors — use var(--color-*) custom properties',
        matches: unique,
      });
    }

    // Check primitive token references
    const primMatches = snippet.match(PRIMITIVE_RE);
    if (primMatches) {
      const unique = [...new Set(primMatches)];
      violations.push({
        rule: 'Never reference primitive tokens (--primitive-*) in UI code — use semantic layer',
        matches: unique,
      });
    }

    // Check deprecated tokens
    const depFound = DEPRECATED_TOKENS.filter((t) => snippet.includes(t));
    if (depFound.length > 0) {
      violations.push({
        rule: 'Deprecated token — see ai/DECISION-ENGINE.md "Tokens That Were Deleted"',
        matches: depFound,
      });
    }

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

// ── Start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
