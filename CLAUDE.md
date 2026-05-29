# Brand Tokens

River Romney's cross-site design system. Single source of truth for color, typography, and spacing across all sites.

@ai/DESIGN.md
@ai/rules.md

---

## Repo Structure

```
tokens/
  primitives/       Raw values — hex colors, px sizes. Never referenced directly in UI.
  base/             Base dark-theme semantic tokens (references primitives).
  semantic/         Named role tokens (color, spacing, typography, motion, …).
  components/        Component-level tokens (badge, button, input, …) — styling source for the web components.
  brands/           Sub-brand overrides (decision-engine, dot-art, dot-blog).
build/
  css/              Built output — one CSS file per brand. Consumed by product repos.
packages/
  components/        Framework-agnostic Lit web components (<rr-*>). Each has a *.ts, *.test.ts, *.figma.ts, and *.meta.json.
  mcp/               In-repo MCP server (list_components / get_component / check_usage) serving design-system.json.
schemas/
  meta.schema.json   JSON Schema for *.meta.json. Enforced by scripts/validate.mjs.
scripts/
  build-brands.mjs            Runs Style Dictionary for all brands. The only token build command.
  generate-docs.mjs           Regenerates the color primitives section in docs/index.html from token JSON.
  validate.mjs                Validates every *.meta.json against the schema + lints component sources (no hex / no --primitive-*).
  build-design-system-json.mjs  Merges all *.meta.json into the committed design-system.json artifact.
docs/
  index.html         Base dark theme design system reference. Open file:// directly in browser.
design-system.json   Committed artifact (all component metadata) that the MCP server reads. Generated — never hand-edit.
```

## Token Layers

1. **Primitives** (`tokens/primitives/`) — raw hex values. Never use in UI code.
2. **Semantic** (`tokens/base/`, `tokens/brands/`) — named roles (background, foreground, border). These are what UI code imports.
3. **Component** (`tokens/components/`) — component-specific roles (e.g. `component.button.primary.background.default`) that map semantic tokens to a component's parts. These are the styling source for the `<rr-*>` web components in `packages/components/`; component shadow CSS references only these and semantic tokens, never primitives or hex.

## Workflow: Making a Token Change

**Always start here, never in the product repo.**

1. Edit the appropriate file:
   - New color value → `tokens/primitives/color.tokens.json`
   - Semantic role change → `tokens/base/` or `tokens/brands/<brand>.tokens.json`
2. Build tokens: `npm run build` (or `node scripts/build-brands.mjs`)
3. Regenerate docs: `npm run docs` (or `node scripts/generate-docs.mjs`)
   - Or run both at once: `npm run build:all`
4. Check the output in `build/css/<brand>.css`
5. Go to the consumer repo and run `npm run sync-tokens` to surface any drift

## Workflow: Adding or Changing a Component

1. Edit/add the component under `packages/components/src/<name>/` (`*.ts`, `*.test.ts`, `*.figma.ts`).
2. Author/update its `*.meta.json` — props, slots, events, `cssParts`, `tokensUsed`, `accessibility`, and the `figma` block (`nodeId` from the `*.figma.ts` Code Connect URL). It must validate against `schemas/meta.schema.json`.
3. `npm run validate` — schema-checks every `*.meta.json` and lints component sources (no hex, no `--primitive-*`).
4. `npm run build:meta` — regenerates the committed `design-system.json` the MCP serves. Never hand-edit that file.

## Sub-Brands

| Brand | Token file | Built CSS | Notes |
|---|---|---|---|
| Base (dark) | `tokens/base/` | — | All `.com`, `.design` sites |
| decision-engine | `tokens/brands/decision-engine.tokens.json` | `build/css/decision-engine.css` | Light-mode enterprise UI. Geist font exception. |
| dot-art | `tokens/brands/dot-art.tokens.json` | `build/css/dot-art.css` | Pure black canvas for photo |
| dot-blog | `tokens/brands/dot-blog.tokens.json` | `build/css/dot-blog.css` | 18px body, relaxed line-height |

## AI Reference Files

- `@ai/DESIGN.md` — resolved token tables for the **base dark theme** only.
- `@ai/DECISION-ENGINE.md` — token decisions, naming conventions, deleted tokens, and architecture intent for the decision-engine sub-brand. Read this before touching any DE tokens.
- `@ai/rules.md` — hard and soft rules for token usage across all sites.

## Hard Rules

- Never define color tokens inline in product repos — always trace back here first
- Never reference primitive tokens (`--primitive-color-*`) in UI code
- All text/background pairings must pass WCAG AA (4.5:1). Verify before adding a new semantic token.
- `build/` is generated — never hand-edit it
