# MCP Server Expansion — PRD Addition

> Paste this into the brand-tokens PRD or hand it to Claude Code as context for implementation.

---

## Context

The current MCP server (`packages/mcp/src/server.mjs`) has 3 tools:

- `list_components` — names + summaries
- `get_component` — full metadata for one component
- `check_usage` — lint a snippet for hex literals, primitive refs, deprecated tokens

These are useful but limited to component lookup and basic linting. The server doesn't expose tokens, spacing decisions, design reasoning, or help agents choose *between* components or assemble them together. An agent using this MCP today can find parts — it can't make design decisions.

### Relationship to D-26 ("MCP server — complete and frozen")

This expansion deliberately supersedes D-26 — see **D-34** in `ai/DECISIONS.md`. The freeze rationale (`DESIGN.md` + `CLAUDE.md` give internal sessions full context) still holds for sessions inside this repo, and always-on context remains the internal path. What changed is the audience: the expanded MCP serves **external agents that don't have the repo checked out**, and makes the system itself demonstrate the Parsimony thesis. The server header comment in `server.mjs` ("Foundations are NOT served here") must be updated alongside the code.

**Provenance:** the queryable-rationale approach is adapted from DesignerPunk's Civitas layer ([github.com/3fn/DesignerPunk](https://github.com/3fn/DesignerPunk)) — scoped down from 88 steering docs and 3 MCP servers to one server parsing files this repo already maintains.

## Goal

Expand the MCP server so agents can reason about the design system, not just look things up. The server should let an agent build a new page it's never seen a template for and still produce on-brand, system-compliant output — because the MCP exposes the constraints, rationale, and decision frameworks, not just values.

## Existing data sources to wire in

These files already exist in the repo and contain the information the new tools need. No new content authoring required for v1 — just structured access.

| File | What it contains |
|---|---|
| `ai/DESIGN.md` | Resolved token tables for base dark theme (color, typography, spacing, motion, radius, shadow, icon) |
| `ai/rules.md` | Hard rules (9) and soft rules (6) for token usage |
| `ai/DECISIONS.md` | Decision log with what/why/rejected for architecture and token choices |
| `ai/DECISION-ENGINE.md` | Sub-brand decisions, deleted tokens, naming conventions |
| `tokens/primitives/*.tokens.json` | Raw primitive values |
| `tokens/semantic/*.tokens.json` | Semantic token definitions with `{alias}` references |
| `tokens/components/*.tokens.json` | Component-level token overrides |
| `tokens/brands/*.tokens.json` | Brand-specific overrides |
| `design-system.json` | Component metadata (props, slots, events, tokens used, examples, accessibility) |

## New tools to add

### Phase 1 — Token awareness (high priority)

**`get_token`** — Look up any token by name or CSS property. Returns the resolved value, what primitive it references, which brand overrides exist, and usage guidance from DESIGN.md.

```
get_token({ name: "color.background.alt" })
→ { cssProperty: "--color-background-alt", value: "#1E241E", primitive: "green.900", usage: "Cards, panels, inputs, code blocks", brands: { "decision-engine": "#F5F6F7" } }
```

(Note: dot-art overrides only `background.default` → `#000000`; it does not touch `background.alt`. The `brands` map must be computed from `tokens/brands/*.tokens.json`, not assumed.)

**`find_token`** — Search tokens by intent/purpose rather than name. An agent building a card shouldn't need to know the token is called `background.alt` — it should be able to ask "what background do I use for a card?"

```
find_token({ query: "card background" })
→ [{ name: "color.background.alt", match: "Cards, panels, inputs, code blocks", confidence: "high" }]
```

**`get_spacing`** — Return the full spacing scale with usage descriptions so agents pick the right semantic token. Most agents default to arbitrary pixel values — this tool makes the scale discoverable.

```
get_spacing()
→ [{ token: "--spacing-micro", value: "4px", usage: "Icon-to-label margins, badge gaps" }, ...]
```

### Phase 2 — Design reasoning (differentiator)

**`get_rule`** — Query hard and soft rules by topic. Returns the rule, whether it's hard (never break) or soft (prefer), and the rationale.

```
get_rule({ topic: "accent green" })
→ { rule: "Accent green is never resting text — interactivity or intentional emphasis only", type: "hard", rationale: "Single accent model; multiple uses introduce hierarchy ambiguity" }
```

**`get_decision`** — Query the decision log. Returns the decision, what was rejected, and why. This is unique to Parsimony — no other DS MCP server exposes design rationale.

```
get_decision({ topic: "dark theme" })
→ { id: "D-06", decision: "Base theme is dark, single accent color", rejected: "Blue or purple accent", why: "Terminal-meets-editorial aesthetic; one accent makes interactivity legible" }
```

**`check_assembly`** — Validate a set of components + tokens used together. Goes beyond `check_usage` (which checks syntax) to check design intent: are the spacing tokens appropriate for this layout relationship? Is the color pairing accessible? Is the component selection reasonable for this context?

```
check_assembly({ components: ["rr-input", "rr-button"], tokens: ["--spacing-tight", "--color-background-default"], context: "login form" })
→ { valid: true, suggestions: ["Use --spacing-component (24px) between input and button, not --spacing-tight (8px) — these are distinct components, not elements within one component"] }
```

**v1 scope is a small enumerated rule set — not general design-intent inference.** (DesignerPunk lists assembly-level guidance as its own unsolved priority; don't chase it.) Exactly three checks:

1. **Spacing relationship** — distinct components joined by `--spacing-micro`/`--spacing-tight`/`--spacing-inline` get a suggestion to step up the scale (those tokens are for gaps *within* one element).
2. **WCAG pairing lookup** — foreground/background token pairs validated against the contrast table in DESIGN.md.
3. **Deprecated/unknown token check** — reuses the brand-scoped deprecation data (see implementation notes).

Anything outside these three returns "no opinion" rather than guessing.

### Phase 3 — Brand-aware (nice to have)

**`get_brand`** — Return the full override set for a sub-brand, including what changes and what doesn't. Useful for agents building in the decision-engine or dot-art contexts.

**`compare_brands`** — Diff two brands to show what tokens diverge. Helps agents understand what they need to adapt when switching contexts.

## Implementation notes

- All new tools are read-only. The MCP server never modifies token files.
- **Source of truth:** token *values* resolve from `tokens/**/*.tokens.json` (authoritative — it holds the `{alias}` graph). `ai/DESIGN.md` contributes only the usage prose. If a token exists in one source but not the other, log a startup warning — this doubles as a free drift guard for DESIGN.md, which the Figma drift audit does not cover.
- **Brand-scoped deprecation:** the current `DEPRECATED_TOKENS` list in `check_usage` contains DE-only deletions — `--color-foreground-accent`, `--color-background-accent`, and `--color-state-hover` are *live* tokens in the base dark theme. Restructure as `{ token, scope: "decision-engine" | "all" }` (sourced from the deleted-token registry in `ai/DECISION-ENGINE.md`) so `get_token` and `check_usage` cannot contradict each other. `check_usage` gains an optional `brand` param defaulting to base.
- Parse `ai/DESIGN.md`, `ai/rules.md`, and `ai/DECISIONS.md` at startup (they're small enough to hold in memory). Structure them as queryable maps.
- `find_token` needs a lightweight keyword matching approach — start with simple substring matching against token names and usage descriptions. No need for embeddings.
- `check_assembly` implements only the three-rule v1 scope defined above.
- Bump server version to `0.2.0` for Phase 1, `0.3.0` for Phase 2.
- Add tests for each new tool in `server.test.mjs`.
- Update the `server.mjs` header comment — it currently states foundations are deliberately not served (the D-26 stance).

## What this enables

An agent with this expanded MCP doesn't just know what tokens exist — it understands *when to use them, why they were chosen, and what not to do*. That's the Parsimony thesis: a design system an AI can think with, not just query.

## Out of scope

- Writing/mutating tokens via MCP (always read-only)
- Figma integration (separate concern)
- Cross-platform output generation (tokens build pipeline handles this)
- Component rendering or visual preview
