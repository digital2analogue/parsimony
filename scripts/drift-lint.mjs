/**
 * drift-lint.mjs — scan a consumer repo for design-system violations.
 *
 * Usage:
 *   node scripts/drift-lint.mjs <dir> [--md]
 *
 * Uses the shared rule set (scripts/rules.mjs) — the same rules the MCP
 * check_usage tool and the build-time validate gate enforce. This replaces
 * the old hand-written grep copies so consumer enforcement can never drift
 * from the source rules.
 *
 *   --md   emit a Markdown report (for GitHub step summaries) instead of plain text.
 *
 * Exit code: 0 = clean, 1 = violations found, 2 = bad usage.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { lintLines, RULES } from './rules.mjs';

const target = process.argv[2];
const asMarkdown = process.argv.includes('--md');

if (!target) {
  console.error('Usage: node scripts/drift-lint.mjs <dir> [--md]');
  process.exit(2);
}

const SCAN_EXT = new Set(['.css', '.ts', '.tsx', '.jsx', '.html']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', 'build', 'dist', '.next', 'out']);
// Built token output legitimately contains hex + primitives — never flag it.
const SKIP_FILES = new Set([
  'variables.css', 'decision-engine.css', 'dot-art.css', 'dot-blog.css',
]);
const isTokenSource = (name) => name.endsWith('.tokens.json');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(full);
    } else if (
      SCAN_EXT.has(extname(name)) &&
      !SKIP_FILES.has(name) &&
      !isTokenSource(name)
    ) {
      yield full;
    }
  }
}

// Collect violations grouped by rule id.
const byRule = new Map(RULES.map((r) => [r.id, { rule: r, hits: [] }]));

for (const file of walk(target)) {
  const rel = relative(target, file);
  const content = readFileSync(file, 'utf8');
  for (const v of lintLines(content)) {
    byRule.get(v.id).hits.push(`${rel}:${v.line}: ${v.match}`);
  }
}

const groups = [...byRule.values()].filter((g) => g.hits.length > 0);

// ── Report ───────────────────────────────────────────────────────────────────

if (groups.length === 0) {
  console.log(asMarkdown ? '## Drift Lint: Clean\n\nNo violations found.' : 'PASS  No drift violations found.');
  process.exit(0);
}

if (asMarkdown) {
  console.log('## Drift Lint: Violations Found\n');
  console.log('Rules reference: [ai/rules.md](https://github.com/digital2analogue/brand-tokens/blob/main/ai/rules.md)\n');
  for (const { rule, hits } of groups) {
    const tag = rule.hardRule ? `Hard Rule ${rule.hardRule}: ` : '';
    console.log(`### ${tag}${rule.message}\n`);
    console.log('```');
    console.log(hits.join('\n'));
    console.log('```\n');
  }
} else {
  for (const { rule, hits } of groups) {
    console.log(`FAIL  ${rule.message}`);
    console.log(hits.join('\n'));
    console.log('');
  }
}

process.exit(1);
