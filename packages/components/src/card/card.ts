import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * A surface container using the elevated background tier.
 *
 * Renders on `background.alt` with `border.default` and `radius.lg`.
 * Composed of three optional slots — header, default body, footer —
 * separated by hairline borders when adjacent content is present.
 *
 * @slot header - Card heading row (title, actions, avatar).
 * @slot        - Card body content.
 * @slot footer - Card footer row (secondary actions, metadata).
 *
 * @cssprop --color-background-alt
 * @cssprop --color-border-default
 * @cssprop --radius-lg
 */
@customElement('rr-card')
export class RrCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--color-background-alt);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    /* ── Padding variants ────────────────────────────────────────── */
    :host([padding='none']) .body {
      padding: 0;
    }

    :host([padding='sm']) .body {
      padding: var(--spacing-tight);
    }

    /* default (md) */
    .body {
      padding: var(--spacing-element);
    }

    :host([padding='lg']) .body {
      padding: var(--spacing-component);
    }

    /* ── Header / footer ─────────────────────────────────────────── */
    .header,
    .footer {
      display: block;
    }

    /* Hide header/footer wrapper when slot is empty */
    .header:not(:has(*)),
    .footer:not(:has(*)) {
      display: none;
    }

    .header {
      padding: var(--spacing-tight) var(--spacing-element);
      border-bottom: 1px solid var(--color-border-default);
      font: var(--font-label-strong-medium);
      color: var(--color-foreground-default);
    }

    .footer {
      padding: var(--spacing-tight) var(--spacing-element);
      border-top: 1px solid var(--color-border-default);
      color: var(--color-foreground-alt);
      font: var(--font-label-small);
    }

    /* ── Body ────────────────────────────────────────────────────── */
    .body {
      display: block;
      color: var(--color-foreground-default);
    }
  `;

  /**
   * Internal padding around the body slot.
   * Header and footer padding is always fixed at `tight/element`.
   */
  @property({ reflect: true })
  padding: CardPadding = 'md';

  render() {
    return html`
      <div class="header"><slot name="header"></slot></div>
      <div class="body"><slot></slot></div>
      <div class="footer"><slot name="footer"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-card': RrCard;
  }
}
