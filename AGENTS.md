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

`@riverromney/components` ships three framework-agnostic Lit web components:

| Component | Summary |
|---|---|
| `<rr-badge>` | Status badge / chip. 9 variants map to component tokens. |
| `<rr-button>` | Button with primary/secondary/danger variants, 3 sizes, loading spinner. |
| `<rr-input>` | Form-associated text input with label, helper/error text, ElementInternals. |

### Installation

```bash
npm install @riverromney/components lit
```

### Usage (vanilla / any framework)

```js
import '@riverromney/components';
```

Then use the custom elements in HTML:

```html
<rr-button variant="primary">Save</rr-button>
<rr-badge variant="success">Approved</rr-badge>
<rr-input label="Email" placeholder="you@example.com"></rr-input>
```

### Usage in React 19

React 19 passes props to custom elements natively. No wrappers needed.

```tsx
/// <reference types="@riverromney/components/react" />
import '@riverromney/components';

function Actions() {
  return (
    <div>
      <rr-button>Approve</rr-button>
      <rr-button variant="danger">Deny</rr-button>
      <rr-badge variant="success">Done</rr-badge>
    </div>
  );
}
```

The `@riverromney/components/react` reference adds JSX IntrinsicElements types for autocomplete. Add it as a `/// <reference>` directive or in `tsconfig.json` `"types"` array.

### Event handling in React

React 19 supports `onInput` and `onChange` on custom elements natively. For `<rr-input>`:

```tsx
<rr-input
  label="Name"
  onInput={(e: Event) => setName((e.target as HTMLInputElement).value)}
/>
```

### MCP tools (in-repo at `packages/mcp`)

- `list_components()` — names and summaries
- `get_component(name)` — props, slots, events, tokens used, rules, examples, accessibility contract
- `check_usage(snippet)` — flags violations of rules in `ai/rules.md` (hex literals, `--primitive-*` references, deprecated tokens)

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
