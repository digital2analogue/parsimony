---
id: plan-web-components
scope: planning
status: draft-rev5
applies-to: [base, decision-engine, dot-art, dot-blog]
last-updated: 2026-05-16
---

# Web Components Plan

A planning document for extending `digital2analogue/brand-tokens` from a token-only system into an agentic design system with framework-agnostic web components and an MCP server.

This is a **plan**, not an implementation. Each step ships as its own PR and is gated on the previous step paying off.

> **Revision history**
> - **rev1** — initial sketch.
> - **rev2** — incorporated independent design-systems review. Cut `validate_token_addition`; narrowed `check_usage`; deferred trust-level table; deepened Input a11y; added schema + CEM + versioning + theming + motion + visual regression + AGENTS.md outline; deferred `packages/react`, Storybook, MCP publishing.
> - **rev3** — second review pass. Reordered migration so the merged JSON artifact ships **before** the first component; added a precursor step extracting `--font-family-sans/serif/mono` as semantic tokens (the existing decision-engine "Inter exception" is currently unimplemented); added a CSS-sourcing section naming `tokens/components/*.tokens.json` as the styling source; replaced the schema *example* with an actual JSON Schema skeleton; resolved AGENTS.md audience conflation; added `aria-errormessage` AT-fallback note; added browser-support floor, bundle budget, token-rename protocol, design-system.json consumer contract, Code Connect step; tightened benchmark methodology; fixed step 11 self-contradiction.
> - **rev4** — third review pass. Rewrites step 3 (font-family extraction) with concrete mechanics — the previous "non-breaking, additive" claim was asserted not verified, and the existing typography tokens reference primitive `fontFamily` from inside composite values, which Style Dictionary's default typography transform doesn't decompose. Adds a "Known follow-ups" section listing in-flight fixes (schema bugs, CSS-sourcing mechanism statement, codemod directory creation, merge-conflict policy for `design-system.json`, Code Connect authorship, distribution decision, drift-grep scope clarification). All non-step-3 issues fix during execution PRs, not before merge.
> - **rev5** *(this revision)* — fourth review pass. **Removes old step 2** (npm-workspaces conversion / moving repo contents under `packages/tokens/`). Verified against `package.json` (no `workspaces` field; `name: brand-tokens` is the token package), `style-dictionary.config.mjs` (`buildPath: build/css/`, repo-root-relative source globs), and `scripts/build-brands.mjs`: the move breaks consumer filesystem coupling — consumers read `<sibling>/build/css/variables.css`; the move makes that `<sibling>/packages/tokens/build/css/variables.css` — for zero best-practice gain absent npm publish, which is itself deferred. Tokens stay at the repo root. `packages/` is created lazily when the first component ships (step 5); `workspaces: ["packages/*"]` is added then. Renumbers migration steps 3→2 … 13→12 (12 steps total) and updates every cross-reference. Folds distribution-channel + npm-publish + symmetric-monorepo into a single deferred milestone in Open questions. Rationale: plant-seeds-not-trees — one package today, no symmetry to pay for; the path move fixes no anti-pattern without a version contract.

---

## Goals

**Primary (B):** Stop duplicating component CSS across `riverromney.com`, `.design`, `.art`, `.blog`, and decision-engine. Ship a small, framework-agnostic component layer that all sites consume.

**Secondary (C):** Use this work as a practical exercise in building an agentic design system end to end — JSON metadata, MCP server, AGENTS.md orchestration, drift detection. Learn by shipping.

**Out of scope (for now):**
- Full self-healing loop with auto-PRs from drift signals
- Trust-level enforcement infra (CI hooks that block merges based on trust tier)
- Visual regression at scale (Chromatic-style)

---

## Architecture

Inspired directly by:
- **NY State** (Jesse Gardner) — Lit + TypeScript + Code Connect + custom MCP. Working precedent.
- **Spotify Encore** — layered architecture: foundations / styles / behaviors as independent layers for smaller AI context bubbles.
- **Indeed** (Diana Wolosin) — JSON metadata for MCP, Markdown for LLM. 5× cost reduction vs Markdown-in-MCP.

### Monorepo layout

```
brand-tokens/                          (repo name unchanged)
├── AGENTS.md                          ← new: vendor-neutral entry point for agents consuming the system
├── CLAUDE.md                          ← unchanged: Claude Code repo-editing rules
├── ai/                                ← always-on foundation content (single source of truth)
│   ├── DESIGN.md                      base dark theme token tables
│   ├── DECISION-ENGINE.md             DE sub-brand decisions
│   ├── rules.md                       hard/soft rules
│   ├── BENCHMARK.md                   format-benchmark results (added at step 6)
│   └── PLAN-web-components.md         this file
├── tokens/                            ← STAYS AT ROOT — primitives, semantic, components, brands
├── build/css/                         ← STAYS AT ROOT — per-brand CSS; consumer sync paths unchanged
├── style-dictionary.config.mjs        ← STAYS AT ROOT — repo-root-relative source globs + buildPath
├── docs/                              ← STAYS AT ROOT — static design system reference
├── scripts/                           ← STAYS AT ROOT
│   ├── build-brands.mjs               Style Dictionary multi-brand build (unchanged)
│   ├── generate-docs.mjs              regenerates docs/index.html (unchanged)
│   ├── build-design-system-json.mjs   merges *.meta.json + custom-elements.json → design-system.json (step 4)
│   └── codemods/                      token-rename codemods — created with packages/ at step 5
├── schemas/
│   └── meta.schema.json               JSON Schema for *.meta.json (added step 3)
├── packages/                          ← created lazily at step 5 (first component). NOT a home for tokens.
│   ├── components/                    ← new: framework-agnostic Lit components
│   │   ├── src/
│   │   │   ├── badge/
│   │   │   │   ├── badge.ts           LitElement; references --component-* CSS vars from root build/css
│   │   │   │   ├── badge.stories.html dev story (@web/dev-server)
│   │   │   │   ├── badge.test.ts      vitest + vitest-axe
│   │   │   │   └── badge.meta.json    MCP-readable spec (validates against schemas/meta.schema.json)
│   │   │   └── index.ts
│   │   ├── custom-elements.json       generated by @custom-elements-manifest/analyzer
│   │   ├── dist/                      ESM bundle
│   │   └── package.json               @riverromney/components
│   ├── react/                         ← DEFERRED — only if React 19 native CE support proves insufficient
│   └── mcp/                           ← in-repo script, not published as npm package yet
│       └── src/server.ts
├── design-system.json                 committed artifact, regenerated by CI on every PR
└── package.json                       name: brand-tokens. NO workspaces field until packages/ exists;
                                       add workspaces: ["packages/*"] at step 5
```

### Existing component tokens (the styling source)

`tokens/components/{badge,button,input}.tokens.json` (at the repo root — confirmed present) already exists and is the **styling source** for the Lit components. The chain is:

1. **Primitives** (`primitives/*.tokens.json`) — raw values.
2. **Semantic** (`semantic/*.tokens.json`) — named roles like `color.background.action`.
3. **Component** (`components/*.tokens.json`) — already authored: maps semantic tokens to component-specific roles like `component.button.primary.background.default`. Style Dictionary builds these into per-brand CSS variables (e.g. `--component-button-primary-background-default`).
4. **Lit shadow CSS** — references those component-level CSS variables. No hex, no semantic-token references in shadow CSS — the abstraction layer is already in tokens.

This is the load-bearing decision for goal B: **components don't author colors at all**, they reference tokens that already cascade per-brand. Brand swap = swap loaded `build/css/<brand>.css`, components inherit.

### Why same repo, not separate

- Tokens and components version together. A token rename is a component breaking change.
- One MCP surface for agents to discover.
- "Same repo" does **not** mean "tokens under `packages/*`." Tokens stay at the repo root; only the new component/MCP code lives under `packages/`. Moving tokens would break consumer filesystem coupling for no gain until npm publish — deferred (see Open questions).

Cost: this repo gains a real JS/TS toolchain (Lit, Vite, Vitest, @web/dev-server). Acceptable.

### Why not rename to `brand-system`

Every consumer repo has a `sync-tokens` script and `package.json` reference to `brand-tokens`. Naming-clarity gain doesn't justify the migration. Keep the repo name; npm package names (`@riverromney/components`, etc.) carry the scope clarity.

---

## AGENTS.md vs CLAUDE.md vs ai/*.md

Three layers, one source of truth.

| Layer | Audience | Content | Format |
|---|---|---|---|
| `ai/*.md` | Audience-neutral content | Token tables, hard/soft rules, per-brand decisions | Markdown with YAML front-matter |
| `AGENTS.md` | Any agent (Cursor, Copilot, Claude Code, custom) building UI **with** this design system in a consumer repo | Always-on foundations, MCP endpoint pointer, brand inventory, hard limits on what an agent should never do when *using* tokens/components | Markdown |
| `CLAUDE.md` | Claude Code editing **this** repo | Build commands, repo structure, hard rules for token *authoring* | Markdown |

`AGENTS.md` and `CLAUDE.md` both `@`-import the same `ai/*.md` content. No duplication.

### AGENTS.md outline (consumer-facing — what ships at step 1)

```
# AGENTS.md

## Purpose
You're an agent building UI in a repo that depends on @riverromney/tokens
(and, once available, @riverromney/components). This file tells you how to
use them correctly. To propose a change to the design system itself, open
a PR against digital2analogue/brand-tokens — that workflow is documented
in CLAUDE.md, not here.

## Always-on foundations
@ai/DESIGN.md
@ai/rules.md
@ai/DECISION-ENGINE.md

## Components
On-demand via MCP server (in-repo until step 7): packages/mcp
Tools: list_components, get_component, check_usage

## Hard limits when using the system
- Never use hex literals — always var(--color-*)
- Never reference --primitive-* in UI code
- Never invent a token — if check_usage rejects it, ask for it upstream
- Never bake font-family or font-size literals — always var(--font-*)
- Match brand: read data-brand on <html> or rely on the loaded brand CSS

## Brands
- base (default): riverromney.com, .design
- decision-engine: light-mode, Inter font exception
- dot-art: pure-black canvas override
- dot-blog: 18px body, relaxed line-height
```

---

## Format split

Per Indeed's benchmark — JSON beat Markdown by 80% fewer tokens and 5× lower cost on the same MCP queries.

- **JSON** — `*.meta.json` per component, `custom-elements.json` from the analyzer, the merged `design-system.json` artifact the MCP serves. Component contracts are JSON.
- **Markdown** — `AGENTS.md`, `ai/*.md`. LLM instructions are natural language.

### Front-matter on every `ai/*.md`

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

## JSON metadata schema (`schemas/meta.schema.json`)

Defines the shape of every component's `*.meta.json`. Authored at **step 3**, before any component ships, and validated in CI on every PR.

### Schema skeleton (JSON Schema draft 2020-12)

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://riverromney.design/schemas/meta.schema.json",
  "title": "ComponentMeta",
  "type": "object",
  "required": ["$schemaVersion", "name", "summary", "tagName", "package",
               "props", "slots", "tokensUsed", "examples", "accessibility"],
  "properties": {
    "$schemaVersion": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "name": { "type": "string", "pattern": "^rr-[a-z][a-z-]*$" },
    "summary": { "type": "string", "maxLength": 140 },
    "tagName": { "type": "string", "pattern": "^rr-[a-z][a-z-]*$" },
    "package": { "const": "@riverromney/components" },
    "props": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "type"],
        "properties": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "default": {},
          "description": { "type": "string" }
        }
      }
    },
    "slots":   { "type": "array", "items": { "$ref": "#/$defs/named" } },
    "events":  { "type": "array", "items": { "$ref": "#/$defs/event" } },
    "cssParts":{ "type": "array", "items": { "$ref": "#/$defs/named" } },
    "tokensUsed": {
      "type": "array",
      "items": { "type": "string", "pattern": "^--(color|font|spacing|radius|motion|shadow|icon|component)-" }
    },
    "rules":    { "type": "array", "items": { "type": "string" } },
    "examples": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/example" } },
    "accessibility": {
      "type": "object",
      "required": ["ariaPattern", "wcag"],
      "properties": {
        "ariaPattern": { "type": "string", "format": "uri" },
        "role":        { "type": "string" },
        "ariaLive":    { "enum": ["polite", "assertive", "off", null] },
        "focusable":   { "type": "boolean" },
        "keyboard":    { "type": "array", "items": { "type": "string" } },
        "wcag":        { "type": "array", "items": { "type": "string" } },
        "rules":       { "type": "array", "items": { "type": "string" } }
      }
    },
    "figma": {
      "type": "object",
      "properties": {
        "componentKey": { "type": "string" },
        "nodeId":       { "type": "string" }
      }
    }
  },
  "$defs": {
    "named":   { "type": "object", "required": ["name"], "properties": { "name": { "type": "string" }, "description": { "type": "string" } } },
    "event":   { "type": "object", "required": ["name"], "properties": { "name": { "type": "string" }, "detail": { "type": "string" } } },
    "example": { "type": "object", "required": ["title", "html"], "properties": { "title": { "type": "string" }, "html": { "type": "string" } } }
  }
}
```

### Relationship to Custom Elements Manifest

`*.meta.json` **extends** the Custom Elements Manifest (CEM); it does not duplicate it.

- CEM (`custom-elements.json`) is auto-generated by `@custom-elements-manifest/analyzer` from JSDoc on the Lit class — props, slots, events, attributes.
- `*.meta.json` adds what CEM cannot derive: `tokensUsed`, `rules`, `examples`, the full `accessibility` contract, Figma mappings.
- The merged `design-system.json` artifact (built at step 4) joins them: CEM is the source of truth for the API surface; `*.meta.json` is the source of truth for usage intent.

### Versioning

- `$schemaVersion` follows SemVer.
- **Breaking** = renamed/removed required fields, narrowed enums, new required field. Bump major.
- **Non-breaking** = new optional field, widened enum. Bump minor.
- CI fails any `*.meta.json` that doesn't validate against the current schema major.

### `design-system.json` consumer contract

- The merged artifact is **committed** to the repo, not gitignored. Means MCP works on `git clone` without a build step.
- Carries `$schemaVersion` and `generatedAt` at the top.
- MCP refuses to serve and returns an error if `$schemaVersion` major doesn't match what it was built against. Forces an explicit version bump in the MCP when the schema breaks.
- Consumers (the MCP, future drift checks) verify the version before parsing.

---

## Component order

1. **`<rr-badge>`** — first. Mostly cosmetic, ~5 states, optional `role="status"`. Validates pipeline cheaply.
2. **`<rr-input>`** — second. Heaviest a11y patterns (form participation, label association, helper/error, validation). Establishes patterns inherited by everything later.
3. **`<rr-button>`** — last. Variant × size × loading × disabled × icon explosion is where bugs hide; do it after the toolchain is proven.

Subsequent (after these three ship cleanly): `<rr-icon>`, `<rr-card>`, `<rr-link>`. Pull from real product-repo needs, not speculation.

---

## Browser support floor

Stated explicitly because three of the patterns we lean on have asymmetric histories:

- **Chromium / Edge**: last 2 stable
- **Firefox**: last 2 stable
- **Safari**: 16.4+ (April 2023) — required for `ElementInternals` form participation. Safari 17.4+ (March 2024) for `:state()`.
- `delegatesFocus`: universal in all of the above.
- `aria-errormessage`: shipped in all engines; AT support uneven (see Input a11y section).

If a consumer needs older Safari, they fall back to the existing CSS-only patterns — not our problem.

---

## Theming switch at runtime

**Decision: CSS custom properties only. No compile-time theming.**

- Components read brand tokens at render time from CSS variables on a closest ancestor (typically `<html>` or `<body>`).
- Brand swap = swap the loaded `build/css/<brand>.css` (or set `data-brand="…"` and conditionally load).
- Components MUST NOT bake colors, font-families, or font-sizes into shadow-DOM `<style>` — only `var(--*)` references.
- CSS custom properties on `:root` cascade through shadow boundaries by design.

### The font-family precursor (step 2)

The current token tree references `{primitive.font.family.sans}` directly from inside composite typography `$value` blocks. There is **no semantic font-family token**, and the decision-engine "Inter exception" described in `DECISION-ENGINE.md` is currently unimplemented at the token level — the brand override has no surface to override.

**Why this is the riskiest step in the plan:** Style Dictionary's default `typography/css/shorthand` transform emits a fully-resolved shorthand string per composite (e.g. `300 2.5rem/1.1 "Space Grotesk", system-ui, sans-serif`). Adding a sibling semantic token does NOT automatically yield a `--font-family-sans` CSS variable, and pointing composites at the new semantic token still requires SD to resolve through one extra indirection level. This step has to be verified, not asserted.

#### Concrete mechanics

1. **Author new semantic tokens** in `tokens/semantic/typography.tokens.json` (or a new `tokens/semantic/font-family.tokens.json` co-resident with the rest of the semantic layer):
   ```jsonc
   "font": {
     "family": {
       "sans":  { "$type": "fontFamily", "$value": "{primitive.font.family.sans}" },
       "serif": { "$type": "fontFamily", "$value": "{primitive.font.family.serif}" },
       "mono":  { "$type": "fontFamily", "$value": "{primitive.font.family.mono}" }
     }
   }
   ```
   `$type: "fontFamily"` is what makes Style Dictionary's CSS transformer emit a `--font-family-sans` CSS variable. Without this `$type`, SD treats the token as a generic value and may not emit the variable at all.

2. **Repoint every composite** — exhaustive list, derived from the current `tokens/semantic/typography.tokens.json` (19 composites; do not skip any):
   - `font.display` → `fontFamily: "{font.family.sans}"`
   - `font.title.large`, `font.title.medium`, `font.title.small` → `{font.family.sans}`
   - `font.body.large`, `font.body.medium`, `font.body.small` → `{font.family.serif}`
   - `font.label.large`, `font.label.medium`, `font.label.small`, `font.label.xsmall` → `{font.family.sans}`
   - `font.label-strong.large`, `font.label-strong.medium`, `font.label-strong.small`, `font.label-strong.xsmall` → `{font.family.sans}`
   - `font.code` → `{font.family.mono}`
   - `font.mono-label-small`, `font.mono-label-strong-small`, `font.mono-label-xsmall` → `{font.family.mono}`

3. **Override in decision-engine** — add to `tokens/brands/decision-engine.tokens.json`:
   ```jsonc
   "font": {
     "family": {
       "sans": { "$type": "fontFamily", "$value": "Inter, system-ui, sans-serif" }
     }
   }
   ```

4. **Verify Style Dictionary chain resolution.** SD must resolve `{font.family.sans}` → primitive (or DE override) → final string inside composite shorthand emission. After running `npm run build`:
   - **Base build** (`build/css/base.css` or whichever default CSS file):
     - `--font-family-sans` exists and equals the primitive's resolved value (Space Grotesk stack).
     - `--font-family-serif` and `--font-family-mono` exist.
     - `--font-display` shorthand still resolves to `300 2.5rem/1.1 "Space Grotesk"…` — unchanged.
   - **Decision-engine build** (`build/css/decision-engine.css`):
     - `--font-family-sans` resolves to `Inter, system-ui, sans-serif`.
     - `--font-display` shorthand resolves to `300 2.5rem/1.1 Inter, system-ui, sans-serif` — Inter, not Space Grotesk. **This is the regression test that gates the step.**

5. **Failure mode if SD doesn't decompose composites cleanly:** if step 4 shows `--font-display` in the DE build still emits Space Grotesk (because SD's composite transform pre-resolved the reference), the fix is a custom transform or a `transformer` override that resolves composite typography values through the semantic indirection. Identify this in the step's PR; don't ship the step without DE actually using Inter in built CSS.

6. **Non-breaking claim, now verified:** existing `--font-display`, `--font-body-large`, etc. keep their public names and resolved values for the base brand. Net-new variables (`--font-family-sans|serif|mono`) are additive. DE consumers see Inter where they previously saw Space Grotesk — but DE never actually shipped a font-family override before, so consumers either weren't loading DE's CSS or were already supplying their own font stack.

---

## Motion strategy

- All animation/transition durations and easings come from motion tokens (`--motion-duration-*`, `--motion-easing-*`).
- `prefers-reduced-motion` is enforced **at the token level**, not per component:
  ```css
  @media (prefers-reduced-motion: reduce) {
    :root {
      --motion-duration-instant: 0ms;
      --motion-duration-standard: 0ms;
      --motion-duration-emphasized: 0ms;
    }
  }
  ```
- Lives in `build/css/<brand>.css` (repo root) so every component inherits automatically.
- Components MUST NOT write their own `@media (prefers-reduced-motion: reduce)` blocks.

---

## Accessibility plan

### Per-component requirements

- Map to a **WAI-ARIA Authoring Practices** pattern; reference the pattern by name in `*.meta.json`.
- Use semantic HTML inside the shadow root (`<button>`, `<input>`, `<output>`) over ARIA-painted divs.
- Honor existing tokens: `--color-border-focus` for focus rings (never bare `outline: none`); motion via the global `prefers-reduced-motion` rule.
- No new color pairings — every text/bg combo must already pass WCAG AA per `ai/DESIGN.md`. Enforced via the MCP `check_usage` tool (regex-detect hex literals and `--primitive-*` references in CSS strings).

### Tooling (added to `packages/components`)

| Layer | Tool | Where it runs |
|---|---|---|
| Static lint | `eslint-plugin-lit-a11y` | Pre-commit + CI |
| Unit a11y | `vitest-axe` (axe-core in happy-dom) | CI on every PR; baseline `expect(el).toBeAccessible()` per component |
| E2E a11y | `@axe-core/playwright` | Story crawl, nightly |
| Dev review | `@web/dev-server` + `*.stories.html` | Local |
| Manual | Keyboard nav checklist + macOS VoiceOver smoke | Per-component before merge |

### Per-component a11y scope (first three)

- **Badge** — contrast (passes via tokens), optional live region, decorative-vs-meaningful distinction.

- **Input** — the actual hard problem in this list, named explicitly:
  - **Form participation** via `ElementInternals` + `static formAssociated = true` (host element submits with `<form>`)
  - `:state()` API for `--invalid`, `--required`, `--dirty` — authors style state via `:state(invalid)` from light DOM
  - Programmatic label association — host receives label via `attachInternals().setFormValue()` and `aria-labelledby`
  - **Error-linkage strategy with fallback**: primary link via `aria-errormessage` paired with `aria-invalid="true"`. **Mirror to `aria-describedby` while invalid** until an AT smoke matrix (NVDA, JAWS, VoiceOver macOS, VoiceOver iOS, TalkBack) confirms reliable announce-on-invalid for `aria-errormessage` alone. Coverage as of early 2026 is uneven; mirror-while-invalid is cheap insurance.
  - `aria-describedby` reserved for non-error helper text when valid
  - `aria-required` (presentation) + the underlying `required` attribute (semantics)
  - **Focus delegation**: host forwards focus to inner `<input>` via `delegatesFocus: true` on the shadow root
  - **Autofill under shadow DOM**: inner `<input>` carries `autocomplete` attribute; verify Chromium and Safari both autofill the shadow input

- **Button** — full button semantics, `aria-disabled` vs `disabled` (different keyboard behavior), `aria-busy` during loading, icon-only requires `aria-label`, host-vs-inner-button focus model decided once and reused.

### Definition of done — every component

1. axe passes in vitest with zero violations
2. Keyboard-only flow documented in story
3. VoiceOver smoke noted in PR description
4. **AT smoke matrix recorded** (which combos tested, which announced what) — required for any component making `aria-errormessage`/live-region claims
5. `accessibility` block present and schema-validated
6. eslint-lit-a11y green
7. Visual regression smoke green across all four brands
8. Bundle-size budget green (see below)

---

## Visual regression (cross-brand smoke)

- One Playwright screenshot per story per brand (4 brands × N stories).
- Compares to baseline; PR fails on diff > N px or > N%.
- Catches token regressions across all brands in one shot.
- Lives in `packages/components/test/visual/`. Added at step 5.

---

## Bundle-size budget

- Per component: 5 KB gzipped maximum (component code + its shadow CSS, excluding Lit core).
- Total `packages/components` (without Lit): 25 KB gzipped at component count = 5.
- Enforced via `size-limit` in CI.
- Budgets revisited at component count = 8.

---

## Token rename / deprecation protocol

Tokens and components version together — but consumer repos need a migration window.

- A token rename ships in **two minor versions**: vN defines both old and new (old aliases new); vN+2 removes old.
- vN includes a `DEPRECATED.md` entry naming the old token, the new token, and the version old will be removed in.
- A codemod script in `scripts/codemods/` (repo root; directory created at step 5) rewrites consumer source. Run via `npx @riverromney/tokens codemod <name>` once the package is published — see the deferred publish milestone in Open questions.
- `check_usage` MCP tool flags deprecated token references with the new-token suggestion in the violation message.

---

## MCP server scope

`packages/mcp` — three read-only tools.

| Tool | Returns | Notes |
|---|---|---|
| `list_components()` | names + summaries | derived from merged `design-system.json` |
| `get_component(name)` | merged `*.meta.json` + CEM | props, events, slots, tokens used, rules, examples, a11y contract |
| `check_usage(snippet)` | violations | **narrowly scoped**: regex-detects hex literals, `--primitive-*` references, and deprecated tokens in CSS/HTML strings. Returns the rule name from `ai/rules.md` that matched. Not a JSX/TSX parser; not a contrast calculator. |

### Cut from the MCP

- **`validate_token_addition`** → moved to a `npm run validate` build-time script.
- **`get_brand_overrides`** → consumers can read `build/css/<brand>.css` directly.

### Foundations are NOT in the MCP

Tokens, hard rules, typography hierarchy load as always-on context via `AGENTS.md`. Per the article's progressive-disclosure principle: if foundations were MCP-gated, agents would skip them when the prompt didn't ask, then hallucinate.

### Not published yet

The MCP lives as an in-repo script (`packages/mcp/src/server.ts`) until there's a second consumer.

---

## Trust levels (deferred)

Originally this section had a seven-row table. **Cut** — trust levels without enforcement are theater.

What ships at step 3 instead:

**One concrete CI rule:** `packages/components/**/*.{ts,css,html}` must contain no hex literals and no `--primitive-*` references. Fails the build.

Add more rules only when actual agent behavior justifies them.

---

## Migration order

Each step is its own PR. Each step is gated on the previous step paying off.

> **rev5:** old step 2 (npm-workspaces conversion / move to `packages/tokens/`) is **removed** — see revision history and Open questions. Steps renumbered; **12 steps total**. Tokens stay at the repo root; `packages/`, `scripts/codemods/`, and the `workspaces` field appear only at step 5, when the first component actually needs them.

1. **`AGENTS.md` at root + front-matter on `ai/*.md`** — pure-doc PR, no toolchain change. Useful immediately to any agent in any consumer repo.
2. **Font-family extraction** — see "The font-family precursor" section above for full mechanics. Add semantic `font.family.sans|serif|mono` tokens with `$type: "fontFamily"`; repoint all 19 composite typography tokens; implement decision-engine's Inter override. **Step gates on the DE-build regression test:** `--font-display` in `build/css/decision-engine.css` must resolve with Inter, not Space Grotesk. If Style Dictionary's composite transform pre-resolves through the indirection and breaks this, the step ships a custom transform alongside.
3. **`schemas/meta.schema.json` + CI validator** — JSON Schema draft 2020-12 (skeleton above) + CI step that validates every `*.meta.json`. The `npm run validate` script also runs the "no hex / no `--primitive-*`" lint over `packages/components/**`.
4. **`scripts/build-design-system-json.mjs`** — merges every `*.meta.json` + `custom-elements.json` into committed `design-system.json`. Ships before any component so step 5's CI signal includes "artifact regenerates and validates."
5. **`<rr-badge>` end-to-end** — first time `packages/` physically exists. **Scaffold:** create `packages/components/` and `scripts/codemods/`, add `workspaces: ["packages/*"]` to the root `package.json` (tokens, `build/css/`, `style-dictionary.config.mjs` stay at root, untouched). **Then:** Lit + `@web/dev-server` + vitest-axe + eslint-lit-a11y + `*.meta.json` (schema-validated) + visual regression smoke across all four brands + size-limit budget. Shadow CSS references existing component tokens from `tokens/components/badge.tokens.json` via the root `build/css/<brand>.css`.
6. **Format benchmark** — ~10 representative prompts × 3 runs each (temperature pinned to 0 where supported), three configurations (AGENTS.md only / AGENTS.md + JSON MCP / AGENTS.md + Markdown MCP). Score accuracy + token cost. Commit results to `ai/BENCHMARK.md`. **Directional, not decision-grade** — informs format choice; doesn't block other steps.
7. **MCP server** — `list_components`, `get_component`, `check_usage` reading the merged JSON artifact. In-repo, not published.
8. **`<rr-input>`** — establishes the forms a11y pattern set, including `ElementInternals`, `formAssociated`, `aria-errormessage` (with `aria-describedby` mirror), focus delegation, autofill verification. AT smoke matrix recorded.
9. **`<rr-button>`**.
10. **Decision-engine wiring** — consume `<rr-*>` directly via React 19's native custom-elements support. Add `@lit/react` wrappers only if it bites.
11. **Code Connect mappings** — populate `figma.componentKey` / `figma.nodeId` in each `*.meta.json`. Use the Figma MCP's `add_code_connect_map` to mirror the mapping into Figma. Updates `get_component` output so agents pulling component context get the mapping back.
12. **Drift grep Action** — 30-line GitHub Action that greps consumer repos for hex literals, `--primitive-*` references, and deprecated tokens. Posts a comment with the rule from `ai/rules.md` that matched. Not a "detector"; a grep.

---

## Open questions

- **Deferred milestone: package distribution + symmetric monorepo** — npm publish (`@riverromney/tokens`, `@riverromney/components`), an optional CDN ESM build for bundler-less editorial sites, version-pinned consumers, and the symmetric `packages/tokens/` layout are folded into one future milestone (not a numbered step). Picked up only on a forcing function: a 4th consumer joins, a non-developer needs to consume the system, or the filesystem-sibling coupling actually causes pain. Until then consumers keep the existing `sync-tokens` filesystem path against the root `build/css/`. The path move pays no best-practice dividend without the version contract that publishing provides, so the two are sequenced together or not at all.
- **Benchmark depth** — ~10 prompts × 3 runs is directional. Acceptable for this scale; revisit if results are noisy.
- **Storybook** — deferred. Start with `@web/dev-server` + `*.stories.html`. Reconsider when component count > 8.
- **AT smoke matrix scope** — minimum: NVDA/Firefox, JAWS/Chrome, VoiceOver/Safari macOS, VoiceOver/Safari iOS. TalkBack/Chrome Android optional unless a consumer ships native Android.

---

## Known follow-ups (fix during execution, not before merge)

The third review pass surfaced these issues. None block step 1; each is a small fix in the PR that introduces the affected step.

### Schema bugs (fix in step 3 PR)
- **Version-field collision**: `$schemaVersion` is required on per-component `*.meta.json` *and* on the merged `design-system.json`. Rename per-component to `metaVersion` to disambiguate; merged artifact keeps `$schemaVersion`.
- **`tokensUsed` accepts primitives**: regex `^--(color|font|spacing|radius|motion|shadow|icon|component)-` will match `--font-weight-light` (a primitive). Either add a negative pattern excluding `^--primitive-` or accept that runtime `check_usage` is the enforcement layer and document the schema's limitation.
- **`ariaLive` enum includes `null`**: in JSON Schema, `null` in an enum requires the property be present and explicitly null. Drop `null`; let absence mean "no live region."
- **`name` and `tagName` are identical regex**: if always equal in practice, collapse to a single field.
- **No schema for the merged artifact**: add `schemas/design-system.schema.json` (or extend `meta.schema.json` with a wrapper definition) so the version-mismatch contract has something to validate against.

### Mechanism statements (fix in step 5 PR)
- **CSS-sourcing section names files but not the mechanism**: confirm in the section that brand CSS is loaded on `:root` of the consumer page (it is, via `build/css/<brand>.css`); state that components MUST NOT `@import` brand CSS into shadow DOM — custom properties cascade through shadow boundaries from `:root` automatically.
- **Bundle budget excludes Lit core (fine)** but should state the total cost a consumer adds: ~6 KB gz for Lit + per-component budget. Otherwise the number reads as accounting cleverness.

### Repository scaffolding (fix in step 5 PR — when `packages/` is created)
- **`scripts/codemods/`** (repo root) is referenced in the token-rename protocol but never created in the migration order. Create it at step 5 alongside `packages/` (even if empty), so the first deprecation has somewhere to live.

### Operational policy (fix in step 4 PR)
- **`design-system.json` merge-conflict strategy**: pick one. Either commit-on-CI-only (PR author doesn't regenerate locally; CI regenerates and commits in a follow-up) or accept noisy merges and add a CODEOWNERS rule routing conflicts to a single reviewer. Recommended: commit-on-CI-only.

### Step polish
- **Distribution channel / npm publish / symmetric monorepo** — removed from the step sequence in rev5; folded into the deferred milestone in Open questions. No longer gates any active step.
- **Code Connect step (12) is one sentence.** Expand in its PR: who authors `componentKey`/`nodeId` (engineer; designers don't touch the JSON), where the Figma file lives (link from `ai/DECISION-ENGINE.md` or a new `ai/FIGMA.md`), what happens on Figma rename (CI fetches via Figma MCP `get_metadata` and fails if a referenced node is missing).
- **Trust-level CI rule scope clarification**: the rule at step 3 catches violations only inside `packages/components/**`. Consumer-side hex usage is what step 12's drift grep catches. Add a one-line note where the trust-rule is described saying "consumer-side enforcement is step 12."

---

## Why this is "agentic," not just "a component library with docs"

If we ship steps 1–11 and stop, we have a normal component library plus an MCP. That's good but it's not the article's vision.

The agentic part is step 12 and beyond — the **observe → detect → suggest → fix → learn** loop. Drift signals from product repos and CI feed back into auto-PRs that propose token reconciliation. This plan ships only the cheapest possible version of that (a grep Action that posts a comment); the real loop is a future PR.
