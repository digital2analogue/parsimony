/**
 * build.mjs — assemble the publishable @digital2analogue2/parsimony package.
 *
 * Runs the Style Dictionary brand build at the repo root, then copies the
 * freshly-built CSS (one file per brand) into ./css, which is what the package
 * ships. Runs automatically on `npm pack` / `npm publish` via the prepack hook,
 * so the published tarball always contains current token output.
 *
 * The ./css directory is generated, not committed (see .gitignore).
 */

import { execSync } from "node:child_process";
import {
  mkdirSync,
  copyFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SRC = resolve(ROOT, "build/css");
const OUT = resolve(HERE, "css");

// 1. Build every brand's CSS from the token source.
console.log("Building brand CSS from token source...");
execSync("node scripts/build-brands.mjs", { cwd: ROOT, stdio: "inherit" });

// 2. Copy the built CSS into the package.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const cssFiles = readdirSync(SRC)
  .filter((f) => f.endsWith(".css"))
  .sort();
for (const file of cssFiles) {
  copyFileSync(resolve(SRC, file), resolve(OUT, file));
}

console.log(
  `\n→ packaged ${cssFiles.length} brand CSS files into @digital2analogue2/parsimony:`,
);
for (const file of cssFiles) console.log(`  css/${file}`);

// 3. Agent context — make the package self-describing (#86). Everything an
// agent needs to use the system correctly travels with the install instead
// of living only in this repo / behind the MCP. All generated from sources
// that already exist; deterministic (sorted, no timestamps).
const { loadTokens, resolveToken, toCssVar } = await import(
  resolve(ROOT, "scripts/tokens.mjs")
);
const { loadRules } = await import(resolve(ROOT, "scripts/reasoning.mjs"));
const { RULES } = await import(resolve(ROOT, "scripts/rules.mjs"));

const store = await loadTokens();
const paths = [...store.base.keys()].sort();

const tier = (path) =>
  path.startsWith("primitive.")
    ? "primitive"
    : path.startsWith("component.")
      ? "component"
      : "semantic";

const entry = (path, brand) => {
  const t = resolveToken(store, path, brand ? { brand } : {});
  if (!t) return null;
  return {
    name: path,
    cssVar: toCssVar(path),
    tier: tier(path),
    value: t.value,
    description: t.usage || "",
  };
};

// Base gets the full catalog; each brand ships only the tokens whose
// resolved value diverges from base — mirroring the repo's own layering.
const base = paths.map((p) => entry(p)).filter(Boolean);
const overrides = {};
for (const brandName of [...store.brands.keys()].sort()) {
  const diverged = [];
  for (const p of paths) {
    const b = entry(p, brandName);
    const baseEntry = entry(p);
    if (b && JSON.stringify(b.value) !== JSON.stringify(baseEntry?.value))
      diverged.push(b);
  }
  overrides[brandName] = diverged;
}

writeFileSync(
  resolve(HERE, "tokens.json"),
  JSON.stringify(
    {
      $generated: "packages/tokens/build.mjs — never hand-edit",
      $usage:
        "base is the full dark-theme catalog; overrides.<brand> lists only tokens whose resolved value diverges from base. Never use primitive-tier tokens in UI code — go through the semantic layer.",
      base,
      overrides,
    },
    null,
    1,
  ) + "\n",
);
console.log(
  `  tokens.json (${base.length} base tokens, ${Object.keys(overrides).length} brand override sets)`,
);

writeFileSync(
  resolve(HERE, "rules.json"),
  JSON.stringify(
    {
      $generated:
        "packages/tokens/build.mjs from ai/rules.md + scripts/rules.mjs — never hand-edit",
      rules: loadRules(),
      detectors: RULES.map(({ id, hardRule, message }) => ({
        id,
        hardRule,
        message,
      })),
    },
    null,
    1,
  ) + "\n",
);
console.log("  rules.json (hard/soft rules + lint detector catalog)");

copyFileSync(resolve(ROOT, "AGENTS.md"), resolve(HERE, "AGENTS.md"));
console.log("  AGENTS.md (consumer-facing agent guide)");

copyFileSync(
  resolve(ROOT, "tokens/pairings.json"),
  resolve(HERE, "pairings.json"),
);
console.log(
  "  pairings.json (intended fg/bg pairing map — consumer contrast gates can generate from it)",
);
