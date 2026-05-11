/**
 * Validate *.meta.json files against schemas/meta.schema.json
 * and lint component source files for token rule violations.
 *
 * Usage: node scripts/validate.mjs
 *
 * Checks:
 *   1. Every *.meta.json validates against the schema
 *   2. No hex color literals (#xxx or #xxxxxx) in component source files
 *   3. No --primitive-* references in component source files
 *
 * Consumer-side enforcement is step 13 (drift grep Action).
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { glob } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ROOT = resolve(import.meta.dirname, '..');
const SCHEMA_PATH = resolve(ROOT, 'schemas/meta.schema.json');

let exitCode = 0;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  exitCode = 1;
}

// ── 1. Schema validation ────────────────────────────────────────────────────

console.log('Validating *.meta.json files...\n');

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

// Collect meta.json files from anywhere components might live
const metaGlobs = [
  'packages/components/**/*.meta.json',
  'src/**/*.meta.json',
];

let metaCount = 0;
for (const pattern of metaGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    metaCount++;
    const filePath = resolve(ROOT, entry);
    const rel = relative(ROOT, filePath);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      const valid = validate(data);
      if (!valid) {
        fail(`${rel}: schema validation failed`);
        for (const err of validate.errors) {
          console.error(`    ${err.instancePath || '/'} ${err.message}`);
        }
      } else {
        console.log(`  ✓ ${rel}`);
      }
    } catch (e) {
      fail(`${rel}: ${e.message}`);
    }
  }
}

if (metaCount === 0) {
  console.log('  (no *.meta.json files found — skipping schema validation)\n');
} else {
  console.log();
}

// ── 2. Token lint: no hex literals, no --primitive-* in component sources ───

console.log('Linting component sources for token violations...\n');

const HEX_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const PRIMITIVE_RE = /--primitive-[a-z]/g;

// Allowlist: these patterns are false positives (e.g. inside comments, schema refs)
const HEX_ALLOWLIST = [
  /url\(#/,          // SVG fragment IDs
  /sourceMappingURL/, // source maps
];

const lintGlobs = [
  'packages/components/src/**/*.{ts,js,css}',
  'src/components/**/*.{ts,js,css}',
];

let lintCount = 0;
for (const pattern of lintGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    lintCount++;
    const filePath = resolve(ROOT, entry);
    const rel = relative(ROOT, filePath);
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      // Skip allowlisted patterns
      if (HEX_ALLOWLIST.some(re => re.test(line))) return;

      const hexMatches = line.match(HEX_RE);
      if (hexMatches) {
        fail(`${rel}:${i + 1}: hex literal ${hexMatches[0]} — use var(--color-*) instead`);
      }

      const primMatches = line.match(PRIMITIVE_RE);
      if (primMatches) {
        fail(`${rel}:${i + 1}: primitive token ${primMatches[0]}* — use semantic tokens instead`);
      }
    });
  }
}

if (lintCount === 0) {
  console.log('  (no component source files found — skipping lint)\n');
} else {
  console.log();
}

// ── Result ──────────────────────────────────────────────────────────────────

if (exitCode === 0) {
  console.log('All checks passed.');
} else {
  console.error('Validation failed — see errors above.');
}

process.exit(exitCode);
