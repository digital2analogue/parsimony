import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarColor = 'default' | 'indigo' | 'sky' | 'green' | 'amber';

/**
 * A circular identity surface showing initials or an image.
 *
 * When `src` is provided an `<img>` fills the circle. When omitted, up to two
 * initials are derived from `name` (first letter of each word, max two words).
 * Colorized variants use the accent-bold fill tier with matching on-* foreground
 * tokens — all pairs are WCAG AA verified.
 *
 * @slot - Optional custom content to replace initials (e.g. an icon)
 * @csspart avatar - The root circle element
 * @csspart img - The img element (only when src is set)
 * @csspart initials - The initials text element
 */
@customElement('rr-avatar')
export class RrAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      background: var(--component-avatar-background-default);
      color: var(--component-avatar-foreground-default);
      width: var(--component-avatar-size-md);
      height: var(--component-avatar-size-md);
      font: var(--font-label-strong-small);
      flex-shrink: 0;
      user-select: none;
      line-height: 1;
    }

    /* Sizes */
    :host([size='sm']) .avatar {
      width: var(--component-avatar-size-sm);
      height: var(--component-avatar-size-sm);
      font: var(--font-label-strong-xsmall);
    }

    :host([size='lg']) .avatar {
      width: var(--component-avatar-size-lg);
      height: var(--component-avatar-size-lg);
      font: var(--font-label-strong-medium);
    }

    :host([size='xl']) .avatar {
      width: var(--component-avatar-size-xl);
      height: var(--component-avatar-size-xl);
      font: var(--font-label-strong-medium);
    }

    /* Color variants */
    :host([color='indigo']) .avatar {
      background: var(--component-avatar-background-indigo);
      color: var(--component-avatar-foreground-indigo);
    }

    :host([color='sky']) .avatar {
      background: var(--component-avatar-background-sky);
      color: var(--component-avatar-foreground-sky);
    }

    :host([color='green']) .avatar {
      background: var(--component-avatar-background-green);
      color: var(--component-avatar-foreground-green);
    }

    :host([color='amber']) .avatar {
      background: var(--component-avatar-background-amber);
      color: var(--component-avatar-foreground-amber);
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  @property({ reflect: true }) size: AvatarSize = 'md';
  @property({ reflect: true }) color: AvatarColor = 'default';
  @property() name = '';
  @property() src = '';
  @property({ attribute: 'alt' }) imgAlt = '';

  private get _initials(): string {
    if (!this.name) return '';
    const words = this.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  render() {
    const hasSlot = this.querySelectorAll('*').length > 0;
    return html`
      <div
        class="avatar"
        part="avatar"
        role=${this.name && !this.src ? 'img' : nothing}
        aria-label=${this.name && !this.src ? this.name : nothing}
      >
        ${this.src
          ? html`<img part="img" src=${this.src} alt=${this.imgAlt || this.name || ''} />`
          : hasSlot
          ? html`<slot></slot>`
          : html`<span part="initials" aria-hidden="true">${this._initials}</span>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-avatar': RrAvatar;
  }
}
