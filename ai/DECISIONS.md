---
scope: decisions
status: active
applies-to: [base, decision-engine, dot-art, dot-blog]
last-updated: 2026-05-28
---

# Design System — Decision Log

Running record of non-obvious design and architecture decisions. Each entry captures the **what**, **why**, and **what was rejected**. Commit messages and `ai/DECISION-ENGINE.md` are the primary audit trail; this log captures decisions whose rationale would otherwise be lost.

Add an entry when you make a call that a future contributor (or AI session) might reasonably second-guess.

---

## Token Architecture

### D-01 · Three-tier token hierarchy (primitives → semantic → brand)
**Date:** 2026-04-06  
**Decision:** Raw values live only in `tokens/primitives/`. Semantic intent lives only in `tokens/semantic/` (and `tokens/brands/` for sub-brand overrides). UI code always references semantic tokens via CSS custom properties. Primitives are never referenced in product code.  
**Why:** Allows the complete color palette to shift (e.g., darkening all greens) without touching product CSS. Semantic tokens are the stable API contract.  
**Rejected:** Flat token list (everything in one file) — loses the separation between "what value is this" and "what does this mean here."

### D-02 · W3C DTCG format for token JSON
**Date:** 2026-04-06  
**Decision:** Use the W3C Design Tokens Community Group spec (`$value`, `$type`, `$description` with `{alias}` reference syntax) rather than Tokens Studio legacy format.  
**Why:** Standards-aligned; directly importable into Figma 2024+ without a plugin; compatible with Style Dictionary v4 natively; future-proof as tooling converges on the spec.  
**Rejected:** Tokens Studio legacy format — would require a transform step and couples us to a single vendor.

### D-03 · Namespace primitives under `primitive.*`
**Date:** 2026-04-17 (commit 5455b46)  
**Decision:** All primitive tokens are prefixed `primitive.color.*`, `primitive.space.*`, `primitive.font.*` etc. Semantic tokens are at the top level: `color.background.*`, `spacing.*`, etc.  
**Why:** Prevents namespace collisions between primitive and semantic layers in the merged Style Dictionary context. Before this, `color.green.950` (primitive) and `color.background.default` (semantic) lived in the same flat namespace and could conflict.  
**Rejected:** No namespace prefix — worked initially but broke as the semantic layer grew.

### D-04 · Tokens stay at repo root permanently
**Date:** 2026-05-16 (plan rev5, commit dbe6931)  
**Decision:** Token files stay at the repository root (`tokens/`). The monorepo workspaces restructure (originally plan step 2) was permanently removed, not deferred.  
**Why:** Solo-practitioner reality check. Two consumer repos (`decisioning-table`, `portfolio-vercel`) both hardcode paths to `scripts/build-brands.mjs` and `build/css/<brand>.css`. Moving everything to `packages/tokens/` adds monorepo toolchain overhead and path migrations for zero practical benefit — the `sync-tokens` script already works.  
**Rejected:** Moving to `packages/tokens/` (npm workspaces) — the overhead wasn't justified until there's a second maintainer or an external npm consumer.

### D-05 · Distribution via sync-tokens, not npm publish
**Date:** 2026-04-06 (PRD), confirmed rev5  
**Decision:** Consumer repos pull the built CSS via a `sync-tokens` script that copies `build/css/<brand>.css`. No npm package is published.  
**Why:** Zero registry infrastructure. One maintainer, two consumers, both in repos River controls. npm publish becomes worthwhile when there's an external consumer or a CI/CD gate that needs a versioned artifact.  
**Rejected:** Publishing `@riverromney/tokens` to npm — overhead without a clear consumer outside of River's own repos.

---

## Color System

### D-06 · Dark-first, single accent color
**Date:** 2026-04-06  
**Decision:** Base theme is dark (near-black canvas `#0A0D0A`). Phosphor green (`#4ADE6E`) is the single allowed accent — all interactivity, all links, all CTAs use it. No secondary accent.  
**Why:** Visual identity constraint. Terminal-meets-editorial aesthetic. Multiple accents introduce hierarchy ambiguity; one accent makes interactivity immediately legible.  
**Rejected:** Blue or purple accent (conventional SaaS) — inconsistent with the established brand identity.

### D-07 · Accent green is never resting text
**Date:** 2026-04-06  
**Decision:** `color/foreground/action` and `color/foreground/accent-green` (phosphor green) are forbidden for static, resting text — only links, active states, intentional emphasis.  
**Why:** High-chroma color at high contrast demands attention. If it's everywhere, it signals nothing. Reserve it so it always means something.

### D-08 · Rename color.text → foreground, color.bg → background
**Date:** 2026-04-09 (commits cb3ab25, ace78d8)  
**Decision:** Token category names use the full words: `color.background.*`, `color.foreground.*`, `color.border.*`.  
**Why:** `text` is ambiguous (is it text color? a text node? a text input?). `foreground` is unambiguous and matches Figma's terminology. `bg` is fine colloquially but full words are more legible for AI context consumption.

### D-09 · Rename foreground.primary/secondary → foreground.default/alt
**Date:** 2026-04-26 (commit 401131f area)  
**Decision:** `foreground.primary` became `foreground.default`, `foreground.secondary` became `foreground.alt`. Corresponding background tokens followed the same pattern.  
**Why:** "Primary" implies a hierarchy that doesn't apply to all uses (primary text ≠ primary action). "Default" communicates "the normal thing" more clearly. "Alt" communicates "an alternative, not a lesser thing."

### D-10 · WCAG AA is enforced at the token level
**Date:** 2026-04-06  
**Decision:** Every token in `color.foreground.*` that could be used as text must pass 4.5:1 against its intended background. This is documented in `$description` fields and verified during token addition.  
**Why:** Accessibility regressions are caught before they reach product code, not after. The token layer is the right enforcement point — stricter than linting component CSS, less noisy than Lighthouse audits.  
**Exception:** Disabled element text (`foreground.disabled`) is exempt per WCAG 1.4.3.

### D-11 · Brighten foreground.danger to pass WCAG AA
**Date:** 2026-05-13 (commit 6e1bbe9)  
**Decision:** `red.500` was brightened from `#D03027` (3.85:1 on dark canvas) to `#E73027` (4.51:1). `background.danger` was simultaneously rerouted from `red.500` to `red.600` (`#C8002E`) to preserve white-on-red contrast (6.0:1 AA), since brightening `red.500` would have dropped that to 4.33:1.  
**Why:** The original value failed WCAG AA for `foreground.danger` text on the dark canvas. Documented in `ai/DESIGN.md` as 4.6:1 — that figure was wrong.  
**Rejected:** Routing around the token — creating a dedicated error text color that didn't alias through `red.500`. Kept the alias chain intact to preserve single-source behavior.

### D-12 · red.500 ↔ red.600 number swap
**Date:** 2026-04-28 (commit in DECISION-ENGINE.md)  
**Decision:** The numeric labels of `red.500` and `red.600` were swapped. After swap: higher numbers are darker (conventional). Before: `red.500` was darker than `red.600`, which violated numeric convention.  
**Why:** Numeric tint ramps should be monotone — 500 is lighter than 600. The inversion was a silent foot-gun for anyone adding a new step to the red ramp.  
**Impact:** Semantic CSS variables were unaffected — resolved hex values remained identical. Only the primitive token names changed.

### D-13 · Named slots instead of numeric steps for anomalous colors
**Date:** 2026-04-28  
**Decision:** Colors that can't fit cleanly into a numeric tint ramp get named slots instead: `color/blue/sky`, `color/green/chip`, `color/green/approve`, `color/gray/navy`.  
**Why:** A named slot is honest — it says "this is a specific color with a specific purpose" rather than implying a systematic position on a scale. Inserting a perceptually anomalous value into a numeric ramp requires either breaking the monotone constraint or creating a collision.  
**Example:** `blue.sky` (#93C5FD) is a dark-theme accent color, perceptually lighter than `blue.250` — it cannot be numbered 300 without inverting the ramp.

### D-14 · Accent-bold tier for saturated identity surfaces
**Date:** 2026-05-16 (commit 943d6b3)  
**Decision:** Added a `-bold` suffix tier for saturated accent fills intended for avatars and identity badges: `background.accent-{color}-bold`. Tint fills (`background.accent-{color}`) remain for chip/tag contexts.  
**Why:** Avatar backgrounds need a vivid, saturated color to be legible at small sizes. The existing tint fills (`#0F2016`, `#0D1830`) are too dark. Bold fills are opaque, saturated colors that pass white-text contrast (AA).  
**Suffix chosen:** `-bold` over `-vivid` (used by Material/Spectrum). River's preference — matches the "bold weight" mental model and avoids vendor-specific terminology.  
**New primitives added:** `indigo.700`, `sky.700`, `emerald.600` (via `color/sky/700`, etc.), `amber.600`.

### D-15 · White text on all accent-bold fills
**Date:** 2026-05-16 to 2026-05-28  
**Decision:** All `foreground.accent-on-*-bold` tokens use white (`neutral.white`). Dark text was rejected for every bold fill.  
**Why:** Bold fills are saturated, mid-to-dark value. Dark text on indigo-700 (7.98:1 AAA for white) or emerald-600 (5.47:1 AA for white) would require near-black text which clashes with the color identity of the surface. White reads clean on all five bold fills.  
**Amber edge case:** `amber.600` (#B45309) passes 5.02:1 AA for white — barely, but passes. Dark text on amber-600 would give 4.17:1, which fails. White was the only option.

---

## Typography

### D-16 · Space Grotesk light (300) for all display and title tokens
**Date:** 2026-04-22 (commit 23d6645)  
**Decision:** `font.display` and all `font.title.*` tokens use weight 300 (light). Body uses 400 (regular). Labels use 400 (regular) or 500 (medium for "strong" variants). 600/700 exist as primitives for ad-hoc use only.  
**Why:** The terminal-meets-editorial visual identity reads as more refined at light weight for headings. Light weight at large sizes creates visual distinction from the 400-weight body text, establishing hierarchy without using size alone.  
**Common mistake:** Previous state had title tokens at 400 (fixed in commit 23d6645). AI sessions sometimes revert to 400 because it's the conventional weight for headings in most systems.

### D-17 · Geist font exception for decision-engine
**Date:** 2026-05-10 (commit 7e7eff1)  
**Decision:** The DE sub-brand uses Geist instead of Space Grotesk for UI labels, buttons, and headings. This is an approved exception to the "Space Grotesk only" rule.  
**Why:** Geist is the de facto font for enterprise data UI (Vercel ecosystem, Linear). DE is a fintech/enterprise product where Geist reads as conventional and trustworthy rather than personal-brand-expressive. Space Grotesk would read as out-of-character in a data-dense table interface.  
**Scope:** DE only. All other River Romney properties use Space Grotesk.

### D-18 · font-family tokens extracted to semantic layer
**Date:** 2026-05-10 (commit 7e7eff1)  
**Decision:** Font family is exposed as a semantic token (`font-family/sans`, `font-family/serif`, `font-family/mono`) so sub-brands can override just the family without redefining every composite typography token.  
**Why:** DE's Geist override would otherwise require rewriting all 19+ typography composite tokens. With semantic family tokens, DE overrides just `font-family/sans = Geist` and all composite tokens that reference it resolve correctly.

---

## Spacing & Scale

### D-19 · Semantic spacing aliases (spacing.component, spacing.layout, etc.)
**Date:** 2026-04-15 (commit 6d13d87)  
**Decision:** Added a semantic spacing layer (`spacing.micro`, `spacing.tight`, `spacing.inline`, `spacing.element`, `spacing.component`, `spacing.group`, `spacing.layout`, `spacing.block`, `spacing.page`, `spacing.section`) as aliases to primitives.  
**Why:** Primitive names (`space.lg`, `space.2xl`) communicate scale but not intent. Semantic names communicate where to use the value. An AI or developer choosing between `space.xl` (32px) and `space.2xl` (48px) has to guess; choosing between `spacing.group` and `spacing.layout` is self-documenting.

---

## Web Components

### D-20 · LitElement for web components, React 19 native CE support
**Date:** 2026-05-07 (commit 6a6c401 area)  
**Decision:** Web components use LitElement. React integration uses React 19's native custom element support — no `@lit/react` wrappers.  
**Why:** LitElement provides reactive properties, shadow DOM, and a minimal footprint without full framework overhead. React 19's native CE support means no adapter library — JSX types cover all 20 components via a single subpath export (`@riverromney/components/react`).  
**Rejected:** `@lit/react` — adds a dependency and requires manual wrapper for every component. React 19 made this unnecessary.

### D-21 · Component tokens (`--component-*`) as the styling layer
**Date:** 2026-05-07  
**Decision:** Each component exposes `--component-*` CSS custom properties (e.g., `--component-button-bg`, `--component-badge-border`) that reference semantic tokens. Product CSS never touches shadow DOM internals directly.  
**Why:** Shadow DOM encapsulates styles — you can't reach inside with a selector. Component tokens are the intentional theming API. They also let DE override a specific component's appearance by setting `--component-*` in its brand CSS, without breaking the base theme.

### D-22 · Form-associated custom elements via ElementInternals
**Date:** 2026-05-07  
**Decision:** `rr-input`, `rr-select`, `rr-checkbox`, `rr-toggle`, `rr-textarea`, `rr-radio-group` use `ElementInternals` and `formAssociated = true` to participate in native HTML forms.  
**Why:** Without `ElementInternals`, custom elements are invisible to `<form>` elements — `FormData` won't include their values, `required` validation won't fire, and they won't serialize with the form. `ElementInternals` gives the full native form control contract.  
**Test guard:** `happy-dom` doesn't implement `ElementInternals.setFormValue`. Tests guard with `typeof this.internals.setFormValue === 'function'`.

### D-23 · Hidden-input focus pattern for checkbox/toggle/radio
**Date:** 2026-05-08  
**Decision:** The real `<input>` is positioned `absolute; inset: 0; opacity: 0; z-index: 1` inside the visual wrapper. CSS `input:focus-visible ~ .visual-element { outline: ... }` drives the focus ring from native focus events.  
**Why:** Gives free keyboard navigation, tab order, and focus ring without reimplementing focus management. The browser handles focus state; CSS handles the visual ring via the `:focus-visible ~ sibling` selector.  
**Rejected:** Custom `tabIndex` management + `keydown` handler — more code, more edge cases, breaks browser autofill and AT integration.

### D-24 · native `<dialog>` element for rr-dialog
**Date:** 2026-05-09 (commit 714610d)  
**Decision:** `rr-dialog` wraps the native `<dialog>` element rather than building a custom overlay with `position: fixed` and manual focus trap.  
**Why:** Native `<dialog>` provides a free focus trap, `Escape` key dismissal, and top-layer stacking context — no `@a11y/focus-trap` or `inert` polyfill needed. It's the correct semantic element.  
**Test guard:** `happy-dom` doesn't implement `dialog.showModal()`. Both `showModal()` and `close()` are guarded with `typeof fn === 'function'` checks in tests.

### D-25 · Select uses options[] prop, not slotted native options
**Date:** 2026-05-08  
**Decision:** `rr-select` takes `options: SelectOption[]` as a reactive property rather than slotting native `<option>` elements.  
**Why:** Shadow DOM's `<select>` cannot contain slotted `<option>` elements — the browser only recognizes `<option>` as a direct child of `<select>`, not slot content. Slotted options appear visually but don't populate the options list. The prop array approach works cleanly inside shadow DOM.  
**Rejected:** Light DOM select (no shadow) — loses style encapsulation and component consistency.

### D-26 · MCP server — complete and frozen
**Date:** 2026-05-16 (plan rev5)  
**Decision:** The MCP server (step 8 of the web components plan) is complete. No further investment until external client demand exists.  
**Why:** At current scale (one maintainer, two consumer repos), the `DESIGN.md` + `CLAUDE.md` approach gives AI sessions full design context without running an MCP server. MCP adds value when a team needs programmatic component lookup or when the system is consumed across organizational boundaries.  
**Superseded:** D-34 (2026-06-11) — expansion approved for external-agent consumption; always-on context remains the internal path.

---

## Figma

### D-27 · Base-dark Figma file covers only the base dark theme
**Date:** 2026-05-10  
**Decision:** The Figma Foundations Library (`4aOEBHcnAv2Kbn0g1arL78`) covers only the base dark theme. DE light-mode is planned as a separate file (v2). DE tokens are excluded from the base-dark drift audit.  
**Why:** Mixing base-dark and DE variables in one Figma file creates mode complexity — every variable needs two mode values, and DE's entirely different color palette makes the base-dark variables confusing in the DE design context.

### D-28 · All semantic Figma variables use VARIABLE_ALIAS to primitives
**Date:** 2026-05-10  
**Decision:** Every variable in the Figma Color collection is an alias (VARIABLE_ALIAS) to a Primitives collection variable. No semantic Figma variable has a raw RGB value.  
**Why:** If the primitive changes (e.g., brightening `red.500`), all semantic variables that alias it resolve automatically without manual updating. This mirrors how the DTCG JSON alias system works.

### D-29 · Code Connect publish blocked by Figma 403 — platform issue
**Date:** 2026-05-28  
**Decision:** All 18 `.figma.ts` files parse cleanly (`All Code Connect files are valid`). The 403 error on `figma connect publish` is a Figma platform issue — their new scoped token UI does not expose the Code Connect Write scope even when all available scopes are selected.  
**Status:** Not our problem to fix. File a Figma support ticket or monitor github.com/figma/code-connect/issues.

### D-30 · Drift audit excludes DE-only tokens from score
**Date:** 2026-05-28 (commit fb26c70)  
**Decision:** Tokens sourced from `brands/decision-engine.tokens.json` that are absent from the base-dark Figma file are routed to a `de_only` bucket in `drift_audit.py` and excluded from the drift score. They appear in the report under "DE-Only Tokens (Expected — Not Scored)".  
**Why:** The 11 DE-only tokens (e.g., `color.foreground.secondary`, `color.background.elevated`) are not missing — they are correctly absent from the base-dark file. Counting them as "missing" would make the audit permanently score below 100 even when the system is fully in sync.

---

## Naming Conventions

### D-31 · accent-on-[color] pattern for foreground-on-fill tokens
**Date:** 2026-04-27  
**Decision:** Tokens for text/icons on colored accent fills use the pattern `foreground.accent-on-{color}` (e.g., `accent-on-indigo`, `accent-on-amber-bold`), not `foreground.on-accent-{color}`.  
**Why:** `accent-on-*` groups all accent family tokens together alphabetically in the token list. `on-accent-*` scatters "on-" tokens away from their corresponding fill tokens.  
**Renamed:** `foreground.on-accent-blue` → `foreground.accent-on-blue`, etc. (2026-04-27).

### D-32 · Accent color tokens are not semantic
**Date:** 2026-04-28 (DECISION-ENGINE.md)  
**Decision:** `foreground.accent-green`, `foreground.accent-blue`, `foreground.accent-purple` etc. are palette slots, not semantic intent tokens. They can be used for any bespoke UI need — data visualization, decorative highlights, product-specific component theming.  
**Why:** The fact that Approve/Deny/Review outcomes in DE happen to use green/red/purple is a product-level decision, not a design system contract. Calling these "semantic" would incorrectly imply the colors are fixed in meaning.  
**Contrast:** `foreground.danger` IS semantic — it always means "error, destructive, or deny." The red color is load-bearing. The accent slots' colors are not.

### D-33 · Deleted tokens — do not re-add without strong reason
**Date:** 2026-04-27 to 2026-04-28  
See `ai/DECISION-ENGINE.md` for the full deleted-token registry. Key deletions:
- `foreground.accent` (generic) → replaced by named `foreground.accent-[color]` slots
- `foreground.primary` → renamed `foreground.default`
- `feedback.error` → redundant with `foreground.danger`
- `foreground.accent-red` → red is semantic in this system; non-semantic red slot creates ambiguity

---

## MCP Server

### D-34 · MCP expansion — supersedes the D-26 freeze
**Date:** 2026-06-11  
**Decision:** Expand the MCP server per `docs/mcp-expansion-prd.md` — Phase 1 token awareness (`get_token`, `find_token`, `get_spacing`), Phase 2 design reasoning (`get_rule`, `get_decision`, `check_assembly`), Phase 3 brand-aware (`get_brand`, `compare_brands`). Supersedes D-26.  
**Why:** The rationale changed, not the facts. D-26's reasoning — always-on `DESIGN.md` + `CLAUDE.md` context covers internal sessions — still holds and remains the internal path. The expansion targets **external agents that don't have the repo checked out**, and makes the server itself demonstrate the Parsimony thesis: a design system an AI can reason with, not just query. Prompted by comparison with DesignerPunk ([github.com/3fn/DesignerPunk](https://github.com/3fn/DesignerPunk)), whose Civitas layer validates queryable rationale as an approach — adopted here at parsimony scale: one server, ~8 tools, parsing files that already exist, versus 88 steering docs and 3 servers.  
**Rejected:** Waiting for external client demand (D-26's unfreeze trigger) — the MCP is positioning/portfolio infrastructure now, not demand-driven tooling. Also rejected: DesignerPunk-style multi-server / named-agent architecture — wrong scale for one maintainer and contrary to the project's name.  
**Constraints carried forward:** read-only forever; token values resolve from `tokens/**/*.tokens.json` (DESIGN.md supplies usage prose only); deprecation is brand-scoped so `get_token` and `check_usage` cannot disagree; `check_assembly` v1 is an enumerated three-rule set, not general design-intent inference.

---

## Open / Pending Decisions

| # | Question | Status |
|---|----------|--------|
| OD-1 | Should the PRD at `docs/brand-design-system-prd.md` be updated to reflect post-April state? | Open — PRD is stale since April 2026 |
| OD-2 | When does the DE Figma file (v2) get built? | Deferred — no timeline |
| OD-3 | Step 7 (format benchmark — JSON vs CSS performance) | Deferred — low priority |
| OD-4 | Should `rr-*` components be published to npm? | Deferred — no external consumer yet |
| OD-5 | Code Connect publish 403 — Figma platform bug | Waiting on Figma support |
| OD-6 | DE font-size-2xs debt — hardcoded 10px/9px on `.dt-avatar` | In decisioning-table CSS; needs `var(--primitive-font-size-2xs)` |
