# Work Order — Parsimony

_From inspection: `reports/2026-07-15-inspection.md` · Written: 2026-07-15_

Reds get fixed now. Yellows get scheduled. Greens get left alone (and celebrated). Every item cites its station and evidence — no vibes-based work items. The team owns prioritization; this is the technician's recommendation.

## 🔴 Fix now (reds)

None. Zero red stations this pass.

## 🟡 Schedule (yellows)

### 1. Reconcile the button across design and code (ghost vs danger)
- **Station:** 6, Orchestration · **Evidence:** [verified] Figma Button set ships `Variant=ghost`; `button.ts` ships `danger`; `button.figma.ts` maps `ghost → 'ghost'`, emitting a variant that doesn't exist in code
- **First move:** Add `ghost` to `rr-button` (+ `tokens/components/button.tokens.json` entries — the generation test independently wanted a quiet button, so this is demand-backed); add `Danger` variant + loading/active/focus-visible states to the Figma set; fix the Code Connect map
- **AI assist:** Agent can do the code/token/Code Connect side end-to-end and push the Figma variants via the Figma MCP; human eyeballs the Figma result
- **Done when:** Figma variant/state set ↔ `ButtonVariant`/states match 1:1 and Code Connect emits only valid variants
- **Effort:** M · **Suggested timing:** this week — it's live drift in the flagship component

### 2. Register the MCP so agents can actually reach the system
- **Station:** 10, Agent access · **Evidence:** [verified] `packages/mcp` exists with 20+ tools; no `.mcp.json` anywhere; this very session ran six MCP servers but not parsimony's
- **First move:** Commit `.mcp.json` at the parsimony repo root (and consumer repos) pointing at `packages/mcp`; re-run the Station 10 live test through it
- **Done when:** a fresh session in any clone lists the parsimony MCP tools without setup · **Effort:** S
- **Suggested timing:** this week — one file, flips the darkest surface on

### 3. Guard the implemented a11y behaviors with tests
- **Station:** 3 + 5 · **Evidence:** [verified] tabs arrow-nav/roving tabindex and dialog Escape are implemented; zero keyboard assertions in any of the 19 test files
- **First move:** Add keyboard-interaction tests: tabs (ArrowLeft/Right/selection), dialog (Escape → rr-dialog-close), button (Enter/Space activation); add a `prefers-reduced-motion` guard to spinner/motion styles while in there
- **Done when:** a regression in arrow-nav or Escape fails CI · **Effort:** S–M · **Suggested timing:** this sprint

### 4. Add visual regression to the components themselves
- **Station:** 5 · **Evidence:** [verified] consumers have Playwright VR; parsimony's Storybook has no snapshot net — token changes are only caught downstream
- **First move:** Playwright screenshots against the static-built Storybook (already built in CI), baselines generated on the runner (house convention)
- **Done when:** a token change that shifts component rendering fails a parsimony PR, not a consumer's · **Effort:** M · **Suggested timing:** before the next token change

### 5. Unify the size vocabulary + title/heading
- **Station:** 4 · **Evidence:** [verified] `sm|md|lg` (avatar, spinner, Figma) vs `small|medium|large` (button) vs `compact|default|large|xl` (icon); `alert.title` vs `dialog.heading`
- **First move:** Standardize on `sm|md|lg` (matches Figma; icon's semantic scale may stay as a documented deviation); support old values as deprecated aliases for one minor version; align `title`→`heading` (or vice versa) in the same pass
- **Done when:** one documented size vocabulary, validator warns on deprecated values · **Effort:** M · **Suggested timing:** this quarter — breaking-adjacent, batch it with the #114 two-tier migration
- **Careful:** components are unpublished, so aliases are cheap NOW — do this before first publish and it's free

### 6. Publish the components package + catch up consumers
- **Station:** 1 + 6 · **Evidence:** [verified] zero consumers use any rr-* component (nothing to install); river-intro on 0.1.1, decisioning-table on 0.3.0, portfolio on 0.3.1
- **First move:** Publish `@riverromney/components` (or re-scope to `@digital2analogue2`); bump all three consumers to ^0.3.1 and re-run their sync-tokens
- **Done when:** all consumers on one version; at least one real `rr-*` usage in a consumer · **Effort:** M (publish S, adoption L) · **Suggested timing:** publish this quarter; adoption opportunistically
- **Note:** do item 5 first — publishing freezes the API vocabulary

### 7. Fold the generation-test gap list into the docs
- **Station:** 9 · **Evidence:** [verified] blind agent's five honest gaps: rr-select declarative-options pattern + upgrade ordering, form-assembly recipe (field gap / actions row), slotted card-heading typography, layout-width guidance, rr-button form participation
- **First move:** One docs pass answering all five (AUTHORED regions of the MDX + an AGENTS.md "assembly patterns" section)
- **Done when:** re-run of the generation test reports zero gaps · **Effort:** S · **Suggested timing:** this sprint — cheapest possible docs roadmap, pre-validated by a real agent

### 8. Refresh stale project memory (CLAUDE.md)
- **Station:** 6 · **Evidence:** [verified] CLAUDE.md says 3 components have meta.json (all 21 do) and describes a thinner CI than exists
- **First move:** Update the Components & Agent Tooling and ci.yml sections to current reality
- **Done when:** CLAUDE.md matches the repo · **Effort:** S · **Suggested timing:** with the next PR that touches either area

## 🔧 Access upgrades (sharper next inspection)

- **Schedule `drift_audit.py`** (Figma-variables-vs-tokens) as a weekly Action like drift-lint — design↔token drift currently depends on someone remembering to run it. The Figma MCP connection proven this session makes an agentic version viable too.
- **Connect a design-systems knowledge MCP** (e.g. Southleft's design-systems-mcp free endpoint) before the next Station 1 pass, turning the staples benchmark from agent recollection into citable lookups.
- **Register the parsimony MCP** (item 2) — also an access upgrade for the next inspection: stations 9–10 can then run through the front door.

## 🟢 Keeping the greens green

- **S2 Best practices:** the conventions are enforced by `scripts/rules.mjs` + validate — keep the "rules live in exactly one place" discipline; that's the whole moat.
- **S5 Testing & validation:** the four staleness gates are the crown jewel — never bypass with `--no-verify`; add new generated artifacts to the same gate pattern.
- **S9 Machine-readable:** re-run the blind generation test after any docs/metadata change (it's ~2 minutes of agent time); the gap list trend is the health metric.

## Cadence

- Re-inspect (deep, all stations incl. 7–8): 2026-10
- Everyday checks to wire into CI now: Code Connect↔type parity (item 1's "done when" check), keyboard tests (item 3), Storybook VR (item 4)
- Owner of this work order: River · Review: fold items into GitHub issues (the repo's single shared board) — each yellow above is one issue
