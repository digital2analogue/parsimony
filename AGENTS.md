# AGENTS.md

> Vendor-neutral entry point for AI agents (Cursor, Copilot, Claude Code, custom MCP clients) building UI **with** this design system.

## Purpose

You're an agent building UI in a repo that depends on `@riverromney/tokens` — and, once available, `@riverromney/components`. This file tells you how to use them correctly.

To propose a change to the design system itself (new token, renamed token, new component variant), open a PR against `digital2analogue/brand-tokens`. That workflow is documented in [`CLAUDE.md`](./CLAUDE.md), not here.

## Always-on foundations

These three files describe the tokens, rules, and per-brand decisions you must respect when consuming the design system. Read all three before generating UI:

- [`ai/rules.md`](./ai/rules.md) — hard rules and soft rules (applies to all brands)
- [`ai/DESIGN.md`](./ai/DESIGN.md) — base dark theme token tables (applies to base, dot-art, dot-blog)
- [`ai/DECISION-ENGINE.md`](./ai/DECISION-ENGINE.md) — decision-engine sub-brand decisions (applies to decision-engine only)

Each file declares its scope in YAML front-matter (`scope`, `applies-to`, `always-on`) so you can filter without reading the body.

## Components

Web components are not yet shipped. Once available, `@riverromney/components` will expose `<rr-badge>`, `<rr-input>`, `<rr-button>` and others as framework-agnostic Lit elements. Component metadata will be discoverable via an MCP server (in-repo at `packages/mcp` until publication).

Planned MCP tools:

- `list_components()` — names and summaries
- `get_component(name)` — props, slots, events, tokens used, rules, examples, accessibility contract
- `check_usage(snippet)` — flags violations of rules in `ai/rules.md` (hex literals, `--primitive-*` references, deprecated tokens). Returns the rule name that matched.

See [`ai/PLAN-web-components.md`](./ai/PLAN-web-components.md) for the full plan and timeline.

## Hard limits when using the system

- **Never use hex literals** — always `var(--color-*)`
- **Never reference `--primitive-*` in UI code** — those are an internal implementation layer; consume the semantic layer (`--color-*`, `--font-*`, `--spacing-*`, etc.) only
- **Never invent a token** — if `check_usage` rejects it, request the addition upstream rather than fabricating a name
- **Never bake font-family or font-size literals** — always `var(--font-*)`
- **All text/background pairings must already pass WCAG AA** per `ai/DESIGN.md` — do not introduce new pairings without verifying
- **Match brand by loading the appropriate brand CSS** — do not hand-author brand differences inline

## Brands

Pick the brand by loading the appropriate `build/css/<brand>.css` file at the consumer page level. Components and tokens cascade from `:root` automatically.

| Brand | Sites | Notes |
|---|---|---|
| **base** (default) | `riverromney.com`, `riverromney.design` | Dark theme, phosphor green accent |
| **decision-engine** | enterprise data UI surfaces | Light-mode, C1-Navy primary, Inter font exception |
| **dot-art** | `riverromney.art` | Pure-black canvas override for photo contrast |
| **dot-blog** | `riverromney.blog` | 18px body, relaxed line-height for long-form reading |
