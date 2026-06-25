import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type LinkVariant = 'default' | 'muted' | 'subtle';

/**
 * An anchor element that enforces the design system link style.
 *
 * Global rule: links are underlined by default and lose the underline on hover.
 * This component encapsulates that behaviour so it applies consistently across
 * shadow-DOM boundaries.
 *
 * For external links (`target="_blank"`), `rel="noopener noreferrer"` is added
 * automatically unless overridden.
 *
 * @slot - Link label content.
 *
 * @cssprop --color-foreground-action    default link colour
 * @cssprop --color-foreground-alt       muted variant
 * @cssprop --color-foreground-muted     subtle variant
 */
@customElement('rr-link')
export class RrLink extends LitElement {
  static styles = css`
    :host {
      display: inline;
    }

    a {
      color: var(--color-foreground-action);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-thickness: 1px;
      text-decoration-color: currentColor;
      transition:
        text-decoration-color var(--motion-duration-instant) var(--motion-easing-default),
        color var(--motion-duration-instant) var(--motion-easing-default);
      cursor: pointer;
      outline: none;
    }

    a:hover {
      text-decoration: none;
    }

    a:focus-visible {
      border-radius: 2px;
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
      text-decoration: none;
    }

    /* ── Variants ─────────────────────────────────────────────────── */
    :host([variant='muted']) a {
      color: var(--color-foreground-alt);
    }

    :host([variant='subtle']) a {
      color: var(--color-foreground-muted);
    }
  `;

  /** Link destination. */
  @property()
  href = '';

  /** Browsing context. Use "_blank" to open in a new tab. */
  @property()
  target: '_self' | '_blank' | '_parent' | '_top' = '_self';

  /** rel attribute. Defaults to "noopener noreferrer" when target="_blank" unless overridden. */
  @property()
  rel = '';

  /** Colour variant. Reflected to an attribute. */
  @property({ reflect: true })
  variant: LinkVariant = 'default';

  /** Accessible label forwarded to the anchor when link text alone is insufficient. */
  @property({ attribute: 'aria-label' })
  override ariaLabel: string | null = null;

  private get _rel(): string {
    if (this.rel) return this.rel;
    return this.target === '_blank' ? 'noopener noreferrer' : '';
  }

  render() {
    return html`
      <a
        href=${this.href}
        target=${this.target}
        rel=${this._rel || nothing}
        aria-label=${this.ariaLabel || nothing}
      ><slot></slot></a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-link': RrLink;
  }
}
