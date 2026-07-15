# GARAGE.md — Parsimony
_Checked in: 2026-07-15 · Re-confirm at next inspection_

## Vehicle
- System: Parsimony, River Romney's cross-site design system — single source of truth for color, typography, spacing across riverromney.com/.design/.art/.blog + sub-branded product surfaces
- Team: solo (River), side-of-desk — **scored against small-team professional standards at owner's request** · Consumers: 3 live consumer repos in this session (portfolio-vercel, decisioning-table, river-intro) + the .art/.blog site brands
- Age: ~1 month (first commit 2026-06-17); rapid build-out, no major rebuilds yet; component-tier removal planned (parsimony#114)
- Reason for service: routine service — first inspection, baseline read

## Assets
- Design library: Figma "Brand-Tokens-Design-System" (file `4aOEBHcnAv2Kbn0g1arL78`), Code Connect wired from 18 `*.figma.ts` files
- Code library: Lit web components (`rr-*`), 20 component dirs / 21 `*.meta.json` in `packages/components/`; tokens via Style Dictionary (`tokens/{primitives,semantic,components,brands}` → `build/css/<brand>.css`); published package `@digital2analogue2/parsimony@0.3.1` (tokens CSS; components/mcp packages not yet published)
- Docs: `docs/index.html` (generated token reference, file:// viewable), `ai/DESIGN.md` + `ai/rules.md` + `ai/DECISION-ENGINE.md` (agent-facing), `docs/decisions.md` (single decision log), `AGENTS.md` (consumer guide)
- Process: GitHub issues (single shared board), branch protection on main (`verify` check), weekly Actions (drift-lint, publish-freshness, stale-prs), Dependabot + automerge
- AI surface: MCP server (`packages/mcp/`, logic in `scripts/{rules,tokens,reasoning,assembly,contrast,drift-scan}.mjs`), `design-system.json` (meta.json + CEM merge), per-component `*.meta.json`, CLAUDE.md/AGENTS.md rules files, Code Connect

## Evidence access map
| Asset | Access | Verified how |
|---|---|---|
| Design library | live | Figma MCP `whoami` → River; `get_metadata` on node 115:10 returned the real Icon component set (Size=compact/default/large/xl) |
| Code library | live | Full repo at /home/user/parsimony; read token files, component src, scripts |
| Docs | live | Local files (docs/, ai/, AGENTS.md) readable |
| Process | live | GitHub MCP reachable (issues/PRs); Actions configs in repo |

## Known symptoms
- None volunteered — routine service. From repo context: component token tier is mid-migration (#114); accent-family contrast pairings deliberately out of `validate_brand` v1 scope; CLAUDE.md understates meta.json coverage (says 3 productionized; all 21 have meta.json)

## Probable greens
- Token pipeline & consumer drift tooling (sync-tokens, drift-lint, publish-freshness)
- Machine-readable surface (meta.json, design-system.json, MCP) — stations 9–10 candidates

## Intentional deviations (respect these)
- Geist font for decision-engine sub-brand (documented exception)
- Links underlined at rest, underline removed on hover (inverse of convention, documented)
- portfolio-vercel case study presents two-tier target state ahead of code (#114; decision logged 2026-07-14)
- `.rise` animation transient contrast dips in portfolio (documented, accepted)
- OTKit demo palettes in portfolio are deliberately off-system (demo-local, scoped)

## Scope & frame
- Stations this pass: 1–6, 9, 10 (7 & 8 skipped at owner's request) · Scoring frame: solo held to small-team standards
- Out of scope: governance/version-control (S7), feedback/adoption (S8)
