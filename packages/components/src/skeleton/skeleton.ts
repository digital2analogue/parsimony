import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

/**
 * `<rr-skeleton>` — animated shimmer placeholder for loading states.
 *
 * Use in place of content while data is being fetched. Three shape
 * variants match common content types: text lines, avatars, and image blocks.
 *
 * @attr {text|circular|rectangular} variant - Shape of the skeleton (default: text)
 * @attr width   - CSS width value (default: '100%' for text/rectangular, '40px' for circular)
 * @attr height  - CSS height value (default: '1em' for text, '40px' for circular/rectangular)
 *
 * @example
 * <!-- Text line skeleton -->
 * <rr-skeleton></rr-skeleton>
 *
 * <!-- Avatar skeleton -->
 * <rr-skeleton variant="circular" width="40px" height="40px"></rr-skeleton>
 *
 * <!-- Card image skeleton -->
 * <rr-skeleton variant="rectangular" height="200px"></rr-skeleton>
 */
@customElement('rr-skeleton')
export class RrSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .skeleton {
      background: var(--color-background-disabled);
      background-image: linear-gradient(
        90deg,
        var(--color-background-disabled) 0%,
        var(--color-background-alt) 50%,
        var(--color-background-disabled) 100%
      );
      background-size: 200% 100%;
      animation: rr-shimmer 1.6s ease-in-out infinite;
      border-radius: var(--radius-sm);
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
      }
    }

    :host([variant='text']) .skeleton {
      border-radius: var(--radius-sm);
      transform: scaleY(0.85);
      transform-origin: center;
    }

    :host([variant='circular']) .skeleton {
      border-radius: var(--radius-full);
    }

    :host([variant='rectangular']) .skeleton {
      border-radius: var(--radius-default);
    }

    @keyframes rr-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  /** Shape of the skeleton. */
  @property({ reflect: true }) variant: SkeletonVariant = 'text';

  /** CSS width value. Defaults to 40px for circular, otherwise 100%. */
  @property() width = '';

  /** CSS height value. Defaults to 40px for circular, otherwise 1em. */
  @property() height = '';

  private get _style(): string {
    const w = this.width || (this.variant === 'circular' ? '40px' : '100%');
    const h = this.height || (this.variant === 'circular' ? '40px' : '1em');
    return `width: ${w}; height: ${h};`;
  }

  render() {
    return html`
      <span
        class="skeleton"
        role="presentation"
        aria-hidden="true"
        style="${this._style}"
      ></span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-skeleton': RrSkeleton;
  }
}
