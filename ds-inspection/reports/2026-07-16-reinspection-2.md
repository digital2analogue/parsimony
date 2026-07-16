# Parsimony — Delta Re-Inspection (Fourth Pass)

_Date: 2026-07-16 · Technician: Claude (Claude Code session) · Mode 3: re-inspection against this morning's third pass (74/80)_

## TL;DR

This morning's sheet had 74/80 with the remaining points named precisely: unverified fresh-session MCP pickup, the missing accent-family pairing map, and marginality everywhere else. The same day closed both named items — **and caught the system's first self-inflicted architecture drift**: the three new staples had shipped with 27 fresh `component.*` tokens, deepening the tier #114 exists to delete. Owner flagged it; the correction migrated all three families to semantic-only, froze the tier in CLAUDE.md, and surfaced a real latent detector bug (deprecated-prefix substring matching) that got a boundary fix plus a synthetic regression test. **Score: 76/80, up from 74 — eight of eight green, and the two points gained are the two the morning report said were withheld.**

| # | Station | Light | Score | Δ |
|---|---------|-------|-------|---|
|  1 | Coverage & gaps                 |  🟢   |  9/10 |   —   |
|  2 | Best practices                  |  🟢   |  9/10 |   —   |
|  3 | Accessibility                   |  🟢   | 10/10 |  +1   |
|  4 | Shared language                 |  🟢   |  9/10 |   —   |
|  5 | Testing & validation            |  🟢   |  9/10 |   —   |
|  6 | Orchestration                   |  🟢   |  9/10 |   —   |
|  9 | Machine-readable docs & context |  🟢   | 10/10 |   —   |
| 10 | Agent access                    |  🟢   | 10/10 |  +1   |
|    | **Total**                       |       | **76/80** | **+2** |

## Station deltas (stations re-run fresh; unchanged stations spot-checked)

### Station 3 — Accessibility: GREEN (10/10, +1 — the pairing map landed)

- [verified] `tokens/pairings.json` — 25 explicit pairs covering the accent family (tint + bold), alert-surface text, status-on-surface, and a **non-text class at SC 1.4.11's 3:1 floor** (input outlines, focus ring, hover/active borders). Schema-validated; `validate.mjs` §5 checks every pair against **base + all three brands on every push**: "✓ 25 mapped pairs (+ convention set) hold AA/3:1 across base + all brands."
- [verified] The map's first live run caught six decision-engine mismatches before the gate ever ran in CI. Three were documented non-renders and two conventions DE genuinely doesn't share (scoped out with `excludeBrands` + written reasons); **one is a real borderline finding — DE `foreground.success` on `background.alt` at 4.38:1 — excluded rather than silently codified, owner-flagged in the decision log.** A gate that reports honestly instead of crying wolf is the 10/10 behavior.
- [verified] Reduced motion (from the morning): `@media (prefers-reduced-motion: reduce)` block present in all four built brand CSS files; hard rule 10 in `ai/rules.md`.
- The 10 is earned: every text pairing AND the interactive-edge class are now machine-enforced per-brand, and the one known sub-threshold pair is documented with a named owner decision.

### Station 10 — Agent access: GREEN (10/10, +1 — the withheld point observed)

- [verified] Fresh-session MCP pickup confirmed live this session: a headless Claude Code session started cold in the clone registered the `parsimony` server from `.mcp.json` and executed real calls — `list_components` → 27 components (staples included), `get_token('shadow.dialog')` → the true composite value through the MCP transport. The morning's only caveat is gone.
- [verified] `validate_brand` now checks the pairing-map union (accent family in scope, per-kind thresholds); 70 MCP workspace tests pass including two new fences on the map layer.

### Station 2 — Best practices: GREEN (9/10, unchanged — corrected and strengthened, one migration pending)

- [verified] **The day's most important finding was self-inflicted and owner-caught:** toast/menu/table shipped with 27 new `component.*` tokens against the #114 two-tier target. Corrected same-day (#144): pure 1:1 semantic substitution (byte-identical values, no baseline churn), three token files deleted, and the tier **frozen** in CLAUDE.md with a dated decision entry so no future session pattern-matches into the same hole. `tokens/components/` is back to exactly the 9 legacy families; `tokens.json` catalog 425 → 398.
- [verified] Figma file renamed to "Parsimony Design System" (owner, in the UI); all 22 `*.figma.ts` files re-pointed (#74 closed, PR #145 in flight at inspection time — node-ids untouched, URLs resolve by fileKey).
- Withheld point: the two-tier target isn't real until the 9 legacy families migrate (#114, staged PRs, four owner decisions on the non-alias values recorded in the issue thread). Frozen ≠ finished.

### Station 5 — Testing & validation: GREEN (9/10, unchanged — new gate class, new fence)

- [verified] A new gate family: §5 pairing contrast, per-brand, on every push. A #66-class regression is now unlandable for the accent family and for non-text edges.
- [verified] The deprecated-token detector's prefix bug (deleted `--color-background-accent` substring-matching its own live replacement `--color-background-accent-green`) was found by the migration, fixed boundary-aware in the single-source `rules.mjs` (validate + `check_usage` + drift-lint all inherit), and **fenced with a synthetic regression test** — per this repo's own "test fixtures, not live defects" lesson. MCP suite: 70 passing.
- Withheld point unchanged: interaction-state visual coverage still leans on static story snapshots; the self-healing baselines loop (S6) hasn't had a live proof yet.

### Station 6 — Orchestration: GREEN (9/10, unchanged — one mechanism awaiting live proof)

- [verified] The baselines "action required" wart is mechanically closed: `update-visual-baselines.yml` dispatches `ci.yml` after its bot push (`workflow_dispatch` is exempt from the GITHUB_TOKEN no-trigger rule; `actions: write` granted; dispatch gated on an actual push). [reported→pending] First live verification happens on the next visual change — until a real cycle runs hands-free, the point stays withheld.
- [verified] Publish pipeline exercised twice today: 0.4.0 (agent-context files) and 0.5.0 (semantic-only CSS + `pairings.json`) both live on the registry, versions bumped before dispatch per the workflow contract.

### Stations 1, 4, 9 — spot-checked, unchanged

- S1 (9/10): staples complete; tooltip/popover/accordion remain demand-gated by design — no consumer hand-rolls one today.
- S4 (9/10): naming sweep now truly complete end-to-end (repo → npm scope → Figma file → Code Connect).
- S9 (10/10): package self-description grew `pairings.json` (four agent-facing artifacts in the tarball); catalog values are real structures (shadow/`[object Object]` fix held through two publishes).

## Still open (carried forward)

1. **#114 staged migration** — 9 legacy families; owner decisions for the 4 non-alias values (recommendation on file: CSS `transparent` keyword ×3, plain `40px` for avatar).
2. **DE `success` on `background.alt` (4.38:1)** — owner call: darken DE's success green one step (repaints decisioning-table status text) or accept the exclusion.
3. **Consumer PAIRINGS generation** — decisioning-table (34 hand-kept pairs) and portfolio (10) should generate token-level pairs from the shipped `pairings.json` (the second half of #87's acceptance).
4. **S6 live proof** — watch the next baselines cycle run hands-free.
5. Breadth on demand; S7/S8 enter the scored set at the next full pass (October), S7 from a far stronger baseline than its 6/10.

## Cadence

Next full inspection (all 10 stations): **2026-10**. The daily gates now carry stations 2, 3, 5, and 9 continuously — the quarterly pass is for the judgment stations, not the mechanical ones.
