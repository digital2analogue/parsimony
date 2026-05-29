---
id: figma
scope: integration
applies-to: [base]
last-updated: 2026-05-29
---

# Figma ↔ Code Connect

How the `rr-*` web components map to the Figma component library, and why the
`figma.componentKey` field in every `*.meta.json` is currently empty.

## The Figma file

- **Name:** Brand Tokens Design System
- **File key:** `4aOEBHcnAv2Kbn0g1arL78`
- **URL:** https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System
- Holds the foundations (variables, text styles, effect styles) plus a component
  set per `rr-*` component. Component variants mirror the code (e.g. Badge's 9
  variants, Button's variant×size×state matrix).

## Why `componentKey` is empty everywhere

`figma.componentKey` is intentionally left `""` in all `*.meta.json` files. It is
**not** retrievable on the current Figma plan:

- The account is on a **Pro** plan. Code Connect — both the publishing CLI and the
  MCP context tools (`get_context_for_code_connect`, `get_code_connect_map`) —
  requires a **Developer seat on an Organization or Enterprise plan**. Those tools
  return a hard "you need a Developer seat" error.
- The non–Code-Connect read tools (`get_metadata`, `get_design_context`) expose a
  node's structure and reference code but **not** its published component key.

Because Code Connect *publishing* needs that same Developer seat, the key would be
inert metadata even if we had it. **The `node-id` URLs in each `*.figma.ts` are the
working link** between code and design; `componentKey` is a future nicety.

### To populate it later

When a Developer seat on an Org/Enterprise plan is available, fetch each component
set's key via Code Connect (or the Figma REST API `GET /v1/files/:key/nodes`), and
fill `figma.componentKey` in each `*.meta.json`, then regenerate `design-system.json`.

## Node-ID map (verified 2026-05-29 via the Figma MCP)

Every node below was confirmed to resolve to a correctly-named component set whose
variants match the code.

| Component (tag) | Figma node | Figma component |
|---|---|---|
| `rr-badge` | `96:21` | Badge |
| `rr-button` | `98:56` | Button ⚠️ (see caveats) |
| `rr-input` | `103:27` | Input |
| `rr-icon` | `115:10` | Icon |
| `rr-card` | `115:19` | Card |
| `rr-link` | `115:26` | Link |
| `rr-select` | `117:28` | Select |
| `rr-checkbox` | `117:43` | Checkbox |
| `rr-toggle` | `117:56` | Toggle |
| `rr-textarea` | `119:24` | Textarea |
| `rr-avatar` | `119:65` | Avatar |
| `rr-alert` | `121:50` | Alert |
| `rr-radio-group` | `121:77` | RadioGroup |
| `rr-radio` | _(none)_ | inside RadioGroup `121:77` — see caveats |
| `rr-spinner` | `124:11` | Spinner |
| `rr-dialog` | `124:31` | Dialog |
| `rr-progress` | `125:6` | Progress |
| `rr-tab-list` | `125:7` | Tabs |
| `rr-tab` | _(none)_ | inside Tabs `125:7` — see caveats |
| `rr-skeleton` | `126:5` | Skeleton |

## Caveats / known divergences

- **`rr-radio` and `rr-tab` have no standalone Figma component.** Figma models the
  whole group as one component — `RadioGroup` (`121:77`) and `Tabs` (`125:7`) — with
  the individual radios/tabs drawn as internal frames, not as separate components. So
  these two tags carry an empty `nodeId`; their Code Connect mapping is expressed
  through the parent's `*.figma.ts` (`radio.figma.ts`, `tabs.figma.ts`), whose
  `example` shows the full composition including the child elements. (An earlier
  revision incorrectly gave `rr-radio`/`rr-tab` their container's node ID.)
- **Button is missing the `danger` variant in Figma.** The canonical set is
  `primary / secondary / ghost / danger`. The code component now implements all
  four; the Figma Button set (`98:56`) still only has `primary / secondary / ghost`.
  **Design follow-up:** add a `danger` variant to the Figma Button component set,
  then add `danger: 'danger'` to the `Variant` enum in `button.figma.ts`. Until
  then `button.figma.ts` maps only the three variants that exist in Figma.
