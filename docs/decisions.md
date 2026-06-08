# Decision Log

A running, append-only record of notable decisions for the Parsimony design
system. Newest first. The PRD (`docs/brand-design-system-prd.md`) describes the
intended shape of the system; this log captures *why* it took the turns it did,
including the ones that reversed an earlier PRD assumption.

Each entry: **what was decided**, **why**, **the alternative considered**, and a
**status**. Keep them short. Add an entry whenever a choice would be expensive to
reverse or would surprise someone reading the code later.

---

## 2026-06-05 — Self-healing drift detection runs in CI

**Decided:** A scheduled GitHub Action runs the shared drift scan against a
consumer repo and reflects the result as a single tracked issue — opened/updated
when drift is found, closed automatically when the consumer comes back clean —
rather than only on manual `workflow_dispatch`. The scanner gained `--ignore` and
`.driftignore` support so a consumer can exempt its own sanctioned token block
(e.g. an inlined primitive layer) and the scan reports real UI drift, not the
consumer's copy of the source of truth.

**Why:** The rules already exist in one place (`scripts/rules.mjs`) and the
manual `drift` command already works; making it run on a schedule and surface an
actionable, self-resolving issue closes the loop the architecture diagram
promises (consumers → drift scan → source) without waiting for a human to run it.

**Alternative considered:** Open a fix *PR* via a codemod that auto-rewrites
violations. Deferred — safely rewriting UI code is a much larger surface; an issue
is the honest artifact when there is no fix to commit.

**Status:** Workflow + scanner shipped on the feature branch. First real scan of
the portfolio caught genuine drift (primitive spacing refs, a deprecated token),
which is being fixed in the consumer. Auto-fix PR remains deferred.

## 2026-06-05 — No semantic font-family token yet; the JS bridge is the sanctioned adapter

**Decided:** Leave `lib/tokens.ts` in the portfolio (the `sans`/`serif`/`mono`
exports) as the single, documented place allowed to reference
`--primitive-font-family-*`, and exempt it in `.driftignore`. UI code imports the
bridge constant instead of inlining the primitive.

**Why:** The drift scan surfaced that there is no *semantic* family-only token —
this system bundles family into the `--font-*` shorthands, so code that needs only
the family (an inline `fontFamily`) has nowhere semantic to go. A single
controlled adapter is a legitimate pattern and avoids inventing a niche token
under time pressure.

**Alternative considered:** Add semantic `--font-family-{sans,serif,mono}` tokens
to brand-tokens. The "more correct" long-term fix, but it touches the published
token surface and the shorthand model; deferred, not rejected.

**Status:** Deferred. Bridge sanctioned now; revisit semantic family tokens if a
second consumer needs family-only access.

## 2026-06-05 — Lint and component rule messages are em-dash-free

**Decided:** Reworded the four shared `rules.mjs` messages and the no-hex rule in
`badge`/`button`/`input` `meta.json` to plain punctuation.

**Why:** These strings are rendered verbatim in the public case-study visuals;
keeping them em-dash-free keeps the visuals authentic *and* consistent with the
portfolio's voice, without faking tool output.

**Alternative considered:** Edit only the images. Rejected — that would make the
"verbatim tool output" claim false.

**Status:** Shipped. Tests assert rule `id`/`matches`, not message copy, so
behaviour is unchanged.

## 2026-06 — Distribution via public npm, not GitHub Packages

**Decided:** Ship the built brand CSS as `@digital2analogue2/tokens` on the
public npm registry.

**Why:** GitHub Packages requires authentication to install even public
packages, so every consumer and CI job would need a token just to download
tokens — the exact friction the package was meant to remove. Tokens are public
CSS anyway; there is nothing to gate.

**Alternative considered:** GitHub Packages (sits next to the repo). Rejected on
the auth-to-install friction and owner/scope coupling.

**Status:** Shipped (`0.1.0`). Reverses the PRD non-goal "no registry publishing
in v1."

## 2026-06 — The agent interface is MCP, not docs or a REST API

**Decided:** Expose the system to agents through an MCP server
(`list_components`, `get_component`, `check_usage`) reading a generated
`design-system.json`.

**Why:** Agents do not open a docs site, and a REST API needs a server, auth, and
the agent knowing it exists. MCP is the protocol the coding session already
speaks, so the same session can query the system with no setup.

**Alternative considered:** A DESIGN.md / docs page (original PRD position), or a
REST API. The docs-only approach was the explicit v1 plan; it was abandoned once
agents became the primary consumer.

**Status:** Shipped (MCP runs locally). Reverses the PRD non-goal "MCP is not
needed at this scale."

## 2026-06 — Components are framework-agnostic Web Components (Lit), not React

**Decided:** Build the `rr-*` components as Lit web components.

**Why:** One implementation works in React, plain HTML, and a Figma Code Connect
mapping, instead of maintaining the same button three times and keeping them in
sync.

**Alternative considered:** React components (smoother in the dominant framework).
Rejected. The real cost is sharper than "clunkier in React": it's *styling across
the Shadow DOM boundary* — the encapsulation bubble that protects a component's
internals also stops a consumer from reaching in with ordinary CSS to restyle
them. Token-based theming largely neutralizes this: CSS custom properties inherit
*through* the shadow boundary, so the components retheme by setting token values
(e.g. `--component-badge-*`, `--color-*`) without piercing encapsulation. The
harder cases (restyling internal *structure*) only arise for composite components,
which aren't built yet.

**Reference:** the five-strategy spectrum in "Web Component Style Flexibility"
(https://its-hcd.github.io/learn-webcomponent-style-flexibility/) — sealed
→ open: variables-only (Locked) → `::part()` → `exportparts` → `<slot>`/`::slotted()`
→ Light DOM. Our atomic components (badge, button, input) sit at the variable-themed
"Locked" end, which the page recommends for exactly that class of component.

**Watch:** progressive-enhancement web-component libraries (e.g. ElenaJS,
https://elenajs.com/) render HTML/CSS first and hydrate after, addressing Lit's
main weakness — client-only rendering (SSR gaps, layout shift, no-JS blankness).
The tradeoff cuts against us: PE leans light-DOM, which trades away the Shadow DOM
encapsulation our token theming relies on. Not a switch to make now; the thing to
evaluate if a consumer ever needs the components to render before JS.

**Status:** Shipped (18 components). Reverses the PRD non-goal "no component
library yet."

## 2026-06 — Tokens and components version together in one repo

**Decided:** Keep tokens and components in a single repo that versions as a unit;
a token rename is a breaking change to every component that uses it, enforced by
the build's token-reference resolution.

**Why:** Avoids version skew between separately published token and component
packages. With one source, a rename that wasn't propagated fails the build, not
production.

**Alternative considered:** Separate, independently versioned packages. Rejected
for the skew-chasing cost at this scale.

**Status:** Shipped. Enforced by `scripts/validate.mjs`.

## 2026-06 — One shared rule module behind every checker

**Decided:** The lint rules live once in `scripts/rules.mjs`; the build gate
(`validate`), the MCP `check_usage`, and the consumer `drift-lint` all import it.

**Why:** Earlier each checker re-implemented the same regexes by hand and they had
drifted apart. One module means the answer an agent gets from `check_usage` is
the one the build will later enforce.

**Alternative considered:** Per-checker rule copies (the prior state). Rejected as
the source of the drift it was meant to catch.

**Status:** Shipped. Delivers the PRD's P1-2 (CSS linter / audit rule).
