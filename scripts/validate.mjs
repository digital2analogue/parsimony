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
 *   4. Every registered <rr-*> custom element has a matching *.meta.json
 *   5. design-system.json is in sync with the *.meta.json files
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
const metas = []; // parsed meta objects, reused by the coverage + sync checks below
for (const pattern of metaGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    metaCount++;
    const filePath = resolve(ROOT, entry);
    const rel = relative(ROOT, filePath);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      metas.push(data);
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

// ── 4. Component coverage: every registered <rr-*> has a *.meta.json ─────────

console.log('Checking component coverage (every <rr-*> has a meta.json)...\n');

const CUSTOM_EL_RE = /@customElement\(\s*['"]([a-z][a-z0-9-]*)['"]\s*\)/g;
const metaNames = new Set(metas.map((m) => m.name));
const registered = new Map(); // tag -> source file

const sourceGlobs = [
  'packages/components/src/**/*.ts',
  'src/components/**/*.ts',
];
for (const pattern of sourceGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    if (entry.endsWith('.test.ts') || entry.endsWith('.figma.ts') || entry.endsWith('.d.ts')) continue;
    const content = readFileSync(resolve(ROOT, entry), 'utf8');
    for (const match of content.matchAll(CUSTOM_EL_RE)) {
      registered.set(match[1], entry);
    }
  }
}

let coverageOk = true;
for (const [tag, src] of registered) {
  if (!metaNames.has(tag)) {
    fail(`${tag} is registered in ${src} but has no *.meta.json — add one and regenerate design-system.json`);
    coverageOk = false;
  }
}
if (coverageOk) {
  console.log(`  ✓ all ${registered.size} registered elements have a meta.json\n`);
} else {
  console.log();
}

// ── 5. design-system.json is in sync with the meta files ────────────────────

console.log('Checking design-system.json is in sync with *.meta.json...\n');

const DS_PATH = resolve(ROOT, 'design-system.json');
const byName = (a, b) => a.name.localeCompare(b.name);
const canonical = (components) => JSON.stringify([...components].sort(byName));

if (!existsSync(DS_PATH)) {
  fail('design-system.json is missing — run `npm run build:meta`');
} else {
  try {
    const ds = JSON.parse(readFileSync(DS_PATH, 'utf8'));
    if (canonical(ds.components ?? []) !== canonical(metas)) {
      fail('design-system.json is out of sync with the *.meta.json files — run `npm run build:meta` and commit the result');
    } else {
      console.log(`  ✓ design-system.json matches all ${metas.length} meta files\n`);
    }
  } catch (e) {
    fail(`design-system.json: ${e.message}`);
  }
}

// ── Result ──────────────────────────────────────────────────────────────────

if (exitCode === 0) {
  console.log('All checks passed.');
} else {
  console.error('Validation failed — see errors above.');
}

process.exit(exitCode);
