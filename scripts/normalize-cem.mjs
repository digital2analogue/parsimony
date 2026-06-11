/**
 * normalize-cem.mjs — canonicalize the Custom Elements Manifest.
 *
 * `cem analyze` emits modules in filesystem-traversal order, which differs
 * between operating systems. That makes custom-elements.json (and the
 * design-system.json that embeds it) non-deterministic across machines, which
 * breaks the CI "artifact is up to date" check. Sorting modules by path with a
 * plain code-unit comparison (locale-independent) makes the output identical
 * everywhere. Runs right after `cem analyze` in the build:cem step.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const PATH = resolve(import.meta.dirname, '..', 'packages/components/custom-elements.json');

if (!existsSync(PATH)) {
  console.error('  ✗ custom-elements.json not found — run `cem analyze` first');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(PATH, 'utf8'));

if (Array.isArray(manifest.modules)) {
  manifest.modules.sort((a, b) => {
    const x = a.path ?? '';
    const y = b.path ?? '';
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

writeFileSync(PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(`  normalized custom-elements.json (${manifest.modules?.length ?? 0} modules, sorted by path)`);
