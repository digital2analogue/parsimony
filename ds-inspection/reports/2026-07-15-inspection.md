# Multi-Point Inspection Report — Parsimony

_Inspected: 2026-07-15 · Technician: Claude Code (claude-fable-5) · Previous inspection: first inspection_
_Vehicle profile: `ds-inspection/GARAGE.md` (checked in 2026-07-15)_

## The short version

Parsimony is in genuinely good shape for a one-month-old solo system held to team standards: the token pipeline, CI contract gates, and machine-readable layer are better than most funded team systems, and a blind agent given only the system's own docs produced clean, on-system UI on the first try. The most load-bearing problem is **connection, not construction**: the Figma button and the coded button have drifted (design ships `ghost`, code ships `danger` — Code Connect happily emits a variant that doesn't exist), the MCP server isn't registered in any toolchain so agents never actually reach it, and consumers run three different package versions. The single most important thing to do next: fix the button variant drift end-to-end (it's the early smoke of the exact failure mode the system was built to prevent) and register the MCP so the access surface stops being dark.

**Overall: 58/80** — a conversation starter, not a grade. No reds; schedule the yellows, re-run on a cadence.
Score is /80: stations 7 (Governance) and 8 (Feedback & adoption) were skipped at the owner's request — not for lack of evidence access.

## Inspection sheet

|  # | Station                         | Quality      | Light |      Score |
|---:|:--------------------------------|:-------------|:-----:|-----------:|
|  1 | Coverage & gaps                 | Complete     |  🟡   |       7/10 |
|  2 | Best practices                  | Sound        |  🟢   |       8/10 |
|  3 | Accessibility                   | Sound        |  🟡   |       7/10 |
|  4 | Shared language                 | Sound        |  🟡   |       7/10 |
|  5 | Testing & validation            | Sound        |  🟢   |       8/10 |
|  6 | Orchestration                   | Synchronized |  🟡   |       6/10 |
|  7 | Governance & version control    | Extensible   | skip  |     skipped |
|  8 | Feedback & adoption             | Extensible   | skip  |     skipped |
|  9 | Machine-readable docs & context | AI-Ready     |  🟢   |       9/10 |
| 10 | Agent access                    | AI-Ready     |  🟡   |       6/10 |
|    | **Overall**                     |              |       |  **58/80** |

**Lights:** 🟢 3 green · 🟡 5 yellow · 🔴 0 red · 2 skipped (owner request)

**Key:** 🔴 Red (0–3) — broken or missing; the light is ON · 🟡 Yellow (4–7) — drift or gaps; schedule a fix · 🟢 Green (8–10) — healthy, no action needed

## Evidence basis

- Access used this pass: **live everywhere** — full repo read; live Figma MCP reads of the actual "Brand-Tokens-Design-System" library (Icon and Button component sets); blind agent generation test executed; consumer repos read directly.
- Findings tagged `[verified]`: 31 · `[reported]`: 0
- Scoring frame: solo maintainer, deliberately held to small-team professional standards (owner's request).

## Station records

### Station 1 — Coverage & gaps: YELLOW (7/10)
- Inventory: 18 component sets mapped in design · 19 components in code · 21/21 documented (full census, not a sample)
- Evidence level: live (repo + Figma), all findings verified
- Findings:
  - [verified] Code leg is fully, evenly built: every component ships src + stories + tests + meta.json + generated MDX docs (21 files in `docs/components/`); tokens complete across 8 categories with a tiered structure (primitive → semantic → component, two-tier migration planned in #114).
  - [verified] Design leg is slightly thinner: `rr-tag` has no `*.figma.ts` mapping (18 of 19); the Figma Button set carries no `danger` variant, no loading/active/focus-visible states (27 variants = 3 variants × 3 sizes × default/hover/disabled only).
  - [verified] Distribution gap: only the tokens package is published (`@digital2analogue2/parsimony@0.3.1`); `@riverromney/components` and the MCP are unpublished, and **zero consumer repos use any `rr-*` component** — decisioning-table hand-rolled its own atoms/molecules (documented known state, but it means the component leg has no consumers yet).
  - [verified] Staples missing vs. the industry core: tooltip, table, menu/dropdown-action, popover, accordion, pagination, breadcrumb, toast (alert covers banners only). Benchmarked from agent knowledge, no design-systems knowledge MCP connected.
  - [verified] The blind generation test independently hit a gap: it wanted a quiet/tertiary button and found only primary/secondary/danger.
- Not inspected: dot-art/dot-blog consumer sites (not in session).
- Deviations noted: components-unpublished is documented in CLAUDE.md as "not published yet" — treated as a known gap, not a surprise.
- First move: publish the components package (or fold it under the `@digital2analogue2` scope) so the component leg can have consumers at all; then let decisioning-table's hand-rolled set drive the staples backlog (it is a ready-made "most requested" list).

### Station 2 — Best practices: GREEN (8/10)
- Sampled: button, dialog, select, input read end-to-end; card, tabs partially; Figma Button + Icon sets inspected live; 2 generated MDX docs pages
- Evidence level: live, all verified
- Findings:
  - [verified] Code craft is consistently high: native elements inside shadow roots (`<button>`, `<dialog>` + `showModal()`, `<select>`), `formAssociated` + ElementInternals, `delegatesFocus`, CSS parts exposed, every color/spacing/font/motion value a token reference. Prop descriptions single-sourced from JSDoc → CEM (a build failure if missing — format best-practice enforced by tooling).
  - [verified] Figma craft: real component sets with structured variant properties (`Variant=`, `Size=`, `State=`), no `Frame 22`-style naming in inspected sets.
  - [verified] Minor: no CSS logical properties (`padding-inline` etc.) — RTL would break; acceptable for a personal-site system, noted not penalized. Spinner border width `2px` literal (border widths aren't tokenized — scale gap, trivial).
  - [verified] House conventions are written down and machine-enforced (`ai/rules.md` → `scripts/rules.mjs` → validate/drift/MCP) — the Station 2 end-state most teams never reach.
- Not inspected: remaining 15 component sources in depth (spot-swept only); Figma file page organization (pages list returned only a Cover page — component sets were reached by node id).
- First move: none required; consider logical properties if any consumer ever needs RTL.

### Station 3 — Accessibility: YELLOW (7/10)
- Sampled: button, dialog, select, tabs (code); base-theme contrast table; CI + test wiring
- Evidence level: live, all verified
- Findings:
  - [verified] Fundamentals are sound in every sampled component: semantic native elements; dialog uses native focus trap + Escape; select wraps a real `<select>` with `aria-required/invalid/errormessage/describedby` and `role="alert"` errors; tabs implement the full WAI pattern (role=tablist/tab, `aria-selected`, roving tabindex, ArrowLeft/Right).
  - [verified] Automated checks run on every change: vitest-axe assertions per component/variant in CI, plus Storybook addon-a11y locally. Contrast is validated **at the token level** (`check_contrast`, `validate_brand`, documented ratios in ai/DESIGN.md, SC 1.4.11 border-legibility work landed #28).
  - [verified] Verification gaps: **zero keyboard-interaction test assertions** across all 19 test files (the arrow-key/Escape behavior is implemented but nothing would catch a regression); no `prefers-reduced-motion` handling anywhere (spinner/motion tokens animate unconditionally); no screen-reader test plan.
  - [verified] Known documented deferrals: axe can't catch SC 1.4.11 (decision 2026-06-22); accent-family pairings out of `validate_brand` v1 scope.
- Deviations noted: the two deferrals above are documented decisions, recorded not penalized.
- First move: add keyboard-interaction tests for tabs (arrows), dialog (Escape), button (Enter/Space) — the behaviors exist, they're just unguarded.

### Station 4 — Shared language: YELLOW (7/10)
- Swept: all 19 component prop APIs; token naming across 4 tiers; design↔code trace for Button and Icon
- Evidence level: live, all verified
- Findings:
  - [verified] Token naming is one coherent role-based scheme (`color.background.action`, not `blue-500`), documented in ai/DESIGN.md, and **drift is caught at PR time** by validate/drift-lint sharing one rules source — the guardrail most systems lack.
  - [verified] Form-control APIs are impressively uniform: `label/helperText/errorText/required/disabled/name/value` identical across input, select, textarea, radio-group; `checked/value/name` identical across checkbox, radio, toggle.
  - [verified] Three size vocabularies coexist: `sm|md|lg[|xl]` (avatar, spinner), `small|medium|large` (button), `compact|default|large|xl` (icon — arguably semantic, defensible). Figma uses `sm|md|lg` while code button uses `small|medium|large` (Code Connect translates, but the vocabularies diverge).
  - [verified] Same concept, two names: `rr-alert` calls its heading `title`, `rr-dialog` calls it `heading`.
- First move: pick one size vocabulary (recommend `sm|md|lg` — matches Figma) and alias-deprecate the others; align `title`/`heading` in the same pass. Version it — these are breaking renames.

### Station 5 — Testing & validation: GREEN (8/10)
- Inspected: ci.yml end-to-end; button test suite read in full; test census across 19 files; lint/eval tooling
- Evidence level: live, all verified
- Findings:
  - [verified] CI is a real contract gate: schema validation, token-reference resolution, lint rules, story linting, brand build, **four staleness gates** (CEM, design-system.json, component MDX, token docs), workspace + root tests, Storybook build. A malformed meta.json or stale artifact cannot land.
  - [verified] Tests assert behavior, not just rendering: click suppression when disabled/loading, aria states, ElementInternals, per-variant axe runs (18 assertions on button alone).
  - [verified] The system already has deterministic evals for AI output — `check_usage`/`lint_consumer` run the same rules agents are told to follow, and the blind generation agent used `npm run drift` to self-check unprompted. Ahead of the curve.
  - [verified] Gaps: no keyboard-interaction assertions (shared with Station 3); **no visual regression on the components themselves** (consumers have Playwright VR; parsimony's own Storybook has no snapshot net — a token change altering component rendering is only caught downstream).
- First move: add visual regression on Storybook (even Playwright against static-built stories) before the next token change, not after.

### Station 6 — Orchestration: YELLOW (6/10)
- Diffed: Button + Icon design↔code; token pipeline traced source→npm→3 consumers; docs pipeline; CLAUDE.md vs reality
- Evidence level: live, all verified
- Findings:
  - [verified] **The button has drifted design↔code**: Figma ships `Variant=ghost`, code ships `danger`; `button.figma.ts` maps `ghost → 'ghost'`, so Code Connect emits `<rr-button variant="ghost">` — **a variant that does not exist in button.ts** (renders unstyled primary). Design also lacks the loading/active/focus states code has. This is exactly the early smoke this station exists to catch.
  - [verified] Icon traces cleanly: Figma `Size=compact/default/large/xl` ↔ code `IconSize` ↔ `--icon-size-*` tokens, 1:1.
  - [verified] Token pipeline is exemplary: one source → Style Dictionary → brand CSS → versioned npm package, with sync-tokens in consumers, weekly drift-lint, weekly publish-freshness. Docs are generated with CI staleness gates, so docs↔reality drift is structurally impossible for the generated regions.
  - [verified] Consumer version skew: portfolio-vercel `^0.3.1` · decisioning-table pinned `0.3.0` · river-intro `^0.1.1` (two minors behind). All still functional, but three consumers on three versions is drift accumulating.
  - [verified] CLAUDE.md understates reality (says 3 components productionized with meta.json — all 21 are; ci.yml description omits the docs gates): stale project memory misleads every future session.
  - [verified] `drift_audit.py` (Figma-variables-vs-tokens auditor) exists but runs on no schedule — design↔token drift is only caught when someone remembers.
- First move: fix the button — add `ghost` to code (the generation test wanted it anyway) and `danger` + missing states to Figma, correct `button.figma.ts`, and add a CI check that every Code Connect enum value exists in the component's type union.

### Station 9 — Machine-readable docs & context: GREEN (9/10)
- Inventoried: meta.json ×21 (schema-validated), design-system.json (deterministic CEM merge), tokens as JSON + CSS vars, typed APIs, MDX docs with GEN/AUTHORED regions, AGENTS.md, ai/ rules, rules-as-code · Generation test: **run — passed**
- Evidence level: live; generation test executed blind (agent restricted to the system's own context surfaces)
- Findings:
  - [verified] The generation test passed with minor stumbles: given only AGENTS.md, design-system.json, and ai/, a blind agent produced a correct Account Settings panel — right components, valid props (including `rr-card padding="lg"`, verified real), semantic spacing tokens, zero rule violations — and self-verified with the system's own drift gate.
  - [verified] The machine-readable layer is generated from source with CI staleness gates — it cannot silently rot (the Station 9 failure mode is structurally prevented).
  - [verified] The agent's honest gap list = the docs backlog: `rr-select` options are JS-property-only (no declarative pattern documented, upgrade-ordering undocumented); no form-assembly recipe (field-stack/actions-row gaps); slotted card-heading typography ambiguous; no layout-width guidance; button form-participation undocumented.
  - [verified] No llms.txt (minor — AGENTS.md + CLAUDE.md serve the role for repo-resident agents; llms.txt matters when docs go web-hosted).
- First move: fold the generation-test gap list into the docs — the failure log is the roadmap, and this one is only five items.

### Station 10 — Agent access: YELLOW (6/10)
- Surfaces mapped: MCP server (20+ tools), Code Connect (18 components), AGENTS.md/CLAUDE.md context files · Live test: run via file surface — on-system output
- Evidence level: live, all verified
- Findings:
  - [verified] The capability exists and is well-designed: MCP tools for components, tokens, rules, decisions, brands, contrast, assembly, and consumer linting — thin wrapper over the same single-source scripts the CI gates use.
  - [verified] **Nobody can reach it**: no `.mcp.json` in parsimony or any consumer repo, no registration in the agent config. This inspection session — a real multi-repo product session with six MCP servers connected — did not have the parsimony MCP. The generation agent noted the MCP was "the prescribed path" and unreachable, and fell back to reading design-system.json. "We have an MCP nobody's connected" scores like no MCP.
  - [verified] The file-based fallback works well (the generation test passed through it), which is why this is a 6 and not a 3 — repo-resident agents get CLAUDE.md/AGENTS.md automatically.
  - [verified] Components unpublished → an agent in a consumer repo cannot `npm install` them; Code Connect exists but with the ghost-variant defect (Station 6) it can emit invalid code.
- First move: commit a `.mcp.json` registering the parsimony MCP (repo-level, so every session in every clone gets it), then re-run this station's live test through the MCP.

## What changed since last inspection

First inspection — no delta.

## Next service

- Work order: `ds-inspection/work-orders/2026-07-15-work-order.md`
- Recommended cadence: deep inspection quarterly (next: 2026-10, include stations 7–8); everyday checks to wire into CI now: Code Connect↔type-union parity (S6), keyboard-interaction tests (S3/S5), Storybook visual regression (S5)
- Re-inspect stations 9–10 after the MCP is registered — cheap, and it should flip S10 green
