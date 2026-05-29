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
  brands/           Sub-brand overrides (decision-engine, dot-art, dot-blog).
build/
  css/              Built output — one CSS file per brand. Consumed by product repos.
scripts/
  build-brands.mjs   Runs Style Dictionary for all brands. The only build command.
  generate-docs.mjs  Regenerates the color primitives section in docs/index.html from token JSON.
  build-design-system-json.mjs  Merges every *.meta.json into design-system.json (MCP source).
  validate.mjs       Validates *.meta.json against the schema, lints component sources, checks every <rr-*> has a meta.json, and verifies design-system.json is in sync. Run by CI on every push/PR.
docs/
  index.html         Base dark theme design system reference. Open file:// directly in browser.
packages/
  components/        Framework-agnostic Lit web components (rr-*). One dir per component with .ts, .test.ts, .figma.ts, .meta.json.
  mcp/              In-repo MCP server serving design-system.json (list_components, get_component, check_usage).
design-system.json  Generated artifact merging all *.meta.json — the MCP's source of truth. Regenerate after editing any .meta.json.
schemas/
  meta.schema.json  JSON Schema every *.meta.json must validate against.
```

## Token Layers

1. **Primitives** (`tokens/primitives/`) — raw hex values. Never use in UI code.
2. **Semantic** (`tokens/base/`, `tokens/brands/`) — named roles (background, foreground, border). These are what UI code imports.
3. **Component** (`tokens/components/*.tokens.json`) — maps semantic tokens to component-specific roles (e.g. `component.button.primary.background.default`). Consumed by the Lit web components in `packages/components/`, whose shadow CSS references these `--component-*` variables only — never hex or semantic tokens directly.

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
- `@ai/FIGMA.md` — Figma file key, the code↔design node-ID map, and why `figma.componentKey` is empty (Code Connect needs a Developer seat). Read before touching any `figma` block in a `*.meta.json`.

## Hard Rules

- Never define color tokens inline in product repos — always trace back here first
- Never reference primitive tokens (`--primitive-color-*`) in UI code
- All text/background pairings must pass WCAG AA (4.5:1). Verify before adding a new semantic token.
- `build/` is generated — never hand-edit it
