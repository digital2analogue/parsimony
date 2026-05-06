---
id: plan-web-components
scope: planning
status: draft
applies-to: [base, decision-engine, dot-art, dot-blog]
last-updated: 2026-05-06
---

# Web Components Plan

A planning document for extending `digital2analogue/brand-tokens` from a token-only system into an agentic design system with framework-agnostic web components and an MCP server.

This is a **plan**, not an implementation. Each step ships as its own PR and is gated on the previous step paying off.

---

## Goals

**Primary (B):** Stop duplicating component CSS across `riverromney.com`, `.design`, `.art`, `.blog`, and decision-engine. Ship a small, framework-agnostic component layer that all sites consume.

**Secondary (C):** Use this work as a practical exercise in building an agentic design system end to end — JSON metadata, MCP server, AGENTS.md orchestration, drift detection. Learn by shipping.

**Out of scope (for now):**
- Full self-healing loop with auto-PRs from drift signals
- Trust-level enforcement infra (CI hooks that block merges based on trust tier)
- Visual regression at scale (Chromatic-style)

These are good ideas — they come later, after the foundation ships.

---

## Architecture

Inspired directly by:
- **NY State** (Jesse Gardner) — Lit + TypeScript + Code Connect + custom MCP. Working precedent.
- **Spotify Encore** — layered architecture: foundations / styles / behaviors as independent layers for smaller AI context bubbles.
- **Indeed** (Diana Wolosin) — JSON metadata for MCP, Markdown for LLM. 5× cost reduction vs Markdown-in-MCP.

### Monorepo layout

```
brand-tokens/                          (repo name unchanged)
├── AGENTS.md                          ← new: vendor-neutral orchestration entry point
├── CLAUDE.md                          ← unchanged: Claude Code repo-editing rules
├── ai/                                ← always-on foundation content (single source of truth)
│   ├── DESIGN.md                      base dark theme token tables
│   ├── DECISION-ENGINE.md             DE sub-brand decisions
│   ├── rules.md                       hard/soft rules
│   └── PLAN-web-components.md         this file
├── packages/
│   ├── tokens/                        ← existing repo contents move here verbatim
│   │   ├── tokens/                    primitives, semantic, components, brands
│   │   ├── build/css/                 per-brand CSS — canonical artifact, paths preserved
│   │   ├── scripts/                   build-brands, generate-docs, namespace-primitives
│   │   ├── docs/                      static design system reference
│   │   └── package.json               @riverromney/tokens
│   ├── components/                    ← new: framework-agnostic Lit components
│   │   ├── src/
│   │   │   ├── badge/
│   │   │   │   ├── badge.ts           LitElement
│   │   │   │   ├── badge.stories.ts   Storybook
│   │   │   │   ├── badge.test.ts      vitest + vitest-axe
│   │   │   │   └── badge.meta.json    MCP-readable spec
│   │   │   └── index.ts
│   │   ├── dist/                      ESM bundle + custom-elements.json
│   │   └── package.json               @riverromney/components
│   ├── react/                         ← optional: thin @lit/react wrappers for decision-engine
│   └── mcp/                           ← new: MCP server
│       ├── src/server.ts
│       └── package.json               @riverromney/design-system-mcp
└── package.json                       workspaces: ["packages/*"]
```

### Why same repo, not separate

- Tokens and components version together. A token rename is a component breaking change.
- One MCP surface for agents to discover.
- The "always start in tokens repo" workflow extends naturally.

Cost: this repo gains a real JS/TS toolchain (Lit, Vite, Storybook, Vitest). Acceptable for the gain.

### Why not rename to `brand-system`

Every consumer repo has a `sync-tokens` script and `package.json` reference to `brand-tokens`. The naming-clarity gain doesn't justify the migration cost. Keep the repo name; let npm package names (`@riverromney/components`, etc.) carry the scope clarity.

---

## AGENTS.md vs CLAUDE.md vs ai/*.md

Three layers, one source of truth.

| Layer | Audience | Content | Format |
|---|---|---|---|
| `ai/*.md` | Audience-neutral content | Token tables, hard/soft rules, per-brand decisions | Markdown with YAML front-matter |
| `AGENTS.md` | Any agent (Cursor, Copilot, Claude Code, custom) consuming the design system from a product repo | Always-on foundations (imports `ai/*.md`), MCP endpoint pointer, trust levels | Markdown |
| `CLAUDE.md` | Claude Code editing this repo | Build commands, repo structure, hard rules for token authoring (imports `ai/*.md`) | Markdown |

`AGENTS.md` and `CLAUDE.md` both `@`-import the same `ai/*.md` content. No duplication.

---

## Format split (the JSON-vs-Markdown rule)

Per Indeed's benchmark — JSON beat Markdown by 80% fewer tokens and 5× lower cost on the same MCP queries.

- **JSON** — `*.meta.json` per component, `custom-elements.json` from Lit, the merged `design-system.json` artifact the MCP serves. Component contracts are JSON.
- **Markdown** — `AGENTS.md`, `ai/*.md`. LLM instructions are natural language.

### Front-matter on every `ai/*.md`

Per Jan Six's GitHub Primer rule. Lets agents filter without reading the body:

```yaml
---
id: rules
scope: foundations
applies-to: [base, decision-engine, dot-art, dot-blog]
always-on: true
last-updated: 2026-05-06
---
```

---

## Component order

1. **`<rr-badge>`** — first. Mostly cosmetic, ~5 states, optional `role="status"`. Validates pipeline cheaply.
2. **`<rr-input>`** — second. Heaviest a11y patterns (label association, helper/error, validation). Establishes patterns inherited by everything later.
3. **`<rr-button>`** — last. Variant × size × loading × disabled × icon explosion is where bugs hide; do it after the toolchain is proven.

Subsequent (after these three ship cleanly): `<rr-icon>`, `<rr-card>`, `<rr-link>`. Pull from real product-repo needs, not speculation.

---

## Accessibility plan

### Per-component requirements

- Map to a **WAI-ARIA Authoring Practices** pattern; reference the pattern by name in `*.meta.json`.
- Use semantic HTML inside the shadow root (`<button>`, `<input>`, `<output>`) over ARIA-painted divs.
- Honor existing tokens: `--color-border-focus` for focus rings (never bare `outline: none`), motion tokens that respect `prefers-reduced-motion`.
- No new color pairings — every text/bg combo must already pass WCAG AA per `ai/DESIGN.md`. Enforced via the MCP `check_usage` tool.

### Tooling (added to `packages/components`)

| Layer | Tool | Where it runs |
|---|---|---|
| Static lint | `eslint-plugin-lit-a11y` | Pre-commit + CI |
| Unit a11y | `vitest-axe` (axe-core in happy-dom) | CI on every PR; baseline `expect(el).toBeAccessible()` per component |
| E2E a11y | `@axe-core/playwright` | Storybook story crawl, nightly |
| Dev review | `storybook-addon-a11y` | Local Storybook |
| Manual | Keyboard nav checklist + macOS VoiceOver smoke | Per-component before merge |

### Machine-readable a11y contract

Every `*.meta.json` carries an `accessibility` block so the MCP can serve it to agents:

```jsonc
{
  "name": "rr-badge",
  "accessibility": {
    "ariaPattern": "https://www.w3.org/WAI/ARIA/apg/patterns/",
    "role": "status",
    "ariaLive": "polite",
    "keyboard": [],
    "focusable": false,
    "wcag": ["1.4.3 Contrast", "1.4.11 Non-text Contrast"],
    "rules": [
      "If used to announce dynamic state, set role=\"status\"",
      "Decorative-only badges must have aria-hidden=\"true\""
    ]
  }
}
```

### Per-component a11y scope (first three)

- **Badge** — contrast (passes via tokens), optional live region, decorative-vs-meaningful distinction
- **Input** — programmatic label, helper/error association via `aria-describedby`, `aria-invalid`, `aria-required`, focus visible, error announced via live region
- **Button** — full button semantics, `aria-disabled` vs `disabled` (different keyboard behavior), `aria-busy` during loading, icon-only requires `aria-label`

### Definition of done — every component

1. axe passes in vitest with zero violations
2. Keyboard-only flow documented in story
3. VoiceOver smoke noted in PR description
4. `accessibility` block present in `*.meta.json`
5. Storybook a11y addon panel green

---

## MCP server scope

`@riverromney/design-system-mcp` — five read-only tools.

| Tool | Returns | Notes |
|---|---|---|
| `list_components()` | names + summaries | derived from merged JSON artifact |
| `get_component(name)` | merged `*.meta.json` + CEM | props, events, slots, tokens used, rules, examples, a11y contract |
| `check_usage(snippet)` | violations | lints HTML/CSS/JSX against `ai/rules.md` hard rules — no hex, no primitives in UI, no new color pairings |
| `validate_token_addition(json)` | validation | prevents hallucinated tokens; checks naming convention, primitive→semantic chain, contrast |
| `get_brand_overrides(brand)` | resolved overrides | for the four brands |

**Foundations are NOT in the MCP.** Tokens, hard rules, typography hierarchy are loaded as always-on context via `AGENTS.md`. The MCP is for component-level retrieval only — per the article's progressive-disclosure principle: if foundations were MCP-gated, agents would skip them when the prompt didn't ask, then hallucinate.

---

## Trust levels

Codified in `AGENTS.md`. Levels are aspirational at first — enforcement comes later via CI.

| Action | Level | Surface |
|---|---|---|
| Suggest a token rename | suggest-only | issue with proposal |
| Add `aria-label` where missing | auto-PR | draft PR |
| Add new primitive token | blocked | requires human |
| Add new semantic token | suggest-only | issue with proposal |
| Use raw hex in component code | blocked (lint) | CI fails |
| Add a new component variant | suggest-only | draft PR |
| Update `*.meta.json` examples | auto-PR | draft PR |

---

## Migration order

Each step is its own PR. Each step is gated on the previous step paying off.

1. **`AGENTS.md` at root + front-matter on `ai/*.md`** — pure-doc PR, no toolchain change. Useful immediately to any agent in any consumer repo.
2. **npm workspaces conversion** — move existing repo contents under `packages/tokens/`. `build/css/*.css` paths preserved. Cut `@riverromney/tokens@1.0.0`. Update one consumer to confirm no drift.
3. **`<rr-badge>` end-to-end** — Lit + Storybook + vitest-axe + eslint-lit-a11y + `*.meta.json` with `accessibility` block. Single component, full pipeline.
4. **Format benchmark** — ~10 representative prompts, three configurations (AGENTS.md only / AGENTS.md + JSON MCP / AGENTS.md + Markdown MCP). Score accuracy + token cost. Commit results to `ai/BENCHMARK.md`. Cheap insurance before scaling.
5. **MCP server** — `list_components`, `get_component`, `check_usage` reading the merged JSON artifact. Validate locally via Claude Code.
6. **`<rr-input>`** — establishes the forms a11y pattern set.
7. **`<rr-button>`**.
8. **`@lit/react` wrappers** — consumed by decision-engine.
9. **Drift detector** (separate scope) — CI hook scans `riverromney.*` repos for hex/primitive usage, opens issues at trust level *suggest-only*.

---

## Open questions

- **Distribution channel** — npm only, or also a CDN ESM build (`<script type="module" src="…">`) for editorial sites without a bundler?
- **Storybook vs `docs/`** — Storybook for component dev (standard), keep hand-built `docs/` for editorial reference. Confirm before scaffolding.
- **Decision-engine wiring** — does it migrate to `@lit/react` wrappers, or consume web components directly via `<rr-*>` tags? Depends on the repo's React conventions.
- **Inter exception** — decision-engine's font-family override stays as a CSS variable swap. Components must read from `--font-family-*` variables, never hardcode. Confirm before building.
- **Benchmark depth** — ~10 prompts is a smoke test, not Indeed's 1,056. Acceptable for this scale; revisit if results are noisy.

---

## Why this is "agentic," not just "a component library with docs"

If we ship steps 1–8 and stop, we have a normal component library plus an MCP. That's good but it's not the article's vision.

The agentic part is step 9 and beyond — the **observe → detect → suggest → fix → learn** loop. Drift signals from product repos and CI feed back into auto-PRs that propose token reconciliation, with trust levels gating what merges automatically. That's where the leverage is, and that's the work this plan sets up but does not yet do.
