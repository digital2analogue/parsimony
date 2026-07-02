---
scope: tokens
applies-to: [base, dot-art, dot-blog]
always-on: true
---

# River Romney Design System — Base Dark Theme

## Visual Identity
Dark-first, green-phosphor aesthetic. Minimalist terminal-meets-editorial. Space Grotesk (sans, titles/UI), Spectral (serif, body), JetBrains Mono (code). Single accent: phosphor green (#4ADE6E) signals interactivity only.

---

## Color Tokens

Use ONLY the semantic CSS custom properties below. Never use hex values. Never reference primitive tokens (`--primitive-color-*`) in UI code.

### Background
| CSS Property | Hex | Usage |
|---|---|---|
| --color-background-default | #0A0D0A | Page canvas |
| --color-background-alt | #1E241E | Cards, panels, inputs, code blocks |
| --color-background-disabled | #2E3A2E | Disabled element fills |
| --color-background-action | #4ADE6E | Primary button fill, selected states, active toggles |
| --color-background-action-hover | #3EBA5C | Hovered action fill |
| --color-background-action-active | #349B4D | Pressed action fill |
| --color-background-success | #4ADE6E | Success badges, status pills |
| --color-background-success-alt | #0F2016 | Success alert/banner backgrounds |
| --color-background-warning | #FCD34D | Warning badges, status pills |
| --color-background-warning-alt | #221B08 | Warning alert/banner backgrounds |
| --color-background-info | #2456E4 | Info badges, banners |
| --color-background-info-alt | #0D1830 | Info alert/banner backgrounds |
| --color-background-danger | #C8002E | Destructive button fill, error surfaces. Pair with foreground-on-danger (white, 6.0:1 AA) |
| --color-background-danger-alt | #2A0A0A | Error alert / badge backgrounds (dark red tint) |
| --color-background-accent-green | #0F2016 | Green chip/tag fills |
| --color-background-accent-blue | #0D1830 | Blue chip/tag fills |
| --color-background-accent-violet | #18102E | Violet chip/tag fills |
| --color-background-accent-amber | #221B08 | Amber chip/tag fills |
| --color-background-accent-indigo-bold | #4338CA | Saturated indigo fill for bold accent surfaces — avatar backgrounds, identity badges. Pair with foreground-accent-on-indigo (white). Contrast vs white: 7.98:1 AAA |
| --color-background-accent-sky-bold | #0369A1 | Saturated sky blue fill for bold accent surfaces — avatar backgrounds, identity badges. Pair with foreground-accent-on-sky (white). Contrast vs white: 5.90:1 AA |
| --color-background-accent-green-bold | #047857 | Saturated emerald fill for bold accent surfaces — avatar backgrounds, identity badges. Pair with foreground-accent-on-green-bold (white). Contrast vs white: 5.47:1 AA |
| --color-background-accent-amber-bold | #B45309 | Saturated amber fill for bold accent surfaces — avatar backgrounds, identity badges. Pair with foreground-accent-on-amber-bold (white). Contrast vs white: 5.02:1 AA |

### Foreground
| CSS Property | Hex | Contrast | Usage |
|---|---|---|---|
| --color-foreground-default | #C8CFC4 | 12.3:1 AAA | Primary text and icons |
| --color-foreground-alt | #A0A89A | 8.0:1 AA | Secondary text |
| --color-foreground-muted | #8B9683 | 6.3:1 AA | Tertiary text, placeholders, helper text |
| --color-foreground-disabled | #1E241E | exempt | Disabled element labels |
| --color-foreground-action | #4ADE6E | 11.1:1 AAA | Links, active nav, text CTAs |
| --color-foreground-on-action | #0A0D0A | 11.1:1 AAA | Text on background-action fills |
| --color-foreground-success | #4ADE6E | 11.1:1 AAA | Success text/icons |
| --color-foreground-on-success | #0A0D0A | 11.1:1 AAA | Text on success fills |
| --color-foreground-warning | #FCD34D | 12.0:1 AAA | Warning text/icons |
| --color-foreground-on-warning | #0A0D0A | — | Text on warning fills |
| --color-foreground-info | #93C5FD | 7.5:1 AA | Informational text/icons |
| --color-foreground-on-info | #FFFFFF | — | Text on info fills |
| --color-foreground-danger | #F87171 | 7.06:1 AAA | Error text, delete labels, danger alert/badge text |
| --color-foreground-on-danger | #FFFFFF | 6.0:1 AA | Text on destructive fills |
| --color-foreground-accent-green | #4ADE6E | 11.1:1 AAA | Green accent text/icons, pair with bg-accent-green |
| --color-foreground-accent-blue | #93C5FD | 7.5:1 AA | Blue accent text/icons, pair with bg-accent-blue |
| --color-foreground-accent-violet | #C4B5FD | 7.0:1 AA | Violet accent text/icons |
| --color-foreground-accent-amber | #FCD34D | 12.0:1 AAA | Amber accent text/icons |
| --color-foreground-accent-on-green | #0A0D0A | — | Text/icons on green accent tint fills. Near-black on dark theme; for bold green fills use accent-on-green-bold (white). DE overrides to white |
| --color-foreground-accent-on-blue | #0A0D0A | — | Text/icons on blue accent fills. Near-black on dark theme |
| --color-foreground-accent-on-violet | #0A0D0A | — | Text/icons on violet accent fills. Near-black on dark theme |
| --color-foreground-accent-on-amber | #0A0D0A | — | Text/icons on amber accent fills. Near-black on dark theme |
| --color-foreground-accent-on-indigo | #FFFFFF | 7.98:1 AAA | Text/icons on indigo accent fills (background-accent-indigo-bold) |
| --color-foreground-accent-on-sky | #FFFFFF | 5.90:1 AA | Text/icons on sky accent fills (background-accent-sky-bold) |
| --color-foreground-accent-on-amber-bold | #FFFFFF | 5.0:1 AA | Text/icons on background-accent-amber-bold (#B45309 fill) — avatars, identity badges |
| --color-foreground-accent-on-green-bold | #FFFFFF | 5.47:1 AA | Text/icons on background-accent-green-bold (emerald.600 fill) — avatars, identity badges |

### Border
| CSS Property | Hex | Usage |
|---|---|---|
| --color-border-default | #1E241E | All UI edges — cards, inputs, dividers |
| --color-border-muted | #0F2016 | Hairline dividers, table row separators |
| --color-border-elevated | #2E3A2E | Prominent borders, raised surface edges |
| --color-border-hover | #8B9683 | Border on interactive hover |
| --color-border-active | #A0A89A | Border on active/pressed state |
| --color-border-action | #4ADE6E | Outline for interactive outlined controls (secondary/ghost button). 11.1:1 on canvas — passes SC 1.4.11. Accent green is rule-compliant here: the control is interactive. |
| --color-border-focus | #4ADE6E | Focus ring — phosphor green for keyboard nav |
| --color-border-disabled | #0A0D0A | Border on disabled elements |

---

## Typography — Semantic Tokens

Display and title tokens: Space Grotesk weight 300 (light). Body: Spectral weight 400. Labels/Code: Space Grotesk weight 400. Label Strong: Space Grotesk weight 500.

### Font Family
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-family-sans | Space Grotesk | Sans-serif family for titles, labels, and UI text. Decision-engine override: Geist |
| --font-family-serif | Spectral | Serif family for body and long-form prose |
| --font-family-mono | JetBrains Mono | Monospaced family for code and technical UI labels |

### Display
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-display | 300 2.5rem/1.1 Space Grotesk | Hero text, splash headlines. One per page maximum. |

### Title (structural headings)
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-title-large | 300 2rem/1.25 Space Grotesk | Primary page heading (h1) |
| --font-title-medium | 300 1.5rem/1.25 Space Grotesk | Section heading (h2) |
| --font-title-small | 300 1.25rem/1.25 Space Grotesk | Sub-section heading (h3) |

### Body
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-body-large | 400 1rem/1.6 Spectral | Default paragraph text |
| --font-body-medium | 400 0.875rem/1.6 Spectral | Secondary body text |
| --font-body-small | 400 0.75rem/1.6 Spectral | Fine print, footnotes |

### Label
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-label-large | 400 1rem/1.25 Space Grotesk | Prominent UI labels |
| --font-label-medium | 400 0.875rem/1.25 Space Grotesk | Navigation, button text, standard UI |
| --font-label-small | 400 0.75rem/1.25 Space Grotesk | Meta text, captions, fine print |
| --font-label-xsmall | 400 0.625rem/1.25 Space Grotesk | Micro labels — constrained UI only (chip annotations, icon badges) |

### Label Strong (weight-emphasized UI)
Same sizes as Label but weight stepped up to 500. Use for active states, primary CTAs, emphasized labels.
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-label-strong-large | 500 1rem/1.25 Space Grotesk | Active nav, prominent section headers |
| --font-label-strong-medium | 500 0.875rem/1.25 Space Grotesk | Button text, active tabs, column headers |
| --font-label-strong-small | 500 0.75rem/1.25 Space Grotesk | Active badges, selected chips, emphasized meta |
| --font-label-strong-xsmall | 500 0.625rem/1.25 Space Grotesk | Emphasized micro labels — active chip step indicators |

### Mono Label (monospaced UI metadata)
JetBrains Mono at label scale. Use for token names, value readouts, technical identifiers in UI chrome. Not for prose or code blocks — use font.code for those.
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-mono-label-small | 400 0.75rem/1.25 JetBrains Mono | Token names, value metadata, technical UI labels |
| --font-mono-label-strong-small | 500 0.75rem/1.25 JetBrains Mono | All-caps category labels, active token identifiers, section markers |
| --font-mono-label-xsmall | 500 0.625rem/1.25 JetBrains Mono | Color chip step labels, compact mono annotations |

### Code
| CSS Property | Resolved Value | Usage |
|---|---|---|
| --font-code | 400 0.875rem/1.6 JetBrains Mono | All code blocks, inline code, terminal UI |

---

## Typography — Primitive Tokens

### Font Size Scale

**Base dark theme values** (fixed — for desktop/app contexts). Portfolio sites override these with fluid `clamp()` values — see Responsive Scaling below.

| CSS Property | Value | Referenced by |
|---|---|---|
| --primitive-font-size-2xs | 0.625rem (10px) | font.label.xsmall, font.label-strong.xsmall, font.mono-label-xsmall |
| --primitive-font-size-xs | 0.75rem (12px) | font.body.small, font.label.small, font.label-strong.small, font.mono-label, font.mono-label-strong |
| --primitive-font-size-sm | 0.875rem (14px) | font.body.medium, font.label.medium, font.label-strong.medium, font.code |
| --primitive-font-size-base | 1rem (16px) | font.body.large, font.label.large, font.label-strong.large |
| --primitive-font-size-md | 1.25rem (20px) | font.title.small |
| --primitive-font-size-lg | 1.5rem (24px) | font.title.medium |
| --primitive-font-size-2xl | 2rem (32px) | font.title.large |
| --primitive-font-size-3xl | 2.5rem (40px) | font.display |

### Responsive Scaling (portfolio sites)

For portfolio and editorial contexts, replace the fixed font-size primitives in `:root` with fluid `clamp()` values. This makes every semantic token that references a primitive automatically scale — no selector-level overrides needed.

**Pattern:** `clamp(mobile-floor, preferred-vw, desktop-ceiling)` — hits desktop ceiling at ~640px viewport.

| CSS Property | Fluid value | Mobile floor | Desktop ceiling |
|---|---|---|---|
| --primitive-font-size-xs | clamp(0.65rem, 1.9vw, 0.75rem) | 10.4px | 12px |
| --primitive-font-size-sm | clamp(0.7rem, 2.2vw, 0.875rem) | 11.2px | 14px |
| --primitive-font-size-base | clamp(0.875rem, 2.5vw, 1rem) | 14px | 16px |
| --primitive-font-size-md | clamp(1rem, 3.2vw, 1.25rem) | 16px | 20px |
| --primitive-font-size-lg | clamp(1.125rem, 3.8vw, 1.5rem) | 18px | 24px |
| --primitive-font-size-2xl | clamp(1.5rem, 5vw, 2rem) | 24px | 32px |
| --primitive-font-size-3xl | clamp(1.75rem, 6.25vw, 2.5rem) | 28px | 40px |

For spacing primitives (lg through 5xl), apply the same approach:

| CSS Property | Fluid value | Mobile floor | Desktop ceiling |
|---|---|---|---|
| --primitive-space-lg | clamp(16px, 3.75vw, 24px) | 16px | 24px |
| --primitive-space-xl | clamp(20px, 5vw, 32px) | 20px | 32px |
| --primitive-space-2xl | clamp(32px, 7.5vw, 48px) | 32px | 48px |
| --primitive-space-3xl | clamp(40px, 10vw, 64px) | 40px | 64px |
| --primitive-space-4xl | clamp(48px, 12.5vw, 80px) | 48px | 80px |
| --primitive-space-5xl | clamp(80px, 20vw, 128px) | 80px | 128px |

Smaller spacing values (3xs–md) are fixed — they're already tight enough and don't benefit from fluid scaling.

### Font Weight Scale
| CSS Property | Value | Usage |
|---|---|---|
| --primitive-font-weight-light | 300 | Display and title tokens |
| --primitive-font-weight-regular | 400 | Body, label, and code tokens |
| --primitive-font-weight-medium | 500 | Label Strong tokens |
| --primitive-font-weight-semibold | 600 | Ad-hoc emphasis only |
| --primitive-font-weight-bold | 700 | Ad-hoc strong emphasis only |

### Letter-Spacing
| CSS Property | Value | Usage |
|---|---|---|
| --letter-spacing-display | -0.01em | font.display |
| --letter-spacing-title | -0.025em | font.title.* |
| --letter-spacing-body | 0em | font.body.* |
| --letter-spacing-label | 0.03em | font.label.* |
| --letter-spacing-all-caps | 0.1em | ALL CAPS text only |

---

## Spacing

### Semantic Tokens (use these in UI code)
| CSS Property | Resolves to | Usage |
|---|---|---|
| --spacing-micro | 4px | Icon-to-label margins, badge gaps, tight nudges within one element |
| --spacing-tight | 8px | Checkbox-to-label, icon-to-text, stacked lines within one element |
| --spacing-inline | 12px | Nav row items, pill tag groups, horizontal list gaps |
| --spacing-element | 16px | Default internal padding — inputs, buttons, menu items, list rows |
| --spacing-component | 24px | Between distinct components — label-to-input, card-to-card |
| --spacing-group | 32px | Between component groups — form sections, card grid gaps |
| --spacing-layout | 48px | Between major layout regions — sidebar/main, header/first content |
| --spacing-block | 64px | Between content blocks within a section — text/media, editorial rows |
| --spacing-page | 80px | Between major editorial sections — hero-to-content, section-to-section in portfolio and doc contexts |
| --spacing-section | 128px | Between top-level page sections — hero, features, footer |

### Primitives (never use directly in UI)
| CSS Property | Value |
|---|---|
| --primitive-space-3xs | 2px |
| --primitive-space-2xs | 4px |
| --primitive-space-xs | 8px |
| --primitive-space-sm | 12px |
| --primitive-space-md | 16px |
| --primitive-space-lg | 24px |
| --primitive-space-xl | 32px |
| --primitive-space-2xl | 48px |
| --primitive-space-3xl | 64px |
| --primitive-space-4xl | 80px |
| --primitive-space-5xl | 128px |

---

## Motion — Semantic Tokens

### Duration
| CSS Property | Value | Usage |
|---|---|---|
| --motion-duration-instant | 120ms | Hover states, focus rings, color swaps — felt but not watched |
| --motion-duration-standard | 200ms | Dropdowns, tooltips, accordion expand/collapse — the default |
| --motion-duration-emphasized | 350ms | Modals, drawers, page-level transitions — eye tracks consciously |

### Easing
| CSS Property | Value | Usage |
|---|---|---|
| --motion-easing-enter | cubic-bezier(0,0,0.58,1) | Elements appearing — starts fast, decelerates to rest |
| --motion-easing-exit | cubic-bezier(0.42,0,1,1) | Elements disappearing — starts slow, accelerates to exit |
| --motion-easing-move | cubic-bezier(0.42,0,0.58,1) | Repositioning within viewport — panels, tab indicators |
| --motion-easing-default | cubic-bezier(0.25,0.1,0.25,1) | Directionless fades, color shifts |

### Transition (composite shorthands)
Duration + easing + delay in one token — drop straight into a `transition` property.
| CSS Property | Resolves to | Usage |
|---|---|---|
| --motion-transition-micro | 120ms cubic-bezier(0.25,0.1,0.25,1) 0ms | Micro-interactions — hover color shifts, focus ring fade-in, pressed background flips, checkbox tick reveals. Not for layout/size/position changes |
| --motion-transition-standard | 200ms cubic-bezier(0.25,0.1,0.25,1) 0ms | The workhorse — dropdowns, tooltips, accordions, tab switches, popovers. Directionless easing runs both directions without feeling lopsided |
| --motion-transition-emphasized | 350ms cubic-bezier(0.42,0,0.58,1) 0ms | Layer-shifting motion — modal entry/exit, drawer slides, route-level transitions. Not for small components |
| --motion-transition-move | 200ms cubic-bezier(0.42,0,0.58,1) 0ms | Repositioning within the viewport — tab indicator slides, segmented control thumbs, drag-and-drop snap |

---

## Border Radius
| CSS Property | Value | Usage |
|---|---|---|
| --radius-none | 0 | Tables, code blocks, structural layout |
| --radius-sm | 4px | Inputs, tags, small chips |
| --radius-default | 8px | Buttons, dropdowns, most components |
| --radius-lg | 12px | Cards, panels |
| --radius-xl | 16px | Modals, hero cards |
| --radius-full | 9999px | Badges, pills, avatars |

---

## Shadow
| CSS Property | Value | Usage |
|---|---|---|
| --shadow-none | none | Flat — no elevation; use background.alt for surface separation |
| --shadow-raised | 0 1px 3px rgba(0,0,0,0.08) | Subtle lift — inputs on hover/focus |
| --shadow-overlay | 0 6px 20px rgba(0,0,0,0.16) | Context menus, popovers, dropdowns |
| --shadow-dialog | 0 12px 40px rgba(0,0,0,0.24) | Modals, drawers, toasts |

Cards use `background.alt` for surface separation — no shadow token needed.

---

## Iconography
| CSS Property | Value | Usage |
|---|---|---|
| --icon-size-compact | 16px | Dense UI — input adornments, tag icons, tight toolbars |
| --icon-size-default | 20px | Default — nav items, button icons, list row glyphs |
| --icon-size-large | 24px | Section header icons, standalone icon buttons |
| --icon-size-xl | 32px | Empty states, onboarding illustrations |

---

## Hard Guardrails
- NEVER use hex values — always `var(--color-*)`
- NEVER reference `--primitive-*` tokens in UI code
- NEVER fabricate tokens — if not listed above, it does not exist
- Display and title tokens are weight 300 (light) — not 400
- Accent green is NEVER resting text — interactivity or intentional emphasis only
- All text/bg pairings in this system pass WCAG AA (4.5:1) — verify before adding new ones
- Spacing values must come from the defined scale — no arbitrary values

---

## Interaction Patterns

### Link style — global rule
All `<a>` elements are underlined **by default** and lose the underline on `:hover`. This is the inverse of common convention and is intentional.

```css
/* Global base — applies to all links */
a {
  color: var(--color-foreground-action);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  text-decoration-color: currentColor;
  transition: text-decoration-color var(--motion-duration-instant) var(--motion-easing-default),
              color var(--motion-duration-instant) var(--motion-easing-default);
}
a:hover {
  text-decoration: none;
}
```

UI navigation elements that should **not** be underlined explicitly opt out:

```css
/* Opt-out pattern for nav/row/UI links */
.topbar a,
.topbar__links a,
.case,
.work-row,
.about-experience__row,
.case-detail__back,
.case-detail__pager-link {
  text-decoration: none;
}
```

**Common mistake:** adding `text-decoration: underline` to a specific selector's `:hover` state overrides the global `a:hover { text-decoration: none }` due to specificity — and silently breaks the hover removal. Always audit for this when styling link elements.
