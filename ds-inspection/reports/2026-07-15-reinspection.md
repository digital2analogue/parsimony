# Multi-Point Inspection Report — Parsimony (Re-inspection)

_Inspected: 2026-07-15 (evening) · Technician: Claude Code (claude-fable-5) · Previous inspection: 2026-07-15 (morning), 58/80_
_Vehicle profile: `ds-inspection/GARAGE.md` (checked in 2026-07-15; access map unchanged — repo, Figma, docs all live)_

## The short version

Same day, different vehicle. The morning inspection found a well-built system whose parts weren't connected: a drifted flagship component, a dark MCP, unguarded keyboard code, no visual net, no distribution. Every one of those is now fixed **and fenced** — the button matches Figma 1:1 with a CI gate that makes that class of drift impossible, the MCP is registered, the components are published to npm and install-verified, 66 runner-generated visual baselines guard every story, and a blind agent given only the system's docs now produces on-system UI with essentially no guessing. **Score: 68/80, up from 58 — seven of eight stations green, zero red.** The one remaining yellow is the honest one: component *breadth* (no table, tooltip, menu, toast — the things consumers hand-rolled) is now the only thing between this system and "can build most core flows."

**Overall: 68/80** (was 58/80) — stations 7–8 skipped both passes at owner's request.

## Inspection sheet

|  # | Station                         | Quality      | Light | Score |   Δ   |
|---:|:--------------------------------|:-------------|:-----:|------:|:-----:|
|  1 | Coverage & gaps                 | Complete     |  🟡   |  7/10 |   —   |
|  2 | Best practices                  | Sound        |  🟢   |  9/10 |  +1   |
|  3 | Accessibility                   | Sound        |  🟢   |  8/10 |  +1   |
|  4 | Shared language                 | Sound        |  🟢   |  9/10 |  +2   |
|  5 | Testing & validation            | Sound        |  🟢   |  9/10 |  +1   |
|  6 | Orchestration                   | Synchronized |  🟢   |  9/10 |  +3   |
|  7 | Governance & version control    | Extensible   | skip  |  skip |   —   |
|  8 | Feedback & adoption             | Extensible   | skip  |  skip |   —   |
|  9 | Machine-readable docs & context | AI-Ready     |  🟢   |  9/10 |   —   |
| 10 | Agent access                    | AI-Ready     |  🟢   |  8/10 |  +2   |
|    | **Overall**                     |              |       | **68/80** | **+10** |

**Lights:** 🟢 7 green · 🟡 1 yellow · 🔴 0 red (was: 3 green · 5 yellow · 0 red)

## What changed since last inspection

**Lights turned off (morning findings → resolution):**
- **Ghost/danger button drift** (S6 headline) → ghost implemented in code from Figma truth; danger + active/focus/loading added to Figma (72-variant matrix); Code Connect synced both directions; **CI parity gate** (`validate` §4) makes the drift class structurally impossible. PRs #118/#119/#120.
- **MCP registered in no toolchain** (S10 headline) → `.mcp.json` at repo root, server stdio-verified (17 tools, live `check_usage` call). PR #121.
- **Zero keyboard test assertions** (S3/S5) → 10 keyboard tests (tabs arrows/Home/End/disabled-skip, dialog Escape, button semantics) + `prefers-reduced-motion` on all four animating components. PR #122.
- **No visual regression on parsimony itself** (S5) → manifest-driven Playwright suite, 66 runner-generated baselines (zoom-verified real Space Grotesk), wired into `verify` — already caught nothing-changed correctly across 4 subsequent PRs. PRs #124/#125.
- **Three size vocabularies + title/heading mismatch** (S4) → button speaks `sm|md|lg` (Figma identity map), `rr-alert.title` → `heading` (also un-shadows the global HTML attribute). PR #126.
- **No distribution channel** (S1/S6) → `@digital2analogue2/parsimony-components@0.1.0` **published and install-verified** from the public registry. PR #127 + publish run.
- **Consumer version skew** (S6) → all three consumers on `^0.3.1` (decisioning-table #41, river-intro #20 — the latter shipping the border-legibility fix to riverromney.com).
- **Generation-test docs gaps** (S9) → all five answered; the select gap exposed and fixed a real `value`-sync defect. PR #123.
- **Figma variable drift** (S6, found mid-work) → `background/danger`, `danger-alt`, `foreground/danger`, `border/default` re-aliased to token truth; `border/alt` + `border/action` created; 3 missing primitives added.
- **FigmaLint pass** (this evening, S2): every component type on its own page (`Components / <Name>`, 19 pages, matching the Foundations naming); TEXT component properties added and linked on 9 sets (~150 text nodes) following the Input naming convention; Skeleton description added; `Tabs=3` renamed + documented; Dialog's off-brand Inter `×` glyph → Space Grotesk; **Tag component set created** (the last rr-* with no design counterpart) with variable-bound colors and a Label property; `tag.figma.ts` mapped (PR #128) — **Code Connect 19/19**.

**Corrections to the morning record:**
- [verified] The morning report said the Figma file's page listing "returned only a Cover page." The file in fact had 10 organized pages (Getting Started, five Foundations pages, Changelog) — the original `get_metadata` page listing was truncated/wrong. What *was* true: all 17 component sets shared one page with all variants stacked at (0,0); both fixed this evening.

**New findings this pass:**
- [verified] Blind generation re-test (same task, fresh agent, docs-only): opened with *"All the contracts I need are documented"* — used `variant="ghost"` for the quiet action, followed the assembly patterns by name, applied the select options pattern and card heading neutralization straight from the docs. Remaining gaps are two genuinely-minor docs items (rr-card host `display` behavior undocumented; rr-toggle Overview/Usage still TODO stubs) plus interpretation calls — night-and-day vs the morning's five contract gaps.
- [verified] Figma binding health is excellent: zero unbound solid fills/strokes/text-fills across every sampled variant, zero `Frame 22`-style layer names.
- [verified] Tabs in Figma remains a single static component (three sample tabs), not a variant set with selection states — renamed and documented as such; a rebuild is the remaining design-side debt.

## Station records (delta format)

### Station 1 — Coverage & gaps: YELLOW (7/10, unchanged number — different yellow)
The morning's yellow was leg-unevenness and no distribution: **both fixed** (19/19 components in design with 19/19 Code Connect; package published + install-verified). What keeps it yellow now is purely **breadth**: tooltip, table, menu/dropdown, popover, accordion, pagination, breadcrumb, toast are still missing — and they're exactly what decisioning-table hand-rolled. Coverage-vs-needs is now the single honest gap. First move: let decisioning-table's hand-rolled set drive a staples roadmap (table + menu + toast first).

### Station 2 — Best practices: GREEN (9/10, +1)
Everything from the morning holds (native elements, token discipline, machine-enforced conventions), plus: real file hierarchy (page per component + Foundations pages), TEXT component properties following one naming convention, zero unbound values verified across all sets, descriptions on 18/18 sets, off-brand glyph font fixed. Remaining nit: Tabs set structure.

### Station 3 — Accessibility: GREEN (8/10, +1)
The implemented-but-unguarded gap is closed: 10 keyboard tests in CI, `prefers-reduced-motion` honored. Still thin: no screen-reader test plan; accent-family contrast pairings remain outside `validate_brand` v1 (documented deferral).

### Station 4 — Shared language: GREEN (9/10, +2)
One size vocabulary (`sm|md|lg`) with Figma as identity map; `heading` unified across alert/dialog; Figma property names follow one scheme; the parity gate enforces cross-asset naming at PR time. Icon's semantic scale stays as the documented deviation.

### Station 5 — Testing & validation: GREEN (9/10, +1)
The two morning gaps (keyboard assertions, no visual net) are both closed. The suite is now: schema + rules + refs + Code Connect parity + story lint + 4 staleness gates + 245 behavior/axe tests + 10 keyboard tests + 66 visual baselines — all on every push. Withheld point: evals for AI-generated *Figma* output don't exist yet (the code side has `check_usage`/drift).

### Station 6 — Orchestration: GREEN (9/10, +3 — the big mover)
Every drift found in the morning is fixed at the *mechanism* level, not just the instance: button 1:1 with a CI gate; Figma variables re-aliased to token truth; consumers on one version; CLAUDE.md matches reality; published package = real distribution pipe. Withheld point: `drift_audit.py` (Figma-vars-vs-tokens) still runs on no schedule — today's variable drift was caught by hand.

### Station 9 — Machine-readable docs & context: GREEN (9/10, unchanged — at a higher standard)
Generation re-test run and passed with near-zero contract gaps (the proof, twice over). The layer remains generated-from-source with CI staleness gates. Withheld point: 16 of 19 component MDX overviews are still TODO stubs (toggle's stub was the one gap the re-test actually felt), and there's no llms.txt for web-hosted consumption.

### Station 10 — Agent access: GREEN (8/10, +2)
`.mcp.json` on main; server stdio-verified; components installable from npm (agents in consumer repos can now actually use them); Code Connect 19/19. Withheld: "a fresh session lists the tools with zero setup" hasn't been *observed* yet (this session predates the registration — first fresh clone/session will confirm), and the live test still ran via the file surface rather than through a registered MCP transport.

## Next service

- Remaining work items: see `ds-inspection/work-orders/2026-07-15-work-order-2.md`
- Recommended cadence: quarterly deep pass (next: 2026-10, **include stations 7–8**); the everyday checks are now all in CI
- The next score points live in: staples breadth (S1), overview stubs + llms.txt (S9), drift_audit scheduling (S6), fresh-session MCP confirmation (S10)
