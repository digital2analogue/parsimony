# Work Order 3 — Parsimony

_From re-inspection: `reports/2026-07-16-reinspection.md` (74/80, up from 68, up from 58 at baseline) · Written: 2026-07-16_

Work orders 1 and 2 are fully closed. Every red and yellow from both prior passes is off the board: the staples (toast/menu/table) landed end to end, reduced motion is token-enforced, the docs survived two blind agent passes, governance is codified, and the package is self-describing at 0.4.0. **Zero red, zero yellow** — this list is green-station point-buyers and observation tasks only.

## 🔴 Fix now (reds)

None.

## 🟡 Schedule (yellows)

None.

## 🟢 Point-buyers & observations (in leverage order)

### 1. Confirm fresh-session MCP pickup (S10's last withheld point — carried from WO2 item 5)
- **Evidence:** [verified] `.mcp.json` on main, server stdio-verified, data quality improved this pass — but no session created *after* registration has been observed listing the tools
- **First move:** next fresh Claude Code session in a parsimony clone: confirm the `parsimony` server appears and run one live tool call · **Effort:** XS (observation, not construction)

### 2. Accent-family pairing map — #87 (S3's remaining scope gap)
- **Evidence:** [verified] `validate_brand` v1 deliberately excludes the accent family pending an explicit pairing map; the #66 class of sub-AA pairs is only fenced for the conventional pairs
- **First move:** `tokens/pairings.json` seeded from the pairs `validate_brand` already checks + the accent family; wire into validate · **Effort:** M · Also unlocks #88's contrast-impact changelog annotation

### 3. Automate the baselines-workflow "action required" re-run (S5 wart)
- **Evidence:** [verified] every baselines bot commit parks the PR's CI at "action required"; the manual re-run happened three times today (PRs #132/#133/#134). Documented in the PR template, but recurring toil
- **First move:** have `update-visual-baselines.yml` push with a PAT (or a fine-grained deploy key) so the CI run triggers as a first-class actor — or add a follow-up step that calls the re-run API itself · **Effort:** S

### 4. Breadth beyond the demand signal (S1's last point)
- **Evidence:** [verified] tooltip, popover, accordion, pagination, breadcrumb absent; no consumer currently hand-rolls them
- **First move:** build popover first *when a consumer needs one* — its positioning work (flip, portal-quality placement) also upgrades rr-menu's documented no-flip contract · **Effort:** L (component-by-component, same full-citizen recipe as the staples)

### 5. Two-tier token migration — #114 (S2's standing note)
- **Evidence:** [verified] the component tier remains 12 files of pass-through aliases (now 15 with toast/menu/table); the case study already presents the two-tier target
- **First move:** stage 1 of the issue's own plan (re-home the 4 non-alias values) · **Effort:** L, staged PRs · Note: the three new staple token files were built tier-compliant, so the migration cost didn't grow structurally

### 6. User-side (no session can do these)
- Rename the Figma document to "Parsimony Design System" (#74) — API can't set document names
- Attach Figma + GitHub connectors to the "Parsimony Figma-variable drift audit" Routine in the claude.ai UI so its first scheduled run can actually execute

## Keeping eight greens green

- The blind generation test is now proven as the S9 regression net (13 found → 13 closed → 12/12 verified + 3 new nits caught on the verify pass). Run it after any docs change; treat a non-empty gap list as a red build.
- Never bypass a gate: the meta schema, parity check, staleness gates, and the rules-parser test each caught real mistakes today.
- Publish cadence: `check:publish-fresh` STALE → bump → dispatch → registry-verify worked end to end for 0.4.0; keep publishes tied to that loop rather than ad hoc.

## Cadence

- Next deep inspection: **2026-10, all 10 stations** — S7 (governance) enters scored with templates/CONTRIBUTING landed; S8 (feedback/adoption) has the adoption report (#106) as its ready-made first move.
- Owner: River
