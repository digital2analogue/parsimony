/**
 * build.mjs — assemble the publishable @riverromney/tokens package.
 *
 * Runs the Style Dictionary brand build at the repo root, then copies the
 * freshly-built CSS (one file per brand) into ./css, which is what the package
 * ships. Runs automatically on `npm pack` / `npm publish` via the prepack hook,
 * so the published tarball always contains current token output.
 *
 * The ./css directory is generated, not committed (see .gitignore).
 */

import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const SRC = resolve(ROOT, 'build/css');
const OUT = resolve(HERE, 'css');

// 1. Build every brand's CSS from the token source.
console.log('Building brand CSS from token source...');
execSync('node scripts/build-brands.mjs', { cwd: ROOT, stdio: 'inherit' });

// 2. Copy the built CSS into the package.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const cssFiles = readdirSync(SRC).filter((f) => f.endsWith('.css')).sort();
for (const file of cssFiles) {
  copyFileSync(resolve(SRC, file), resolve(OUT, file));
}

console.log(`\n→ packaged ${cssFiles.length} brand CSS files into @riverromney/tokens:`);
for (const file of cssFiles) console.log(`  css/${file}`);
