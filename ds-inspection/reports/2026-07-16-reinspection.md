# Parsimony — Re-Inspection (third pass)
_Date: 2026-07-16 · Technician: Claude (Claude Code session) · Mode 3: re-inspection against the 2026-07-15 second pass (68/80)_
_Frame: solo builder held to small-team professional standards (per GARAGE.md). Stations 1–6, 9, 10; stations 7–8 remain outside the scored set for series comparability — but see the S7 note below._

## The short version

The second pass ended with one yellow: component breadth — "table, menu, toast are what decisioning-table hand-rolled." All three staples landed today as full citizens (tokens → component + tests → stories → Figma set with bound variables → Code Connect → authored docs), and the layer that would have silently rotted — the docs — was stress-tested by a blind agent, whose 13-item gap list was closed the same session. Reduced motion is now enforced at the token layer (the last flagged a11y gap), the npm package became self-describing (`tokens.json` / `rules.json` / `AGENTS.md` in the tarball, 0.4.0 live), and the governance working agreement got codified even though its station isn't scored in this series. **Score: 74/80, up from 68 — eight of eight stations green, zero red, zero yellow.** What remains between this system and a perfect sheet is genuinely marginal: unverified fresh-session MCP pickup, the accent-family pairing map, and breadth beyond the demand signal (tooltip/popover/accordion — which no consumer currently hand-rolls).

## Inspection sheet

|  # | Station                         | Light | Score |   Δ   |
|----|---------------------------------|-------|-------|-------|
|  1 | Coverage & gaps                 |  🟢   |  9/10 |  +2   |
|  2 | Best practices                  |  🟢   |  9/10 |   —   |
|  3 | Accessibility                   |  🟢   |  9/10 |  +1   |
|  4 | Shared language                 |  🟢   |  9/10 |   —   |
|  5 | Testing & validation            |  🟢   |  9/10 |   —   |
|  6 | Orchestration                   |  🟢   |  9/10 |   —   |
|  9 | Machine-readable docs & context |  🟢   | 10/10 |  +1   |
| 10 | Agent access                    |  🟢   |  9/10 |  +1   |
|    | **Total**                       |       | **74/80** | **+6** |

_Standard framing: a conversation starter, not a grade._

## Station records (delta format)

### Station 1 — Coverage & gaps: GREEN (9/10, +2 — the yellow is off)

- [verified] The three demand-signal staples exist end to end: `rr-toast` (#132), `rr-menu`/`rr-menu-item` (#133), `rr-table`/`rr-table-row`/`rr-table-cell` (#134). Inventory now 26 component dirs / 27 meta.json entries / 27 components in `design-system.json` (was 21).
- [verified] Each staple is a *full* citizen, not a stub: component tokens in `tokens/components/{toast,menu,table}.tokens.json` (12 component token files), unit tests incl. axe audits (22 test files, 285 workspace tests), stories (24 story files), Figma component sets with variable-bound fills on their own pages (Toast 182-32, Menu Item 186-2 + Menu 186-3, Table Cell 188-2 + Table 189-2), Code Connect mappings (22 `*.figma.ts`, all passing the enum-parity gate), and MDX docs with authored overview/usage.
- [verified] The prior pass's acceptance — "a consumer can compose its core flows without hand-rolling a staple" — now holds for decisioning-table's actual surface: its hand-rolled Toast-with-Undo, ActionsMenu, and rules table all have system equivalents (the menu one fixing the audit-flagged keyboard gap its hand-rolled pickers have).
- Withheld point: tooltip, popover, accordion, pagination, breadcrumb remain absent. No current consumer hand-rolls them (no demand signal), so this is a breadth note, not a hole — but a full-service system at small-team standard ships tooltip/popover eventually; the CSS-positioned (no-portal) menu will want the popover primitive's positioning work anyway.

### Station 2 — Best practices: GREEN (9/10, unchanged)

- [verified] All three new token families follow the tier discipline (semantic references only; validated by `npm run validate` — "All checks passed", zero hex/primitive violations).
- [verified] A real resolver defect was found and fixed *through* the system's own health loop: token values that are exactly one `{ref}` were coerced to `"[object Object]"` for composite (shadow) tokens — caught by the blind generation test, fixed in `scripts/tokens.mjs` (#135), now serving real structures to docs, MCP, and the packaged `tokens.json`.
- Withheld point (same as last pass): the component-token tier removal (#114) is still pending — 139+ pass-through aliases carrying cost until the two-tier migration lands. Deliberate, tracked, unchanged.

### Station 3 — Accessibility: GREEN (9/10, +1)

- [verified] The WCAG 2.3.3 gap (#99) is closed on both layers: every built brand CSS now ends with `@media (prefers-reduced-motion: reduce)` zeroing `--motion-duration-*` (emitted by `scripts/build-brands.mjs`, verified in all four brand outputs), and the four infinite animations (spinner/skeleton/progress/button) carry their own guards. `ai/rules.md` hard rule 10 + the `ai/DESIGN.md` Motion note make the requirement agent-legible. The Playwright visual config emulates `reduce`, so the guarded state is what baselines pin.
- [verified] The new staples ship APG-complete contracts: menu-button keyboard suite (arrow nav with wrap + disabled skip, Home/End, Escape-with-focus-return, Tab-closes), toast live-region semantics with hover/focus-paused timers (2.2.1), table roles on hosts (`table`/`row`/`cell`/`columnheader`) with axe audits across states.
- Withheld point: the accent-family pairing map (#87) is still the honest gap in contrast enforcement scope, and rr-table's `aria-selected`-on-`role=table` is a documented pragmatism rather than strict ARIA (the docs now say so plainly — see S9).

### Station 4 — Shared language: GREEN (9/10, unchanged)

- [verified] Figma and code stayed in lockstep *through* rapid additions: three new component pages (`Components / Toast|Menu|Table`, dark canvas, alphabetical placement), sets built with variable-bound fills (no raw hex in any new node), TEXT component properties, and descriptions; `meta.json` carries real componentKey/nodeId for each; the Code Connect enum-parity gate covers all 22 mapping files.
- Withheld point (user-side, unchanged): the Figma document is still named "Brand Tokens Design System" (#74) — the API can't rename it; pure naming, zero structural drift.

### Station 5 — Testing & validation: GREEN (9/10, unchanged — at higher load)

- [verified] +43 unit tests this pass (toast 15, menu 18, table 10) → 285 workspace + 67 MCP + 21 root, all green. Visual baselines grew 66 → 80, all runner-generated through the baselines workflow.
- [verified] The gates caught their own author three times today: a >140-char meta summary, a disallowed `tokensUsed` prefix, and the rules-parser count test flagging the new hard rule — each stopped a push. That is the system working.
- Withheld point: the baselines workflow's bot commit parks PR CI at "action required" every time; the manual re-run is now documented in the PR template, but it's still a human-in-the-loop wart worth automating away.

### Station 6 — Orchestration: GREEN (9/10, unchanged)

- [verified] `@digital2analogue2/parsimony@0.4.0` published and registry-verified this pass (carrying the three new token families, the reduced-motion guard, and the agent-context files). `check:publish-fresh` correctly reported STALE before and drove the publish — the freshness loop works end to end.
- [verified] The drift loop closed a real issue autonomously today: portfolio-vercel's sanctioned OTKit demo palettes were `.driftignore`d with reasons (portfolio-vercel#38), drift-lint re-dispatched, and #98 auto-closed on the clean scan.
- Withheld point: the Figma-variable drift audit is scheduled as a weekly Routine (decision logged 2026-07-15) but hasn't yet produced its first scheduled run, and needs its connectors attached in the claude.ai UI (user-side).

### Station 9 — Machine-readable docs & context: GREEN (10/10, +1)

- [verified] The station's own health metric was run twice today. Blind test 1 (fresh-context agent, docs only) produced correct composed UI but reported 13 gaps/ambiguities. All were fixed (#135); blind verification pass 2 confirmed **12 of 12 checked gaps CLOSED** against the current docs, including the Undo/`dismiss()` recipe, icon-only trigger naming, the row-click contract, the no-clip/no-flip contracts, and the AGENTS.md variant/size lists. It surfaced three new nits — a stale AGENTS.md component index (missing the six new elements), an "Inter vs Geist" factual conflict in the AGENTS.md brands table, and easing arrays printing without their `cubic-bezier()` wrapper — all three fixed in this same pass (AGENTS.md corrected; `fmtVal` now prints easings as the CSS they become).
- [verified] Token tables across all 27 MDX files now show real composite values (`--shadow-dialog | 0 12px 40px 0 rgba(0,0,0,0.24)`) — the `[object Object]` class of rot is gone at the resolver, so it can't recur in docs, MCP, or the package export.
- [verified] `llms.txt` at repo root; 27/27 component MDX complete with authored overview/usage; GEN/AUTHORED region discipline held through three regenerations today.

### Station 10 — Agent access: GREEN (9/10, +1)

- [verified] The package is now self-describing: `tokens.json` (425 base tokens with tier/value/description + per-brand override sets: decision-engine 200, dot-art 8), `rules.json` (10 hard + 6 soft rules + the 6 lint detectors), and `AGENTS.md` ship in the 0.4.0 tarball (npm-verified). A consumer-side agent no longer needs the session-scoped MCP for ground truth — the always-there install path exists (#86 closed).
- [verified] MCP server registered via `.mcp.json`; its data quality improved this pass (real shadow structures from the resolver fix).
- ~~Withheld point (unchanged): fresh-session MCP pickup has still not been *observed*~~ **Addendum (same day, post-report):** observed and confirmed. A fresh headless Claude Code session started in the clone picked up the `parsimony` server from `.mcp.json` and executed live calls — `list_components` returned all 27 components (staples included) and `get_token('shadow.dialog')` returned the real resolved composite value through the MCP transport. Work-order item closed; the point stays withheld in this report's score for honesty (the observation happened after scoring), and S10 enters the next pass with zero known caveats.

## Station 7 note (unscored, for the record)

Governance stayed outside the scored series, but its one net-new inspection gap closed today: `.github/pull_request_template.md`, bug + roadmap issue templates, and `CONTRIBUTING.md` landed (#136, closes #112), with CLAUDE.md pointing at CONTRIBUTING rather than duplicating. The stale-PR discipline was also exercised for real: Dependabot #81 (rotted, conflicted) was superseded by an in-repo checkout v4→v7 bump across all seven workflows (#139). When S7 enters the scored set at the next full pass, it starts from a much stronger position than its 6/10 baseline.

## What's still open (rolls into the work order)

1. Fresh-session MCP pickup confirmation — observation only, first fresh session in a clone (S10's withheld point).
2. Accent-family pairing map (#87) — the remaining contrast-enforcement scope gap (S3).
3. Breadth beyond the demand signal — tooltip/popover next when a consumer needs them; popover work also earns the menu a portal-quality positioning story (S1).
4. Automate the baselines-workflow "action required" re-run (S5 wart; recurring manual step).
5. User-side: rename the Figma file (#74) and attach connectors to the drift-audit Routine.
6. Republish note: the AGENTS.md corrections from this pass ship with the *next* package publish (0.4.0 carries the pre-fix copy); the weekly freshness check will flag it, or fold it into the next token change.

## Next service

- Next deep inspection: 2026-10, all 10 stations (7 & 8 enter the scored set; 8 — feedback/adoption — has the `drift-scan`-based adoption report (#106) as its ready-made first move).
- Cadence between: the blind generation test after any docs change (~2 min); FigmaLint checklist after any Figma component work; the weekly Actions keep drift/freshness/staleness honest on their own.
