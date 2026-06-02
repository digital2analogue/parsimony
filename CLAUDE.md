# Brand Tokens

River Romney's cross-site design system. Single source of truth for color, typography, and spacing across all sites.

@ai/DESIGN.md
@ai/rules.md

---

## Repo Structure

```
tokens/
  primitives/       Raw values — hex colors, px sizes. Never referenced directly in UI.
  semantic/         Base dark-theme semantic tokens (named roles → primitives).
  components/        Component-scoped tokens (badge, button, input, alert, …).
  brands/           Sub-brand overrides (decision-engine, dot-art, dot-blog).
build/
  css/              Built output — one CSS file per brand. Generated; consumed by product repos.
packages/
  components/       Framework-agnostic Lit web components (rr-*). Each ships its own
                    *.meta.json (props/tokens/a11y/rules) and *.figma.ts (Code Connect).
  tokens/           Publishable @riverromney/tokens — ships the built brand CSS so
                    consumers `npm install` instead of hand-copying. Built by prepack.
  mcp/              MCP server — list_components, get_component, check_usage.
schemas/
  meta.schema.json  JSON Schema each component *.meta.json validates against.
scripts/
  build-brands.mjs            Runs Style Dictionary for all brands. The token build command.
  generate-docs.mjs           Regenerates docs/index.html from token JSON.
  build-design-system-json.mjs Merges *.meta.json + CEM into design-system.json (deterministic — sorted, no timestamp).
  rules.mjs                   Single source of truth for the lint rules (no hex / no primitive / no hardcoded size / deprecated). Imported by validate, the MCP, and drift-lint.
  validate.mjs                Build gate: meta.json schema + lint rules + token-reference resolution.
  drift-lint.mjs              Scans a consumer repo using the shared rules. `npm run drift -- <dir>`.
  drift_audit.py              Figma-variable-vs-token drift auditor (separate concern from code linting).
design-system.json   Generated artifact — merged component metadata + Custom Elements Manifest, read by the MCP server.
.github/workflows/
  ci.yml             Runs on every push/PR: validate → build → build:meta → artifact-staleness check → tests.
  drift-lint.yml     Manual (workflow_dispatch) scan of a consumer repo for drift.
  publish.yml        On-demand publish of @riverromney/tokens to GitHub Packages.
docs/
  index.html         Base dark theme design system reference. Open file:// directly in browser.
AGENTS.md            Vendor-neutral guide for agents *consuming* the system in product repos.
```

> **One repo, real workspaces.** `packages/*` are npm workspaces — run `npm ci`
> once at the root. The lint rules live in exactly one place (`scripts/rules.mjs`);
> never re-implement a regex in a checker, import from there.

## Token Layers

1. **Primitives** (`tokens/primitives/`) — raw hex values. Never use in UI code.
2. **Semantic** (`tokens/semantic/`, `tokens/brands/`) — named roles (background, foreground, border). These are what UI code imports.
3. **Component** (`tokens/components/`) — tokens scoped to a single component (badge, button, input, …), consumed by the matching `rr-*` web component in `packages/components/`.

## Workflow: Making a Token Change

**Always start here, never in the product repo.**

1. Edit the appropriate file:
   - New color value → `tokens/primitives/color.tokens.json`
   - Semantic role change → `tokens/semantic/` or `tokens/brands/<brand>.tokens.json`
   - Component-scoped value → `tokens/components/<component>.tokens.json`
2. Build tokens: `npm run build` (or `node scripts/build-brands.mjs`)
3. Regenerate docs: `npm run docs` (or `node scripts/generate-docs.mjs`)
   - Or run both at once: `npm run build:all`
4. Validate: `npm run validate` (rejects hex literals, primitive/deprecated refs, and dangling token references)
5. If a component's metadata changed, rebuild the artifact: `npm run build:meta` → regenerates the CEM and `design-system.json`. **Commit the regenerated artifact** — CI fails if it's stale.
6. Check the output in `build/css/<brand>.css`
7. Go to the consumer repo and run `npm run sync-tokens` to surface any drift

CI (`.github/workflows/ci.yml`) runs steps 4–5 plus the workspace tests on every push/PR, so a broken reference, a malformed `meta.json`, or a stale artifact can't land.

## Distribution

`@riverromney/tokens` (`packages/tokens/`) makes the built brand CSS a real,
versioned dependency so consumers stop hand-copying the token block. Preview the
publish tarball anytime with `npm pack --workspace @riverromney/tokens --dry-run`.

Publishing targets **GitHub Packages** under the `@riverromney` scope via
`.github/workflows/publish.yml` (on-demand only). Because GitHub Packages routes
by the account matching the scope, the one-time setup is: create a `riverromney`
GitHub org and add a `write:packages` PAT as the `PACKAGES_TOKEN` Actions secret
(the repo stays under `digital2analogue` so the Vercel wiring is untouched).
Steps in `packages/tokens/README.md`. The components/mcp packages are not
published yet.

## Sub-Brands

| Brand | Token file | Built CSS | Notes |
|---|---|---|---|
| Base (dark) | `tokens/semantic/` | — | All `.com`, `.design` sites |
| decision-engine | `tokens/brands/decision-engine.tokens.json` | `build/css/decision-engine.css` | Light-mode enterprise UI. Geist font exception. |
| dot-art | `tokens/brands/dot-art.tokens.json` | `build/css/dot-art.css` | Pure black canvas for photo |
| dot-blog | `tokens/brands/dot-blog.tokens.json` | `build/css/dot-blog.css` | 18px body, relaxed line-height |

## Components & Agent Tooling

- **`packages/components/`** — framework-agnostic Lit web components (`rr-*`). All are wired to Figma via Code Connect (`*.figma.ts`). Three (`rr-badge`, `rr-button`, `rr-input`) are fully productionized with machine-readable `*.meta.json` (props, slots, events, tokens used, a11y contract, applicable rules) validated against `schemas/meta.schema.json`. See `AGENTS.md` for consumer-facing usage.
- **`design-system.json`** — generated by `npm run build:meta`. Merges every `*.meta.json` with the Custom Elements Manifest into one artifact the MCP server reads. Never hand-edit.
- **`packages/mcp/`** — MCP server exposing the system to agents:
  - `list_components()` — names and summaries
  - `get_component(name)` — full contract (props, events, tokens, rules, a11y, examples)
  - `check_usage(snippet)` — flags rule violations (hex literals, `--primitive-*` refs, deprecated tokens) **before** code is written
- **`npm run validate`** — static gate over `tokens/` and components; enforces the hard rules below in CI.

## AI Reference Files

- `@ai/DESIGN.md` — resolved token tables for the **base dark theme** only.
- `@ai/DECISION-ENGINE.md` — token decisions, naming conventions, deleted tokens, and architecture intent for the decision-engine sub-brand. Read this before touching any DE tokens.
- `@ai/rules.md` — hard and soft rules for token usage across all sites.

## Hard Rules

- Never define color tokens inline in product repos — always trace back here first
- Never reference primitive tokens (`--primitive-color-*`) in UI code
- All text/background pairings must pass WCAG AA (4.5:1). Verify before adding a new semantic token.
- `build/` is generated — never hand-edit it
