/**
 * lint-stories.mjs — token-rule gate for Storybook stories.
 *
 * Usage: node scripts/lint-stories.mjs   (npm run lint:stories)
 *
 * Storybook stories (both the hand-authored baseline and the ones story-ui
 * generates from natural language into src/stories/generated/) routinely carry
 * inline styles — exactly where a stray hex value, a --primitive-* reference, a
 * hardcoded font-size, or a deprecated token can slip in. This runs the shared
 * rule set (scripts/rules.mjs) over every *.stories.* file so AI-generated
 * stories are held to the same hard rules as component source.
 *
 * It is the story-focused counterpart to validate.mjs (component sources) and
 * drift-lint.mjs (consumer repos) — all three are thin callers of the one rule
 * set, so enforcement can never drift between them.
 *
 * Exit code: 0 = clean, 1 = violations found.
 */

import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { glob } from 'node:fs/promises';
import { lintLines } from './rules.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const STORY_GLOBS = [
  'packages/components/src/**/*.stories.{ts,js}',
  'packages/components/src/stories/generated/**/*.{ts,js}',
];

let fileCount = 0;
let violationCount = 0;

console.log('Linting Storybook stories for token violations...\n');

const seen = new Set();
for (const pattern of STORY_GLOBS) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    if (seen.has(entry)) continue; // a file can match both globs
    seen.add(entry);
    fileCount++;
    const rel = relative(ROOT, resolve(ROOT, entry));
    const content = readFileSync(resolve(ROOT, entry), 'utf8');
    const violations = lintLines(content);
    if (violations.length === 0) {
      console.log(`  ✓ ${rel}`);
    } else {
      for (const v of violations) {
        violationCount++;
        console.error(`  ✗ ${rel}:${v.line}: ${v.match} — ${v.rule}`);
      }
    }
  }
}

if (fileCount === 0) {
  console.log('  (no story files found)');
}

console.log('');
if (violationCount > 0) {
  console.error(`Found ${violationCount} violation(s) across story files.`);
  process.exit(1);
}
console.log('All stories pass the token rules.');
