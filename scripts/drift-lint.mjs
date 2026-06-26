/**
 * drift-lint.mjs — CLI to scan a consumer repo for design-system violations.
 *
 * Usage:
 *   node scripts/drift-lint.mjs <dir> [--md] [--ignore <glob,glob>]
 *
 * Thin wrapper over scripts/drift-scan.mjs (scanConsumer), which uses the shared
 * rule set (scripts/rules.mjs) — the same rules the MCP check_usage / lint_consumer
 * tools and the build-time validate gate enforce. This replaces the old
 * hand-written grep copies so consumer enforcement can never drift from source.
 *
 *   --md            emit a Markdown report (for GitHub step summaries) instead of plain text.
 *   --ignore a,b    glob(s) of paths to skip, relative to <dir>. Comma-separated.
 *
 * Ignores let a consumer exempt its own sanctioned token block — e.g. a
 * globals.css that legitimately inlines primitive hex values — so the scan
 * flags real UI drift, not the consumer's copy of the source of truth. Ignores
 * are also read from a `.driftignore` file at the root of <dir> (one glob per
 * line; `#` comments and blank lines skipped).
 *
 * Exit code: 0 = clean, 1 = violations found, 2 = bad usage.
 */

import { scanConsumer } from './drift-scan.mjs';

const target = process.argv[2];
const asMarkdown = process.argv.includes('--md');

if (!target) {
  console.error('Usage: node scripts/drift-lint.mjs <dir> [--md] [--ignore <glob,glob>]');
  process.exit(2);
}

const ignore = [];
const flagIdx = process.argv.indexOf('--ignore');
if (flagIdx !== -1 && process.argv[flagIdx + 1]) {
  ignore.push(...process.argv[flagIdx + 1].split(',').map((s) => s.trim()).filter(Boolean));
}

const { groups } = scanConsumer(target, { ignore });

// ── Report ───────────────────────────────────────────────────────────────────

if (groups.length === 0) {
  console.log(asMarkdown ? '## Drift Lint: Clean\n\nNo violations found.' : 'PASS  No drift violations found.');
  process.exit(0);
}

if (asMarkdown) {
  console.log('## Drift Lint: Violations Found\n');
  console.log('Rules reference: [ai/rules.md](https://github.com/digital2analogue/Parsimony/blob/main/ai/rules.md)\n');
  for (const { hardRule, message, hits } of groups) {
    const tag = hardRule ? `Hard Rule ${hardRule}: ` : '';
    console.log(`### ${tag}${message}\n`);
    console.log('```');
    console.log(hits.join('\n'));
    console.log('```\n');
  }
} else {
  for (const { message, hits } of groups) {
    console.log(`FAIL  ${message}`);
    console.log(hits.join('\n'));
    console.log('');
  }
}

process.exit(1);
