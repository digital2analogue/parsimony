#!/usr/bin/env node
/**
 * status.mjs — one-glance health of the design system.
 *
 * The "mouse, not elephant" version of an observatory (decisions.md 2026-07-16):
 * it does not stand up a dashboard, it joins the signals that ALREADY exist into
 * one text table — the value is the join, not the rendering. Every panel reads a
 * source that's already in the repo; nothing here instruments anything new.
 *
 *   Gates       spawn validate + check:publish-fresh, report their exit status
 *   Census      loadTokens() → tokens per tier + brands (flags the #114 component tier)
 *   Components   design-system.json → count + stable/beta split
 *   Consumers    scanConsumer() over repo paths passed on argv (opt-in; skipped if none)
 *   Trust tiers  the static ladder from decisions.md, so the policy is visible here too
 *
 * Usage:
 *   npm run status                     # local panels only
 *   npm run status -- ../portfolio-vercel ../decisioning-table   # + consumer drift
 *
 * Zero network, zero new deps. Exit code is non-zero iff a local gate is red, so
 * it can double as a pre-push sanity check.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";
import { loadTokens } from "./tokens.mjs";
import { scanConsumer } from "./drift-scan.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const PASS = green("PASS");
const FAIL = red("FAIL");

let anyGateRed = false;

function header(title) {
  console.log(`\n${bold(title)}`);
}

// ── Gates ─────────────────────────────────────────────────────────────────
// Run the same scripts CI runs; report the verdict, suppress their chatter.
// Three outcomes: PASS (exit 0), FAIL (exit≠0 with a real verdict), and
// ERROR (couldn't even run — usually deps missing; not a design-system red).
function gate(label, scriptRelPath) {
  const r = spawnSync("node", [resolve(ROOT, scriptRelPath)], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  const crashed =
    r.status === null || /ERR_MODULE_NOT_FOUND|Cannot find package/.test(out);

  if (crashed) {
    console.log(
      `  ${yellow("ERR ")}  ${label}${dim(" — could not run; try `npm ci`")}`,
    );
    return;
  }
  const ok = r.status === 0;
  if (!ok) anyGateRed = true;
  // Prefer a verdict-shaped line (these scripts print it first OR last depending
  // on the script); fall back to the last meaningful line otherwise.
  const meaningful = out
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) => l && !l.startsWith("node:") && !/^\^+$/.test(l) && !/^at /.test(l),
    );
  const verdict = meaningful.find((l) =>
    /^(PASS|FAIL|STALE|OK|All checks|In sync)\b/i.test(l),
  );
  const detail = verdict || meaningful[meaningful.length - 1];
  console.log(
    `  ${ok ? PASS : FAIL}  ${label}${detail ? dim(` — ${detail}`) : ""}`,
  );
}

// ── Census ────────────────────────────────────────────────────────────────
async function census() {
  const { base, brands } = await loadTokens();
  let primitive = 0;
  let component = 0;
  let semantic = 0;
  for (const key of base.keys()) {
    if (key.startsWith("primitive.")) primitive++;
    else if (key.startsWith("component.")) component++;
    else semantic++;
  }
  console.log(
    `  ${String(primitive).padStart(4)}  primitive  ${dim("(never referenced in UI)")}`,
  );
  console.log(
    `  ${String(semantic).padStart(4)}  semantic   ${dim("(the layer UI imports)")}`,
  );
  console.log(
    `  ${String(component).padStart(4)}  component  ${yellow("pending removal — decisions.md #114")}`,
  );
  console.log(
    `  ${String(brands.size).padStart(4)}  brands     ${dim([...brands.keys()].join(", "))}`,
  );
}

// ── Components ───────────────────────────────────────────────────────────────
function components() {
  const ds = JSON.parse(
    readFileSync(resolve(ROOT, "design-system.json"), "utf8"),
  );
  const list = ds.components || [];
  const byStatus = {};
  for (const c of list) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  const split = Object.entries(byStatus)
    .sort()
    .map(([s, n]) => `${n} ${s}`)
    .join(" · ");
  console.log(
    `  ${String(list.length).padStart(4)}  rr-* components  ${dim(split)}`,
  );
  console.log(
    `        ${dim("all carry meta.json (props · tokens · a11y · rules)")}`,
  );
}

// ── Consumers (opt-in) ────────────────────────────────────────────────────
function consumers(paths) {
  if (paths.length === 0) {
    console.log(
      `  ${dim("none scanned — pass repo paths as args to include drift, e.g.")}`,
    );
    console.log(
      `  ${dim("npm run status -- ../portfolio-vercel ../decisioning-table")}`,
    );
    return;
  }
  for (const p of paths) {
    const abs = resolve(p);
    let r;
    try {
      r = scanConsumer(abs);
    } catch (err) {
      console.log(`  ${yellow("SKIP")}  ${p} ${dim(`— ${err.message}`)}`);
      continue;
    }
    const name = relative(resolve(ROOT, ".."), abs) || p;
    if (r.clean) {
      console.log(`  ${PASS}  ${name}  ${dim(`${r.scanned} files clean`)}`);
    } else {
      console.log(
        `  ${red(String(r.violations.length).padStart(4))}  ${name}  ${dim(`drift across ${r.scanned} files`)}`,
      );
    }
  }
}

// ── Trust tiers (static — mirrors decisions.md 2026-07-16) ─────────────────
function trustTiers() {
  console.log(
    `  ${dim("T0 enforce/block")}   validate · WCAG pairing · artifact staleness`,
  );
  console.log(
    `  ${dim("T1 flag only")}       drift-lint · publish-freshness · stale-prs · figma-drift`,
  );
  console.log(
    `  ${dim("T2 auto-act")}        dependabot patch/minor automerge`,
  );
  console.log(
    `  ${dim("T3 never auto")}      new tokens · new pairings · value/brand changes`,
  );
}

// ── Run ───────────────────────────────────────────────────────────────────
console.log(bold("\nparsimony · status"));

header("Gates");
gate("validate (tokens + meta + references)", "scripts/validate.mjs");
gate("publish freshness", "scripts/check-publish-fresh.mjs");
console.log(
  dim(
    "  (CI also runs these on every push; live branch status lives on GitHub)",
  ),
);

header("Token census");
await census();

header("Components");
components();

header("Consumers");
consumers(process.argv.slice(2).filter((a) => !a.startsWith("-")));

header("Automation trust tiers");
trustTiers();

console.log("");
process.exit(anyGateRed ? 1 : 0);
