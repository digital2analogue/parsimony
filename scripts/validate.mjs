/**
 * validate.mjs — the build-time gate for the token system.
 *
 * Usage: node scripts/validate.mjs   (npm run validate)
 *
 * Checks:
 *   1. Every *.meta.json validates against schemas/meta.schema.json
 *   2. Component source files obey the lint rules (scripts/rules.mjs)
 *   3. Every token reference {a.b.c} resolves to a token that exists
 *      — this is what makes "a rename is a breaking change" actually true.
 *
 * Consumer-side enforcement lives in scripts/drift-lint.mjs (the CI Action).
 */

import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { glob } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { lintLines } from './rules.mjs';
import { loadTokens } from './tokens.mjs';

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

const metaGlobs = ['packages/components/**/*.meta.json', 'src/**/*.meta.json'];

let metaCount = 0;
for (const pattern of metaGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    metaCount++;
    const rel = relative(ROOT, resolve(ROOT, entry));
    try {
      const data = JSON.parse(readFileSync(resolve(ROOT, entry), 'utf8'));
      if (!validate(data)) {
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
console.log(metaCount === 0 ? '  (no *.meta.json files found)\n' : '');

// ── 2. Token lint on component sources ──────────────────────────────────────

console.log('Linting component sources for token violations...\n');

const lintGlobs = [
  'packages/components/src/**/*.{ts,js,css}',
  'src/components/**/*.{ts,js,css}',
];

let lintCount = 0;
for (const pattern of lintGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    // .figma.ts files reference Figma node URLs; tests contain sample violations.
    if (entry.endsWith('.figma.ts') || entry.endsWith('.test.ts')) continue;
    lintCount++;
    const rel = relative(ROOT, resolve(ROOT, entry));
    const content = readFileSync(resolve(ROOT, entry), 'utf8');
    for (const v of lintLines(content)) {
      fail(`${rel}:${v.line}: ${v.match} — ${v.rule}`);
    }
  }
}
console.log(lintCount === 0 ? '  (no component source files found)\n' : '');

// ── 3. Token reference resolution ───────────────────────────────────────────
// Every {a.b.c} alias must point at a token that actually exists, including
// across brand override layers. A dangling reference = a rename that wasn't
// propagated; it fails the build here instead of silently shipping.

console.log('Resolving token references...\n');

// Token walking + layering lives in scripts/tokens.mjs (shared with the MCP
// server). Here we only assert existence: every {ref} must point at a real
// token, including across the brand override layers.
const { base, brands, baseRefs, brandRefs } = await loadTokens();

const basePaths = new Set(base.keys());
let refCount = baseRefs.length;
for (const { ref, from, file } of baseRefs) {
  if (!basePaths.has(ref)) fail(`${file}: ${from} references {${ref}} which does not exist`);
}

// Each brand may reference base tokens plus whatever it defines itself.
for (const [name, nodes] of brands) {
  const brandPaths = new Set([...basePaths, ...nodes.keys()]);
  const refs = brandRefs.get(name);
  refCount += refs.length;
  for (const { ref, from, file } of refs) {
    if (!brandPaths.has(ref)) fail(`${file}: ${from} references {${ref}} which does not exist`);
  }
}

console.log(exitCode === 0 ? `  ✓ all ${refCount} references resolve\n` : '');

// ── Result ──────────────────────────────────────────────────────────────────

if (exitCode === 0) console.log('All checks passed.');
else console.error('Validation failed — see errors above.');

process.exit(exitCode);
