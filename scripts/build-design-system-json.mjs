/**
 * Merge *.meta.json + custom-elements.json → design-system.json
 *
 * Usage: node scripts/build-design-system-json.mjs
 *
 * Output: design-system.json (committed artifact — works on git clone without a build step)
 *
 * The MCP server and other consumers read this file directly.
 * $schemaVersion major must match what the consumer was built against;
 * a mismatch means the consumer needs an explicit version bump.
 *
 * Merge-conflict strategy: commit-on-CI-only recommended.
 * PR authors run this locally to preview; CI regenerates and commits
 * the canonical version. Avoids noisy merge conflicts.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { glob } from 'node:fs/promises';

const ROOT = resolve(import.meta.dirname, '..');
const OUTPUT = resolve(ROOT, 'design-system.json');

const SCHEMA_VERSION = '1.0.0';

// ── Collect *.meta.json ─────────────────────────────────────────────────────

const metaGlobs = [
  'packages/components/**/*.meta.json',
  'src/**/*.meta.json',
];

const components = [];

for (const pattern of metaGlobs) {
  for await (const entry of glob(pattern, { cwd: ROOT })) {
    const filePath = resolve(ROOT, entry);
    const rel = relative(ROOT, filePath);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      components.push(data);
      console.log(`  + ${rel}`);
    } catch (e) {
      console.error(`  ✗ ${rel}: ${e.message}`);
      process.exit(1);
    }
  }
}

// ── Merge with Custom Elements Manifest (if it exists) ──────────────────────

const cemPaths = [
  'packages/components/custom-elements.json',
  'custom-elements.json',
];

let customElements = null;
for (const cemPath of cemPaths) {
  const abs = resolve(ROOT, cemPath);
  if (existsSync(abs)) {
    try {
      customElements = JSON.parse(readFileSync(abs, 'utf8'));
      console.log(`  + ${cemPath} (Custom Elements Manifest)`);
    } catch (e) {
      console.error(`  ✗ ${cemPath}: ${e.message}`);
      process.exit(1);
    }
    break;
  }
}

// ── Build merged artifact ───────────────────────────────────────────────────

const artifact = {
  $schemaVersion: SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  components,
};

if (customElements) {
  artifact.customElements = customElements;
}

writeFileSync(OUTPUT, JSON.stringify(artifact, null, 2) + '\n');

console.log(`\n→ design-system.json (${components.length} component${components.length === 1 ? '' : 's'}, schema v${SCHEMA_VERSION})`);
