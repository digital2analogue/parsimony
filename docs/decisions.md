# Decision Log

A running, append-only record of notable decisions for the Parsimony design
system. Newest first. The PRD (`docs/brand-design-system-prd.md`) describes the
intended shape of the system; this log captures *why* it took the turns it did,
including the ones that reversed an earlier PRD assumption.

Each entry: **what was decided**, **why**, **the alternative considered**, and a
**status**. Keep them short. Add an entry whenever a choice would be expensive to
reverse or would surprise someone reading the code later.

---

## 2026-06-25 — Consumer drift scan extracted to a shared module; exposed via MCP lint_consumer

**Decided:** Extract the consumer-repo scan from `scripts/drift-lint.mjs` into a
new pure module `scripts/drift-scan.mjs` (`scanConsumer(target, { ignore })` — walk
+ `.driftignore`/ignore handling + shared `lintLines`, returning structured
`{ scanned, clean, violations, groups }`). `drift-lint.mjs` becomes a thin CLI over
it (identical output + exit codes — the weekly `drift-lint.yml` Action depends on
them), and the MCP gains `lint_consumer({ path, ignore? })`. MCP server 0.7.0 →
0.8.0 (#61, fourth and last of the build-and-verify capabilities).

**Why:** `drift-lint.mjs` already scanned consumer repos with the shared rules, but
only as a CLI/Action and it executed on import (argv + `process.exit`), so it
couldn't be reused. An agent working *inside* a consumer repo can now check
file/repo-level compliance through the MCP instead of shelling out — the cross-repo
workflow the system exists for. Extracting the scan matches the repo pattern
(logic in `scripts/*.mjs`; CLI/MCP are thin wrappers) and keeps the consumer scan
single-sourced the way `rules.mjs` single-sources the rules.

**Alternative considered:** Add a main-guard to `drift-lint.mjs` and import its
internals directly. Rejected — a dedicated pure module is cleaner, testable in
isolation, and consistent with `tokens.mjs`/`rules.mjs`/`reasoning.mjs`. CLI parity
verified against both consumer repos (portfolio clean; decisioning-table the same
pre-existing hex/font-size/deprecated fails, no new ones).

---

## 2026-06-25 — MCP contrast tooling: check_contrast + validate_brand (intended-pairs v1)

**Decided:** Add two MCP tools (`scripts/contrast.mjs`, reusing the WCAG
`contrastRatio` already in `assembly.mjs`): `check_contrast` (ratio + AA/AAA for a
fg/bg pair — tokens or hex, brand-aware, large-text threshold via `fontSize`/`bold`)
and `validate_brand` (every *intended* fg/bg pairing still meets AA once a brand's
overrides apply). MCP server 0.6.0 → 0.7.0 (#59, second of the four build-and-verify
capabilities). `validate_brand`'s intended-pairs set is **derived by naming
convention** and scoped to the pairings where a failure is unambiguously a bug:
`foreground.on-<role>` ↔ `background.<role>`, and base text (default/alt/muted/action)
↔ base surfaces (default/alt). `disabled` is exempt.

**Why:** The system is WCAG-AA-first and the consumer repos run their own contrast
gates, but the MCP could only compute contrast as a side effect of `check_assembly`.
A first-class tool lets an agent verify a pairing (or a whole brand) directly.
Reusing the one luminance implementation keeps the math single-sourced.

**Alternative considered:** Derive *all* fg/bg pairings, including the accent family
(`accent-*` / `accent-on-*` over `accent-*` / `accent-*-bold`). Rejected for v1 — the
accent taxonomy has both subtle and bold fills and its fg/bg names aren't cleanly
parallel, so convention-derived pairing mis-matches and reports impossible <2:1
"failures" (e.g. `accent-on-green` paired with the wrong `accent-green`). Same "no
opinion outside the known rules" stance as `check_assembly`; a proper accent audit
needs an explicit pairing map (follow-up).

**Real findings surfaced (worth their own fix, tracked separately):** with the
trustworthy pairings only, `validate_brand` flags genuine sub-AA pairs — `foreground.
on-danger` (#FFFFFF) on `background.danger` (#D03027) is **4.33:1** in the *base*
theme (inherited by dot-art/dot-blog; DESIGN.md never computed it), and decision-
engine's `on-warning` (white) on `background.warning` (amber) is **3.19:1** (already
worked around locally in decisioning-table). The tooling did its job on first run.

---

## 2026-06-25 — check_usage enforces the statically-detectable hard rules (font-weight + font-family added)

**Decided:** Expand the shared lint rule set (`scripts/rules.mjs`) so the MCP
`check_usage` snippet linter — and, by the same `RULES` array, `validate` and
`drift-lint` — enforces two more hard rules: **hard-2** (no hardcoded
`font-weight`) and **hard-3** (no unapproved `font-family`). It previously caught
only 4 of 9 hard rules (hex, primitive ref, font-size, deprecated). MCP server
bumped 0.5.0 → 0.6.0 (#58, first of four MCP "build-and-verify" capabilities;
siblings: #59 contrast, #60 scale accessors, #61 drift-lint-via-MCP).

**Why:** `check_usage` is the cheapest, earliest compliance guard an agent hits;
every rule it can't see only fails later in CI, or never. Both new detectors are
statically decidable from a snippet and audited clean against current component
source (the one hit, `textarea.ts` `font-family: inherit`, is correctly
allowlisted). Adding them to the single `RULES` source propagates to all three
checkers for free — the design's whole point.

**Alternative considered:** Also add **hard-7** (off-scale spacing). Rejected for
this PR and split to its own issue — an audit found 20+ legitimate sub-scale
optical nudges in component source (`margin-top: 2px` for cap-height alignment,
`margin: -1px`, negative icon margins) that the 4px-floor spacing scale doesn't
cover, so a naive rule is a false-positive minefield and first needs a design
call on a 1–2px exemption/primitive. **hard-4** (display/title weight 300) and
**hard-5** (accent-green never resting text) are deliberately out of scope: both
need a selector's semantic role/interactivity, which a raw snippet lacks — they
belong to `check_assembly` / a future semantic checker, not a regex.

---

## 2026-06-25 — Prop descriptions: JSDoc is the single source (meta.json copy eliminated)

**Decided:** Resolve the open thread from the Storybook-autodocs entry below.
Prop descriptions are now authored in exactly **one** place — the per-property
JSDoc (`/** … */`) above each `@property`. `*.meta.json` no longer carries a
`description` on its props; `scripts/build-design-system-json.mjs` injects each
prop's description from the CEM at merge time (logic in the shared
`scripts/cem-descriptions.mjs`). A prop with no per-property JSDoc is a **hard
build error**, so a new prop can't ship an empty description (#45).

**Why:** The two copies — `meta.json` (→ `design-system.json` → MCP) and JSDoc
(→ CEM → autodocs + IDE hovers) — could silently drift, and already had: of 89
props, 25 diverged. The CEM is a strict projection of the JSDoc, so making JSDoc
authoritative and deriving the artifact removes the second copy entirely rather
than keeping a mirror in lockstep. The `git diff --exit-code` artifact-staleness
gate now doubles as a freshness check: edit a JSDoc without rebuilding and CI
fails. Net effect on `design-system.json`: 22 of the 25 were reconciled into the
JSDoc verbatim (zero change to MCP output); 3 (`rr-badge.variant`,
`rr-card.padding`, `rr-tag.variant`) adopt the richer/better-formatted CEM
wording.

**Alternative considered:** Keep `meta.json` self-contained but auto-generate
its `description` values from the CEM (a maintained mirror). Rejected — a mirror
is still two copies that can be hand-edited out of sync and complicates the
compact meta formatting; eliminating the field is the true single source. The
class-level `@attr` JSDoc block stays as a human file header (a low-risk in-file
third copy); trimming it is a possible follow-up, not part of #45.

**Status:** Done. `meta.json` props are now `{ name, type, default }`; the schema
already made `description` optional, so no schema change was needed.

---

## 2026-06-25 — Storybook autodocs from the CEM; two prop-doc sources reconciled

**Decided:** Wire the generated Custom Elements Manifest into Storybook
(`setCustomElementsManifest` + `tags: ['autodocs']`, with `@storybook/addon-docs`) so
component descriptions and prop tables come from the single source rather than
hand-maintained `argTypes` (#39 step 1, PR #40). Then port the per-prop description copy
from each `*.meta.json` into `@property` JSDoc so the CEM carries it and the autodocs
tables actually populate (#39 step 2, batched).

**Why:** This surfaced a real gap — **two prop-doc sources that weren't unified**: the
hand-authored `*.meta.json` (consumed by the MCP / `design-system.json`) and source
`@property` JSDoc (what `cem analyze` reads for the CEM/autodocs). Storybook reads only the
CEM, so before this the autodocs pages had the component description (from the class JSDoc)
but **empty per-prop columns**. Putting the prose in JSDoc is the one spot that feeds both
the CEM *and* IDE hovers. Gotcha worth recording: `@storybook/addon-docs` must be added
explicitly in Storybook 10 — it's no longer bundled via essentials, and the original POC
ran `addons: []`, so autodocs emitted the `autodocs` tag but generated zero docs pages
until the addon was installed.

**Alternative considered:** (a) Teach Storybook/the CEM to read `meta.json`, or
hand-maintain `argTypes` descriptions per story — both rejected as duplicating the source
of truth; one JSDoc description the CEM already knows how to carry is the parsimonious fix.
(b) Port JSDoc to all ~19 components at once — deferred: only the 4 with stories
(badge/button/input/tag) have visible autodocs pages today, so the rest land with their
stories (#38). **Open thread:** whether `meta.json` should be *generated from* the JSDoc
rather than maintained in parallel — the cleaner long-term de-duplication.

**Status:** Pipeline shipped in PR #40. JSDoc port batch 1 (badge/button/input/tag) in the
accompanying PR; remaining ~15 follow with #38. `build-storybook` generates the autodocs
pages; `lint:stories` + `validate` green.

---

## 2026-06-25 — MCP Phase 2 reasoning tools split into `find_*` + `get_*`

**Decided:** Ship the Phase 2 design-reasoning layer (#25) as **four** tools, not the
two the issue title named: `find_rule(topic)` / `find_decision(topic)` return a ranked
array (wrapped `{ matches, total }`), and `get_rule(id)` / `get_decision(id)` return one
record. Parsing lives in a new shared `scripts/reasoning.mjs` (pure `parseRules` /
`parseDecisions` over `ai/rules.md` and `docs/decisions.md`, plus `load`/`find`/`get`),
imported by the server and the tests — same single-source shape as `rules.mjs` and
`tokens.mjs`. Server bumped to v0.3.0. A rule's `rationale` is the clause after the first
" — " in the rule text (null when there is none); the decision parser normalizes both
the dated-entry labels (`**Decided:**` / `**Alternative considered:**`) and the archived
ADR labels (`**Decision:**` / `**Rejected:**`) onto one `{ decision, why, rejected,
status }` shape.

**Why:** A topic query legitimately matches several rules/decisions, so collapsing to one
object hides relevant hits and forces a re-query. The prevailing MCP convention is
shape-follows-verb — `get_*` = exact-key lookup → one object, `find_*`/`search_*` = query
→ ranked array — and this repo's own Phase 1 already follows it (`get_token` vs
`find_token`). DesignerPunk's Civitas layer (the prior art the expansion PRD cites) ships
the identical split (`get_section` vs `find_docs`). Keeping `get_rule`/`get_decision` as
the exact-id form honors #25's names *and* the convention, rather than overloading a
`get_*` name with array semantics. Array results are wrapped in an object because some MCP
clients choke on a bare top-level array.

**Alternative considered:** (a) Two tools named exactly `get_rule`/`get_decision`
returning a wrapped array — rejected: bends the get_*=single convention the repo already
set. (b) Two tools returning a single best-match object per the PRD's sketch — rejected as
lossy for topic queries. (c) Cross-linking each rule to its rationale decision — deferred;
`rationale` (inline clause) + a separate `find_decision` keeps the parse low-risk and the
two corpora independent, which is what the issue asked for.

**Status:** Shipped (server v0.3.0; `scripts/reasoning.mjs` + 5 new MCP-server tests, all
green; `npm run validate` passes). Closes #25. `check_assembly` and the Phase 3
brand-aware tools (`get_brand`, `compare_brands`) remain on the roadmap.

---

## 2026-06-23 — New `rr-tag` component (outlined uppercase tag/chip)

**Decided:** Add `rr-tag` as its own component — the deliberate inverse of
`rr-badge`. Badge = filled pill for status; tag = square-cornered (`radius.sm`),
transparent fill, bordered, UPPERCASE + `letter-spacing-all-caps`, for
skills/categories/metadata. Two variants: `default` (text `foreground.alt`,
border `foreground.muted`) and `subtle` (text `foreground.muted`, border
`border.elevated`). Sized to `font.label-small` (12px). Motivated by the bespoke
`.tag`/`.tag--skill` CSS on riverromney.design/about, which had no DS equivalent.

**Why:** A new component, not a badge variant — the shape, fill model
(transparent vs filled), and casing differ fundamentally; folding it into badge
would muddy both. `default` is the *visible* treatment so a bare `<rr-tag>` reads
correctly standalone — the first cut pointed its border at `border.default`
(#1E241E), which equals `background.alt` and is invisible on the canvas (the same
SC 1.4.11 trap as the secondary-button finding below). Sized to `label-small`
(12px) for parity with badge — both are compact chips — rather than the
portfolio's 14px; 12px stays WCAG AA (WCAG has no minimum font size, the text
pairings pass ≥4.5:1, and the tokens are rem so they resize).

**Alternative considered:** (a) Add tag as a `rr-badge` variant — rejected
(different shape/fill/case). (b) Keep 14px to match the portfolio exactly —
rejected for badge-scale consistency. (c) Make `default` the quiet treatment with
a `strong` opt-in — rejected: the bare element should look right with no variant.

**Status:** Shipped in PR #31. Figma Code Connect deferred (no Tag node in the
Figma library yet — tracked as a GitHub issue). Storybook also gained brand-font
loading in `preview-head.html` (the token CSS sets `font-family: 'Space Grotesk'`
with no fallback and Storybook never loaded the font files).

---

## 2026-06-23 — `danger` variant: borderless, consistent with sibling status variants

**Decided:** Point the `danger` border at `background.danger-alt` (its own fill)
in both `badge` and `alert`, so every status variant is a uniform borderless tint.

**Why:** `danger` was the lone outlier — its border pointed at `foreground.danger`
(red) while success/warning/info match their fill and read borderless. The red
outline made danger visually inconsistent with its siblings; error state is
already conveyed by the red text on the danger-alt tint. Also corrected stale
token comments in both files: danger foreground said `#E73027` / `4.51:1`
(pre-2026-06-09 palette); `foreground.danger` is now `red.400` `#F87171`
(`6.62:1` AA on the danger-alt fill). The `{token}` reference always resolved
correctly — only the human-readable comment was stale.

**Alternative considered:** Keep danger's red border for extra error emphasis —
rejected for consistency; the tint + red text already signal the state.

**Status:** Shipped in PR #32. (No visible change for `rr-alert` yet — it has no
Storybook story; tokens are now consistent for when it gets one or is consumed.)

---

## 2026-06-23 — Work tracking moved to GitHub Issues (workflow improvement)

**Decided:** GitHub issues are the single board for roadmap / next / in-flight
work. `gh issue list` is how any session orients; `--label roadmap` filters the
plan. Decisions stay in this log (*why*); git/PRs stay as *what shipped*; issues
own *what's next*. The local agent memory is demoted to a per-machine cache.

**Why:** A process-optimization pass found three pains with one root cause —
actionable "what's next" had no single, cloud-visible home: (1) roadmap was
scattered across two PRDs + follow-up prose inside decision entries; (2) the
richest current-state summary lived in local agent memory that **can't travel to
cloud sessions** — the most-informed artifact was the least portable; (3)
follow-ups recorded as prose got buried (the SC 1.4.11 audit nearly was). The
"team" is autonomous sessions (local + cloud + spawned chips) that each boot
blind, so a shared, queryable board matters more than for a human team.

**Alternative considered:** A pinned "Current State / Next" section atop this log
(no new file, travels to cloud) — rejected as the weaker fix: hand-maintained
prose that drifts and still buries items. A standalone `ROADMAP.md`/`STATUS.md`
was rejected outright — the maintainer is doc-averse and it'd be a fourth drifting
surface. Issues win because they're **not a doc**, are cloud-native (`gh` works
everywhere), are a real task tracker (no burial), and reuse a pattern the repo
already runs (drift-lint / publish-freshness auto-open issues).

**Status:** Done. Seeded #25–#30 from the live follow-ups (MCP Phase 2/3, the two
SC 1.4.11 a11y items, the DESIGN.md token-sync). One-line pointer added to
CLAUDE.md so every session boots oriented. **Zero new docs added** — the
constraint that shaped the whole solution.

**Impact / case-study note (workflow win):** Cut new-session orientation from
"read-absent-local-memory → human pastes a pointer → scan three drifting surfaces"
to a single `gh issue list`. Fixed a real cross-environment handoff failure
(local memory invisible to cloud) using infrastructure already present, adding no
maintenance surface. Sequence worth retelling: the gap was found by *trying to
hand off* (wrap-up revealed memory doesn't travel), and the fix fell out of the
doc-averse constraint rather than fighting it — the constraint pointed at the
better answer (issues, not a doc).

---

## 2026-06-22 — Secondary button → green ghost; first SC 1.4.11 (non-text contrast) finding

**Decided:** Make the secondary button a green *ghost* button — transparent fill,
accent-green label (`color.foreground.action`), accent-green outline (new
`color.border.action` = `green.accent`). It pairs as outlined-secondary against
the filled-green primary. `color.border.default` is left neutral and unchanged.

**Why:** Reviewing Storybook, the secondary button's outline was illegible. It
resolved to `color.border.default` (#1E241E) on the canvas (#0A0D0A) = **1.23:1**,
failing **WCAG SC 1.4.11 Non-text Contrast (3:1)** — and since the button's fill
matched the canvas, that near-invisible border was its *only* boundary. This
exposed a systemic gap: the design system's "WCAG AA" claim had only ever covered
**text** contrast (SC 1.4.3); **non-text/UI-component contrast (1.4.11) was never
checked**, and axe doesn't reliably catch it. The green ghost treatment fixes the
control at 11.13:1 (canvas) / 9.02:1 (on a card), and accent-green is rule-5
compliant here because the control is interactive.

**Alternative considered:** (a) Bump `color.border.default` itself to a legible
~3:1 — rejected: it's the passive edge for cards/inputs/dividers, the green ramp
has no tasteful ~3:1 step, and making it green would break hard rule #5 (accent =
interactivity only, never resting decoration). (b) Reuse `border.hover` for the
secondary border — rejected: collapses the hover distinction. The ghost button
sidesteps `border.default` entirely.

**Status:** Shipped (secondary button + `color.border.action`, documented in
ai/DESIGN.md). **Known follow-up:** inputs and cards still use
`color.border.default` at 1.23:1 — a real 1.4.11 miss on input outlines
specifically. And a full 1.4.11 audit of the remaining outlined controls
(checkbox/radio/toggle edges) is still owed; the system's contrast verification
needs to cover non-text contrast, not just text.

---

## 2026-06-22 — Brand-scoped deprecation unnecessary; deprecation made replacement-aware instead

**Decided:** Do NOT add brand-scoped deprecation to `scripts/rules.mjs` (the PRD's
proposed PR-B). Instead: enrich `DEPRECATED_TOKENS` from `string[]` to
`[{ token, replacement }]` (replacements grounded in `ai/DECISION-ENGINE.md`),
export a `DEPRECATED` map, and make `get_token` answer "removed — use X" for dead
names. Also fixed the dead-token drift the investigation exposed.

**Why:** The PRD assumed a contradiction — `get_token` calling a token live while
`check_usage` calls it deprecated (`--color-state-hover` was the example). Checked
against the actual token JSON: all deprecated tokens are fully removed from every
layer. `get_token` is JSON-backed, so it can only return tokens that exist — it
cannot disagree with `check_usage`. No contradiction, so no brand-scoping needed.
The PRD's premise came from stale DESIGN.md, which still documented removed tokens.

**Alternative considered:** Implement the brand-scoped `{ token, scope }` refactor
as written. Rejected — it solves a problem that doesn't exist and adds complexity
to the shared rule module for no correctness gain.

**Status:** Shipped (PR-B). Dead-token drift fixed in the same change:
`dialog.meta.json` (dropped phantom `--color-state-hover`; it already lists the
`--color-background-alt` the component actually uses), `ai/DESIGN.md` (removed the
dead `### State` section — that token category was eliminated; hover/selected route
through `action-hover`/`border-hover`/`action`/`background-alt`), and a `README.md`
example. The 15 *missing* DESIGN.md tokens (the other drift direction) are a
separate PR.

---

## 2026-06-18 — MCP Phase 1: token JSON is authoritative for value AND usage

**Decided:** The MCP token tools (`get_token`, `find_token`, `get_spacing`, in
`scripts/tokens.mjs`) read both the resolved value and the usage prose from the
`*.tokens.json` `$description` fields. `ai/DESIGN.md` is NOT a value or usage
source for the server — it is only a startup **drift cross-check** (warn when a
semantic token's CSS property never appears in DESIGN.md). Token loading +
resolution lives once in `scripts/tokens.mjs`, imported by both the server and
`validate.mjs` (which was refactored off its inline walker — same single-source
principle as `rules.mjs`).

**Why:** The `$description` fields are richer than DESIGN.md's tables (they carry
the *why*, e.g. "at 4px the gap signals two things are one unit") and are
co-located with `$value`, so value and usage cannot drift apart. A parallel
DESIGN.md table is a drift vector, not a source. Running the cross-check on
startup immediately surfaced 15 undocumented semantic tokens (accent-bold tier,
`font.family.*`, `motion.transition.*`) — proving DESIGN.md is the thing that
drifts, not the JSON.

**Alternative considered:** The PRD amendment's split — values from JSON, usage
prose from DESIGN.md. Rejected once the `$description` fields turned out to be the
better usage source; keeping DESIGN.md authoritative for usage would have
re-introduced the exact drift the token system exists to remove.

**Status:** Shipped in PR #21 (server v0.2.0). Phase-1 introduces no deprecation
claims; brand-scoped deprecation is a separate change (so `get_token` and
`check_usage` can't disagree). The 15-token DESIGN.md gap is tracked as a docs
follow-up.

---

## 2026-06-18 — Generated artifacts must be built with LF line endings

**Decided:** `design-system.json` and `packages/components/custom-elements.json`
must be committed with LF line endings and no embedded `\r`. Enforced by a
`.gitattributes` (`* text=auto eol=lf`). On Windows, regenerate them only with
`core.autocrlf=false` and an LF working tree (`git rm --cached -rq . && git
reset --hard`), then `npm run build:meta`; verify the result hashes to the same
blob CI builds.

**Why:** With `core.autocrlf=true` (the Windows default), component `.ts` sources
check out as CRLF, so the CEM analyzer embeds `\r` into the artifact description
strings. CI builds on Linux (LF), so the committed artifact never matches a fresh
build — the "Fail if committed artifacts are stale" gate fails on *every* commit,
even docs-only ones. Worse, local git autocrlf **masks** the `\r` on read (`git
cat-file`, `git show`, even the GitHub contents API piped through Windows all
showed the blob as clean while CI correctly saw the difference), so the mismatch
is invisible without comparing against CI's own build hash.

**Alternative considered:** Strip `\r` from the artifacts post-build, or only ever
regenerate them in a Linux/cloud session. Rejected — stripping is fragile (the
masking made "is it clean?" unanswerable locally) and a Linux-only rule is a
footgun for the Windows maintainer. `.gitattributes` fixes it for every
contributor and platform; verified `git add --renormalize .` produced zero change
(all repo blobs were already LF), so it's pure prevention.

**Status:** Shipped (`.gitattributes` on main). Recorded in project memory with the
masking gotcha flagged, since it cost significant debugging time.

---

## 2026-06-17 — Branch & PR workflow rules (stop the merge pileup)

**Decided:** Adopt five lightweight PR/merge rules, codified as a hard-rule
section in `CLAUDE.md` so every session (local + cloud) loads them: (1) branch
fresh and rebase onto `main` before opening/updating a PR; (2) small,
single-purpose PRs (~200 lines); (3) validate before push and commit
regenerated artifacts in the same PR; (4) declare intent (check open
PRs/branches) before non-trivial work; (5) land or close a PR within ~7 days.

**Why:** A process-optimization pass found the project wasn't stuck for ideas —
it was stuck at the *merge* step. Four PRs had piled up (aged 6 weeks / 4 weeks
/ 3 weeks / new) and the damage was concrete: a real bug fix (#16, `.blog` body
type silently broken) sat a month; a 6-week-old branch (#13) rotted until it
*regressed* shipped state (reverted the npm scope, claimed components were
unshipped); the highest-value PR (#18, the 18-vs-20 component backfill) drifted
into merge conflict; and two decision logs were independently created and had to
be hand-merged. The common root cause: autonomous sessions boot with no memory
of each other, branch from a stale `main`, and never rebase — so work drifts and
a lone maintainer has no forcing function to land it. The one PR branched from
current `main` (#19) was the only one that stayed clean — the fix was visible in
our own data.

**Alternative considered:** A heavyweight team process (CODEOWNERS, review
rotations, required approvals). Rejected — team-shaped solutions for a non-team
problem; the real "team" is AI sessions, and the mechanism that actually reaches
them is `CLAUDE.md` (the same hard-rule lever that fixed the decision-log split).
Also considered: do nothing and triage reactively. Rejected — the pileup was
already compounding (drift makes PRs *harder* to land the longer they wait).

**Status:** Rules live in `CLAUDE.md` ("Branch & PR Workflow"). Backlog cleared
the same session: #16 merged, #13 closed (regressive), #18 merged (18-vs-20
discrepancy closed), #19 reviewed. Still optional, not yet built: a scheduled
stale-PR Action and a CI freshness check (branch-behind-`main` gate) to make
rules #1 and #5 self-enforcing rather than convention — mirrors the existing
`drift-lint.yml` scheduled-Action pattern.

---

## 2026-06-11 — Storybook + story-ui for AI-native story generation

**Decided:** Adopt Storybook (`@storybook/web-components-vite`) for the `rr-*`
components and wire in [story-ui](https://github.com/southleft/story-ui)
(`@tpitre/story-ui`) to generate stories from natural language. Three supporting
choices:
- **Barrel import only.** Stories register elements via the side-effect import
  `import '@riverromney/components'`; the package `exports` map deliberately
  exposes only the barrel, so per-component deep imports are unavailable.
- **The AI briefing is generated, not hand-written.** `story-ui-considerations.md`
  is produced by `scripts/build-considerations.mjs` from `design-system.json` +
  `ai/rules.md` (folded into `build:meta`), so it can never drift from the source
  of truth — the same discipline as every other generated artifact here.
- **Generated stories are gated like everything else.** `cem analyze` is pinned
  to `src/**/*.ts` excluding `*.test.ts`/`*.stories.ts` (so stories never leak
  into `custom-elements.json`), and a new `scripts/lint-stories.mjs` runs the
  shared `rules.mjs` over every `*.stories.*` — making it the fourth caller of
  the one rule set, alongside `validate`, `drift-lint`, and the MCP. CI also
  builds Storybook to prove stories still compile.

**Why:** the system already emits exactly the structured context an AI story
generator needs (`design-system.json`, per-component `*.meta.json`, the hard
rules). Feeding that to story-ui turns "describe a screen" into on-token stories,
and the existing rule engine keeps the AI inside the guardrails instead of
trusting it to stay there.

**Alternative considered:** keep the hand-written `*.stories.html` dev harnesses
and skip Storybook. Rejected — they can't be driven by story-ui, carry no
controls/args, and don't exercise the components the way consumers do. Also
considered letting `validate` keep linting stories incidentally; moved to a
dedicated gate so the responsibility (and the generated-stories path) is explicit.

**Status:** Shipped as a POC (merged via #19; badge/button/input baseline
stories). Not yet productionized: story-ui needs an LLM key to run, and the
generated-stories directory ships empty.

---

## 2026-06-11 — MCP expansion approved (lookup → reasoning)

**Decided:** Expand the MCP server from the 3 lookup tools to ~11, per
`docs/mcp-expansion-prd.md`: token awareness (`get_token`, `find_token`,
`get_spacing`), design reasoning (`get_rule`, `get_decision`,
`check_assembly`), and brand-aware tools (`get_brand`, `compare_brands`).
This supersedes the earlier freeze (archived ADR D-26 below: "no further
investment until external client demand exists").

**Why:** The rationale changed, not the facts. The freeze reasoning —
always-on `DESIGN.md`/`CLAUDE.md` context covers internal sessions — still
holds and remains the internal path. The expansion targets **external agents
that don't have the repo checked out**, and makes the server itself
demonstrate the Parsimony thesis: a design system an AI can reason with, not
just query. Prompted by comparison with DesignerPunk
(github.com/3fn/DesignerPunk), whose Civitas layer validates queryable
rationale as an approach — adopted here at parsimony scale (one server,
~11 tools, parsing files that already exist) rather than 88 steering docs
and 3 servers.

**Alternative considered:** Waiting for external client demand (the original
unfreeze trigger) — rejected; the MCP is positioning/portfolio
infrastructure now. Also rejected: DesignerPunk-style multi-server /
named-agent architecture — wrong scale for one maintainer and contrary to
the project's name.

**Status:** Spec'd (`docs/mcp-expansion-prd.md`). Constraints carried
forward: read-only forever; token values resolve from
`tokens/**/*.tokens.json` (DESIGN.md supplies usage prose only); deprecation
stays brand-scoped via `scripts/rules.mjs` so `get_token` and `check_usage`
cannot disagree; `check_assembly` v1 is an enumerated three-rule set.

---

## 2026-06-11 — One decision log: docs/decisions.md is canonical

**Decided:** This file is the single decision log. The parallel
`ai/DECISIONS.md` (a numbered ADR log, D-01…D-34, written in a local-only
branch of history) is merged in below as an **archived ADR section** —
D-numbers remain citable — and the original file is deleted. A hard rule in
`CLAUDE.md` now names this file as the only decision log so no session
(local or cloud) creates another. `ai/DECISION-ENGINE.md` is not a log — it
is the decision-engine sub-brand reference spec (deleted-token registry,
naming conventions) and stays where code and docs point at it.

**Why:** Local and cloud sessions independently created two decision logs in
the same week. Two logs is drift waiting to happen; this one was already the
actively-appended record. Keeping the ADR content (not just a pointer)
preserves existing D-number references in memory files and sub-brand docs.

**Alternative considered:** Keeping the numbered ADR format as canonical and
porting the dated entries into it. Rejected — cloud sessions already append
here, and retraining them is harder than redirecting one pointer.

**Status:** Done. New entries go here, dated, newest first. D-numbers are
frozen — do not extend the archived sequence.

---

## 2026-06-09 — Dark-theme palette cleanup (danger tint, dead/orphan accents)

**Decided:**
- **danger-alt** was `gray.50` (#F5F6F7, near-white) — a light box in a dark
  theme, inconsistent with the other feedback `-alt` tints. Repointed to a new
  `red.950` (#2A0A0A) dark tint, and lightened `foreground.danger` (`red.500`
  #E73027 → `red.400` #F87171) so danger text passes AA on both the canvas
  (7.06:1) and the dark danger-alt (6.62:1), matching the other bright feedback
  foregrounds. Added `red.400`/`red.950` primitives (the ramp had no dark-theme
  reds).
- **Removed dead/orphan tokens:** `background.accent` (deprecated, unused) and
  the unused light-theme-pairing chips `background/foreground.accent-indigo` and
  `.accent-sky` (#E0E7FF / #E0F2FE — near-white). Their `-bold` avatar variants
  stay. Kept the removed names in `DEPRECATED_TOKENS` to flag any lingering use.

**Why:** the now-complete, auto-generated `/tokens` catalog surfaced these as
visibly wrong — a near-white danger background and near-white "accent" chips in a
dark theme. The catalog doing its job as an audit surface.

**Alternative considered:** keep `foreground.danger` at #E73027 and add a
separate light-red just for alerts/badges. Rejected — lightening the one token is
simpler, improves canvas contrast too, and makes danger consistent with the other
feedback foregrounds.

**Status:** Shipped to source; published as `@digital2analogue2/tokens@0.1.1`;
portfolio reinstalled. DESIGN.md tables updated to match.

---

## 2026-06-09 — Staleness guards on the token propagation chain

**Decided:** Add two scheduled checks (mirroring the drift-loop's open/close-an-issue
pattern) covering the path a token value travels from source to a live site:
- **publish-freshness** (brand-tokens): builds CSS from source and diffs it,
  token by token, against the published npm package; opens an issue when a
  republish is due. Closes the "source → published" arrow.
- **tokens-freshness** (portfolio): runs `sync-tokens` to check the installed
  package against the latest published; opens an issue when behind. Closes the
  "published → consumer install" arrow.

**Why:** Once the portfolio started consuming the package, a token edit could
silently fail to reach production at two points — never republished, or never
reinstalled. Both arrows were manual and uncaught. These make staleness loud
without blocking normal commits.

**Alternative considered:** A blocking CI gate that fails the build whenever the
package is behind source. Rejected — between a token change landing and the
on-demand republish there's a legitimate transient window; failing every commit
in it would be noise. A scheduled issue nags without blocking.

**Status:** Shipped (detection + tracked issue). Comparison is by token
declaration, so comments/ordering/whitespace don't cause false positives;
verified locally against the published 0.1.0 (reports in sync).

## 2026-06-09 — First consumer (portfolio) migrated onto the published package

**Decided:** The portfolio (riverromney.design) consumes
`@digital2analogue2/tokens` via `@import ".../base.css"` plus a thin override
`:root`, instead of a hand-copied token block. The override re-declares only the
portfolio's deltas (responsive `clamp()` scaling, next/font-aware font families);
everything else cascades from the package. `sync-tokens` now checks installed vs
latest-published version instead of diffing a copied block.

**Why:** Closes the distribution loop — the system now dogfoods its own package,
so "single source of truth, consumed by real sites" is literally true and the
hand-copied snapshot (a drift vector) is gone.

**Alternative considered:** Keep inlining the block (zero new dependency, smaller
CSS). Rejected — it perpetuated the copy-paste drift the package exists to remove.
The cost accepted: the package's base CSS is heavier on the wire than the trimmed
inline block (verbose comments + DE-only primitives); revisit with a minified
build if it matters.

**Status:** Shipped for the portfolio. Surfaced and fixed a latent bug on the way
(consumers referenced `--spacing-group`/`--spacing-block`, which the inlined
subset never defined; the full package does). Other sites migrate as they come
online.

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

---

# Archived ADR Log (formerly ai/DECISIONS.md)

> Imported 2026-06-11 when the two decision logs were consolidated (see the
> 2026-06-11 consolidation entry above). D-numbers below remain citable but the
> sequence is frozen — new decisions get dated entries at the top of this file.
> Note: D-26 (MCP freeze) is superseded by the 2026-06-11 MCP expansion entry.

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
