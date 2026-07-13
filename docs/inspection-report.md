# Design System Multi-Point Inspection — Parsimony

**Date:** 2026-07-13 · **Frame:** small team (maintainer + collaborators) · **Overall: ~71 / 100**

A one-off health check across the ten "inspection stations" from the AI-Native Design
System framing, scored against the live repo, the MCP, git history, CI, the test suites,
and the issue board. This is a snapshot, not a generated artifact — regenerate by
re-running the inspection, not a script.

## The vehicle

Parsimony is a DTCG-token, framework-agnostic Lit web-component system (21 `rr-*`
components) with a ~17-tool MCP server, consumed by four sites (decisioning-table, two
portfolios, river-intro). Unusually AI-forward for its size: `design-system.json` + CEM +
per-token `$description`s + a deliberate agent-context surface.

## Scorecard

| # | Station | Score | Read |
|---|---------|:----:|------|
| 1 | Coverage & Gaps | 8 | Core component set + full token tiers + generated docs. The Figma design library is the softer leg. |
| 2 | Best Practices | 8 | Zero hex, no-primitive, semantic layering — all gate-enforced by `validate` + `drift-lint`. |
| 3 | Accessibility | 6 | Strong contrast gate (`check_contrast`, `validate_brand`); real gaps in motion, non-text contrast, and automated a11y testing. |
| 4 | Shared Language | 8 | Single-source `rules.mjs`, consistent vocabulary, one decision log. Figma↔code option names can drift. |
| 5 | Testing & Validation | 7 | 300+ tests + CI staleness gates; no visual regression in the DS itself, no agentic self-healing loop. |
| 6 | Orchestration | 7 | Single-repo workspaces, shared rules, drift-scan, one decision log. No automated Figma↔code parity guard. |
| 7 | Governance & Version Control | 6 | Branch protection + stale-PR Action + decision log, but no changelog automation, PR/issue templates, or CONTRIBUTING. |
| 8 | Feedback & Adoption | 4 | Weakest leg — consumers exist but nothing loops real usage back into the roadmap. |
| 9 | Machine-Readable Docs | 9 | `design-system.json` + ~17-tool MCP + CEM + generated component docs. Ahead of the reference example. |
| 10 | Agent Access | 8 | MCP + Code Connect + AGENTS.md. The MCP/components packages aren't published yet. |

## Three findings that carry the most weight

1. **Accessibility cluster.** Reduced motion is unhandled (infinite spinners, WCAG 2.3.3 — [#99](https://github.com/digital2analogue/parsimony/issues/99)); the SC 1.4.11 non-text-contrast audit is incomplete ([#29](https://github.com/digital2analogue/parsimony/issues/29)); there's no automated a11y net in the DS ([#42](https://github.com/digital2analogue/parsimony/issues/42)). Most user-facing risk.
2. **Feedback & Adoption is the weak leg.** No signal from how consumers actually use the system ([#106](https://github.com/digital2analogue/parsimony/issues/106)) — despite having the consumer repos and `drift-scan` to build it cheaply.
3. **Governance paperwork.** The process is enforced but uncodified: no changelog automation ([#88](https://github.com/digital2analogue/parsimony/issues/88)), no PR/issue templates or CONTRIBUTING ([#112](https://github.com/digital2analogue/parsimony/issues/112)).

## Keeping the greens green

- Machine-readable docs + the MCP surface — ahead of the reference example.
- Deterministic no-hex / no-primitive enforcement (`validate` + `drift-lint`, one `rules.mjs`).
- Full three-tier token architecture (primitives → semantic → component/brand).
- Consistent naming vocabulary; deterministic, sorted generated artifacts.
- The agent-context surface (AGENTS.md, Code Connect, MCP) — a real differentiator.
- Branch protection + green CI freshness gates (design-system.json, component docs, docs/index.html).

## Work order (prioritized — mostly already tracked)

| Priority | Item | Issue |
|----------|------|-------|
| 🔴 Fix now | Reduced-motion handling (token + component + rule) | [#99](https://github.com/digital2analogue/parsimony/issues/99) |
| 🔴 Fix now | SC 1.4.11 non-text-contrast audit | [#29](https://github.com/digital2analogue/parsimony/issues/29) |
| 🟡 Soon | Storybook a11y addon (automated a11y net) | [#42](https://github.com/digital2analogue/parsimony/issues/42) |
| 🟡 Soon | Visual regression in the DS itself | [#77](https://github.com/digital2analogue/parsimony/issues/77) |
| 🟡 Soon | Consumer adoption report | [#106](https://github.com/digital2analogue/parsimony/issues/106) |
| 🟢 Scheduled | Token semantic-diff changelog on publish | [#88](https://github.com/digital2analogue/parsimony/issues/88) |
| 🟢 Scheduled | PR/issue templates + CONTRIBUTING | [#112](https://github.com/digital2analogue/parsimony/issues/112) |
| 🟢 Scheduled | Figma↔code prop parity guard | [#46](https://github.com/digital2analogue/parsimony/issues/46) |
| 🟢 Scheduled | Deeper prop best-practices audit | [#57](https://github.com/digital2analogue/parsimony/issues/57) |
| 🟢 Scheduled | Off-scale spacing lint rule | [#63](https://github.com/digital2analogue/parsimony/issues/63) |

**Headline:** the inspection surfaced almost nothing the board didn't already track — itself a
strong governance signal. The single net-new gap was the governance paperwork ([#112](https://github.com/digital2analogue/parsimony/issues/112)).
