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
consumer repo and surfaces violations as an actionable report (a PR/issue),
rather than only on manual `workflow_dispatch`.

**Why:** The rules already exist in one place (`scripts/rules.mjs`) and the
manual `drift` command already works; making it run on a schedule closes the
loop the architecture diagram promises (consumers → drift scan → source) without
waiting for a human to remember to run it.

**Alternative considered:** Full auto-*fix* (a codemod that rewrites violations
and opens a fix PR). Deferred — auto-rewriting UI code safely is a much larger
surface; detection + report is the honest, useful first step.

**Status:** In progress.

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
Rejected; the accepted cost is that web components are slightly clunkier *inside*
React.

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
