# PRD: River Romney Brand Design System

**Author:** River Romney  
**Status:** Active  
**Created:** 2026-04-06  
**Last updated:** 2026-05-28  

> **Decision log:** For the *why* behind specific architectural and naming calls, see [`ai/DECISIONS.md`](../ai/DECISIONS.md). This PRD covers what the system is, who it's for, and what it must do.

---

## Problem Statement

River Romney maintains a growing network of personal sites — riverromney.com, riverromney.design, riverromney.art (photography), and riverromney.blog (writing) — plus an enterprise sub-brand (decision-engine) for a B2B SaaS product. Each property was built independently, and while they share the same visual DNA today, there is no shared infrastructure enforcing that consistency. Design values were hardcoded in each site's CSS, meaning every change required manual propagation across repos.

As AI-assisted development became the primary workflow, this gap compounded: Claude Code and Cursor sessions fabricated plausible-looking values instead of correct ones, because no machine-readable spec existed. The design system exists to fix this.

---

## Goals

1. **Single source of truth** — All design decisions (color, typography, spacing, borders, motion) are defined once and consumed by every property, eliminating manual propagation.
2. **AI-readable by default** — Any Claude Code session working on any River Romney property automatically loads the correct design constraints without the user re-explaining them.
3. **WCAG AA compliant** — Every text/background color pairing meets a minimum 4.5:1 contrast ratio. Accessibility is enforced at the token level.
4. **Multi-site theming** — Per-property overrides (pure black for .art, larger body type for .blog, fintech palette for decision-engine) without duplicating the shared foundation.
5. **Standards-aligned** — W3C DTCG format, interoperable with Figma, Style Dictionary, and future tooling.

---

## Non-Goals

- **Figma DE library (v2)** — The Figma Foundations Library covers the base dark theme only. DE light-mode in Figma is future work.
- **npm package publishing** — Tokens are distributed via a `sync-tokens` script that copies compiled CSS. npm publish is deferred until there is an external consumer.
- **CSS lint rule** — Flagging hardcoded values in product CSS is deferred (P1); the token system itself is complete.
- **Design system documentation site** — A dedicated docs site (e.g., system.riverromney.design) is future work. Documentation currently lives in this repo.
- **CI/CD pipeline** — Auto-building CSS on token changes via GitHub Actions is deferred. Current workflow: manual `npm run build` locally, then `sync-tokens` in the consumer repo.

---

## Current State (as of 2026-05-28)

### What's shipped

**Token layer (complete)**
- Full W3C DTCG token files across three tiers: primitives, semantic (base dark), brand overrides (4 sub-brands)
- 386 total tokens; 210 mapped to Figma variables (100/100 drift audit score on base-dark scope)
- Style Dictionary v4 build pipeline producing per-brand CSS
- `ai/DESIGN.md` and `ai/rules.md` for AI session consumption (auto-loaded via `CLAUDE.md`)

**Sub-brands (complete)**
| Sub-brand | File | Notes |
|---|---|---|
| Base dark | `tokens/semantic/` | All `riverromney.*` properties |
| decision-engine | `tokens/brands/decision-engine.tokens.json` | Light-mode enterprise UI, Geist font |
| dot-art | `tokens/brands/dot-art.tokens.json` | Pure black canvas override |
| dot-blog | `tokens/brands/dot-blog.tokens.json` | 18px body, 1.7 line-height override |

**Web components (complete)**
20 LitElement web components in `packages/components/`:
- Form controls: `rr-input`, `rr-select`, `rr-checkbox`, `rr-radio`, `rr-radio-group`, `rr-toggle`, `rr-textarea`
- Action/navigation: `rr-button`, `rr-link`, `rr-tab-list`, `rr-tab`
- Display/feedback: `rr-badge`, `rr-alert`, `rr-avatar`, `rr-spinner`, `rr-progress`, `rr-skeleton`, `rr-dialog`
- Layout/surfaces: `rr-icon`, `rr-card`
- 221 tests (all passing), including axe a11y audits
- React 19 native custom element support via `@riverromney/components/react` subpath

**Figma Foundations Library (complete, v1.5 published)**
- File: `Brand Tokens Design System` (key `4aOEBHcnAv2Kbn0g1arL78`)
- 6 variable collections, 160+ variables, 19 text styles, 4 effect styles
- 18 component sets on the Components page
- All variables have `$description` fields populated in Dev Mode
- Code Connect: all 18 `.figma.ts` files parse cleanly; publish blocked by Figma platform 403 (not our bug — see D-29 in `ai/DECISIONS.md`)

**Drift audit tooling (complete)**
- `scripts/drift_audit.py` — compares token JSON to Figma variable export
- `scripts/export_figma_vars.py` — helper for updating `figma-vars.json`
- Current score: 100/100 (base-dark scope), 11 DE-only tokens excluded by design

### What's pending

| Item | Priority | Notes |
|---|---|---|
| Figma Code Connect publish | P0 blocker (Figma) | All files valid; 403 is Figma platform bug |
| DE Figma library (v2) | P1 | Separate file for DE light-mode variables |
| DE font-size-2xs debt | P1 | `.dt-avatar` hardcodes `10px`; needs `var(--primitive-font-size-2xs)` |
| Format benchmark (step 7) | P2 deferred | JSON vs CSS performance comparison |
| CSS lint rule | P2 | Flags hardcoded values in product CSS |
| npm package publishing | P2 | Deferred; no external consumer |
| Documentation site | P3 | `system.riverromney.design` |

---

## User Stories

### As the site owner / developer

- I want all properties to share the same visual identity so visitors experience a coherent brand across all River Romney sites.
- I want to change a design value in one place and have it propagate everywhere, without manual edits in multiple repos.
- I want per-property overrides for specific contexts (photo canvas for .art, reading type for .blog, fintech palette for decision-engine) so that shared doesn't mean identical.
- I want every color pairing to meet WCAG AA so that accessibility is a guarantee, not a periodic audit.

### As an AI coding agent

- I want to read the complete design system spec at session start so I produce on-brand output without the user re-explaining constraints.
- I want an enumerated list of every allowed token so I pick from the system instead of fabricating values.
- I want explicit guardrails (what NOT to do) so I avoid common mistakes — using the accent color for resting text, inventing font weights, reaching for hex values.

---

## Architecture

### Token Taxonomy

| Tier | Purpose | Example | Location |
|---|---|---|---|
| Primitive | Raw values only | `green.950: #0A0D0A` | `tokens/primitives/` |
| Semantic | Intent-based aliases | `color.background.default: {green.950}` | `tokens/semantic/` |
| Brand override | Per-property exceptions | `color.background.default: #000000` (.art) | `tokens/brands/` |

### Build Pipeline

```
tokens/primitives/*.tokens.json    ← raw values
tokens/semantic/*.tokens.json      ← base dark semantic layer
tokens/brands/<brand>.tokens.json  ← sub-brand overrides
        ↓  npm run build  (node scripts/build-brands.mjs)
build/css/<brand>.css              ← compiled CSS custom properties
        ↓  npm run sync-tokens  (in consumer repo)
<consumer>/src/tokens/variables.css
```

### Repo Structure

```
brand-tokens/
  tokens/
    primitives/       Raw values — color, typography, spacing, radius, shadow, motion
    semantic/         Base dark theme semantic tokens + component tokens
    brands/           Sub-brand overrides (decision-engine, dot-art, dot-blog)
    components/       Component-scoped tokens (badge, button, etc.)
  packages/
    components/       LitElement web components + React types
      src/            One directory per component, with .ts + .test.ts + .figma.ts
  ai/
    DESIGN.md         Base dark theme token reference (auto-loaded by CLAUDE.md)
    rules.md          Hard and soft rules for token usage
    DECISIONS.md      ADR-style log of all non-obvious design/architecture decisions
    DECISION-ENGINE.md  DE-specific context — naming, deleted tokens, architecture
    PLAN-web-components.md  Implementation plan (rev5 = final)
  scripts/
    build-brands.mjs   Style Dictionary build for all brands
    generate-docs.mjs  Regenerates docs/index.html from token JSON
    drift_audit.py     Compares token JSON to Figma variable export
    export_figma_vars.py  Helper for updating figma-vars.json
  docs/
    index.html         Base dark theme design system reference (open file://)
    decision-engine.html  DE reference
    brand-design-system-prd.md  This file
  build/
    css/              Compiled CSS output (gitignored content, not hand-edited)
  CLAUDE.md           Loads @ai/DESIGN.md and other AI context
```

### How Properties Consume Tokens

Consumer repos pull the compiled CSS via a `sync-tokens` script. The consumer's own CSS uses custom properties, never hex values or primitive token names:

```css
body {
  background: var(--color-background-default);
  color: var(--color-foreground-default);
  font: var(--font-body-large);
}

a { color: var(--color-foreground-action); }
a:hover { text-decoration: none; }

.button-primary {
  background: var(--color-background-action);
  color: var(--color-foreground-on-action);
  border-radius: var(--radius-default);
}
```

---

## Requirements

### P0 — Foundation (complete ✅)

| Requirement | Status |
|---|---|
| DTCG-format token files (primitives, semantic, brand) | ✅ |
| WCAG AA contrast for all text/background pairings | ✅ |
| `ai/DESIGN.md` + `ai/rules.md` for AI consumption | ✅ |
| `CLAUDE.md` auto-loads design context in any session | ✅ |
| CSS custom property output via Style Dictionary v4 | ✅ |
| Per-brand build (`decision-engine`, `dot-art`, `dot-blog`) | ✅ |
| 20 LitElement web components with tests and a11y audits | ✅ |
| React 19 native CE support + JSX types | ✅ |
| Figma Foundations Library v1.5 (base dark) | ✅ |
| Figma variable descriptions (Dev Mode) | ✅ |
| Code Connect `.figma.ts` files (all 18 components) | ✅ (publish blocked by Figma 403) |
| Drift audit tooling (score: 100/100) | ✅ |
| `ai/DECISIONS.md` decision log | ✅ |

### P1 — Next (not started)

| Requirement | Priority | Notes |
|---|---|---|
| DE Figma library (v2) | P1 | Separate Figma file for DE light-mode |
| DE `font-size-2xs` fix in decisioning-table | P1 | Hardcoded 10px/9px → `var(--primitive-font-size-2xs)` |
| CSS lint rule (flag hardcoded values) | P1 | Auto-generated from token JSON |

#### AI-Native & Presentation (added 2026-05-29)

*Context: Following review of Peter Nowell's DesignerPunk.ai — what to steal from his packaging and what to adapt for River's positioning.*

**P1-6: AI agent validation demo**
Build a demonstrable proof that an LLM prompted to generate UI using the token system produces correct, on-brand output. The most compelling portfolio artifact — shows the system works, not just that it exists.

- [ ] Create 2–3 test prompts ("build a card component", "create a hero section", "generate a contact form") exercising color, typography, and spacing tokens
- [ ] Run each in a Claude Code session with CLAUDE.md / DESIGN.md context loaded
- [ ] Capture: prompt → generated code → rendered screenshot
- [ ] Document corrections needed (target: zero) — validates the AI-readability layer
- [ ] Package as case study content showing the workflow end-to-end

**P1-7: AI-readability architecture doc**
Document the architectural decisions behind making the system AI-readable — why DTCG, why intent descriptions in `$description` fields, why the `ai/` folder structure, how it differs from traditional documentation. Portfolio talking point and Substack content.

- [ ] Covers: machine-readable tokens, intent descriptions, CLAUDE.md import pattern, `agents/` prompt scaffolds
- [ ] Explains tradeoffs vs. alternatives (MCP server, Figma-only, custom tooling)
- [ ] Under 1000 words, presentable in a portfolio review
- [ ] Saved as `docs/ai-readability-decisions.md`

**P1-8: Cross-platform token output (research spike)**
Document how the DTCG + Style Dictionary setup extends to iOS/Swift and Android/Kotlin output. Research only — know the path well enough to discuss credibly in interviews and consulting.

- [ ] How Style Dictionary v4 transforms handle multi-platform output from DTCG source
- [ ] Compare with alternatives (unitless math-based like DesignerPunk's Rosetta, Theo, custom transforms)
- [ ] What would change in current token structure (likely nothing — `$type` handles this)
- [ ] Saved as `docs/cross-platform-tokens-research.md`

**P1-9: Quantifiable stats for portfolio case study**
Surface the system's real numbers in the case study page. Numbers read as credibility; descriptions read as claims.

- [ ] Compile stats: token counts (primitive, semantic, component), component count, test count, contrast ratios documented, drift audit score, consuming properties
- [ ] Design a compact stats display for the portfolio case study (fits riverromney.design aesthetic)
- [ ] Keep stats derivable from source (not hardcoded numbers that drift)

**P1-10: Named subsystem framing**
Give the system's natural modules names and one-sentence descriptions. Changes perception from "a repo with folders" to a considered architecture.

Subsystems already exist:
- Token architecture — three-tier DTCG primitives → semantic → brand overrides
- AI-readability layer — DESIGN.md, rules.md, CLAUDE.md imports, agents/ scaffolds
- Governance / drift detection — drift_audit.py, contrast validation, rules enforcement
- Component library — LitElement web components, React CE support, Figma Code Connect
- Build pipeline — Style Dictionary v4 → per-brand CSS → sync-tokens to consumers

- [ ] Choose names for each subsystem (plain-language or with personality — not cyberpunk)
- [ ] One-sentence responsibility description per subsystem
- [ ] Use names consistently in case study, README, and presentations
- [ ] Architecture diagram showing subsystem relationships (mermaid or SVG in repo)

**P1-11: Narrative case study structure**
Extract the story from this PRD into a portfolio-ready case study page. Problem Statement + Goals + Architecture already contain 80% of the narrative.

- [ ] Structure: Challenge → Insight → Approach → Results
- [ ] Challenge = manual propagation, AI fabricating values, accessibility regressions
- [ ] Insight = why tokens + AI-readability solves it differently than traditional docs
- [ ] Approach = architecture decisions and what makes them distinctive
- [ ] Results = validation demo (P1-6), stats (P1-9), before/after evidence
- [ ] Written in River's voice (concrete anchor, no thesis-first, land on an image)
- [ ] Lives on riverromney.design as a case study page

**P1-12: Structured governance rules with IDs**
Upgrade `ai/rules.md` from informal guardrails to named, scoped rules with enforcement mechanisms. Reads as infrastructure, not documentation.

- [ ] Each rule: ID (e.g., `DRIFT-001`), name, scope, rule text, enforcement mechanism
- [ ] Cover: no hardcoded colors, no hardcoded spacing, semantic-only in consuming code, accent usage, font weight restrictions
- [ ] Format is human-readable and AI-parseable
- [ ] `drift_audit.py` output references rule IDs so violations map to specific rules

### P2 — Future

| Requirement | Priority | Notes |
|---|---|---|
| Format benchmark (step 7) | P2 | JSON vs CSS performance; deferred indefinitely |
| npm package publishing | P2 | Deferred until external consumer exists |
| `llms.txt` at design system URL | P2 | For non-Claude AI tools |
| Contrast ratio documentation page (generated) | P2 | Auto-generated from token files |
| CI/CD pipeline (auto-build on token change) | P2 | GitHub Actions |
| Documentation site (`system.riverromney.design`) | P3 | |

---

## Success Metrics

### Achieved

| Metric | Target | Result |
|---|---|---|
| Drift score (base-dark) | 100/100 | ✅ 100/100 |
| WCAG contrast violations | 0 | ✅ 0 (all pairs verified) |
| Web component test coverage | All components | ✅ 221 tests, 20 components |
| AI context auto-load | Works without user re-explaining | ✅ via `CLAUDE.md` + `@ai/DESIGN.md` |
| Figma variable descriptions | All variables | ✅ All populated |

### Ongoing

| Metric | Target | How measured |
|---|---|---|
| Drift score | 100/100 | `python scripts/drift_audit.py` |
| WCAG compliance | 0 violations | Verified on every new token addition |
| Test pass rate | 100% | `npm test` in `packages/components` |

---

## Resolved Questions

| # | Question | Resolution |
|---|---|---|
| 1 | Accent green as resting text? | Forbidden. Only for links, active states, intentional emphasis. See D-07. |
| 2 | Spacing scale formula or hardcoded? | Hardcoded base-4, 11 values. Semantic aliases added (spacing.element, spacing.layout, etc.). |
| 3 | .blog tokens on Substack? | Deferred — Substack allows custom CSS in paid plans. |
| 4 | JetBrains Mono in v1? | Yes — included. Used by decisioning-table. |
| 5 | Consumption model? | `sync-tokens` script copying compiled CSS. Upgrade to npm when painful. |
| 6 | Semantic spacing tokens? | Added (spacing.micro through spacing.section). See D-19. |
| 7 | DE theme in brand-tokens or locally? | In brand-tokens. Architecture proven. |
| 8 | Opacity tokens? | Not added. Low priority until component library is mature. |
| 9 | Monorepo workspaces? | Permanently removed in rev5. Tokens stay at repo root. See D-04. |
| 10 | React wrappers (@lit/react)? | Not needed. React 19 native CE support. See D-20. |
| 11 | MCP server investment? | Unfrozen for external-agent expansion. See D-34 and `docs/mcp-expansion-prd.md` (D-26 superseded). |

---

## References

### Standards
- [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
- [W3C Design Tokens Resolver Module](https://www.designtokens.org/tr/2025.10/resolver/)

### AI-Readable Design Systems
- [Expose Your Design System to LLMs — Hardik Pandya](https://hvpandya.com/llm-design-systems)
- [Design Systems and AI: Why MCP Servers Are the Unlock — Figma](https://www.figma.com/blog/design-systems-ai-mcp/)
- [How Spotify is Making Encore AI-Ready](https://www.intodesignsystems.com/blog/how-spotify-design-system-ai-ready)

### Tooling
- [Style Dictionary v4 — DTCG Support](https://styledictionary.com/info/dtcg/)
- [LitElement](https://lit.dev/)
- [Figma Code Connect](https://www.figma.com/developers/code-connect)
