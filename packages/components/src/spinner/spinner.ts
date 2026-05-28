import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * `<rr-spinner>` — animated loading indicator.
 *
 * Renders a circular SVG spinner using the action color token.
 * Announces to screen readers via an `aria-live` region.
 *
 * @attr {sm|md|lg} size - Visual size (default: md)
 * @attr label - Accessible label text (default: "Loading")
 *
 * @example
 * <rr-spinner></rr-spinner>
 * <rr-spinner size="sm" label="Saving…"></rr-spinner>
 */
@customElement('rr-spinner')
export class RrSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    svg {
      display: block;
      width: 24px;
      height: 24px;
      animation: rr-spin 0.8s linear infinite;
      color: var(--color-foreground-action);
    }

    :host([size='sm']) svg {
      width: 16px;
      height: 16px;
    }

    :host([size='lg']) svg {
      width: 32px;
      height: 32px;
    }

    @keyframes rr-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .track {
      stroke: var(--color-border-elevated);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
    }

    .arc {
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
    }

    /* Visually hidden but accessible */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** Visual size of the spinner. */
  @property({ reflect: true }) size: SpinnerSize = 'md';

  /** Accessible label announced to screen readers. */
  @property() label = 'Loading';

  render() {
    // SVG viewBox is always 24×24; CSS scales via width/height.
    // Track: full circle (circumference ≈ 62.83)
    // Arc: 25% of circumference ≈ 15.7, gap ≈ 47.1; rotated -90° to start at top.
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle class="track" cx="12" cy="12" r="10" />
        <circle
          class="arc"
          cx="12"
          cy="12"
          r="10"
          stroke-dasharray="15.7 47.1"
          transform="rotate(-90 12 12)"
        />
      </svg>
      <span class="sr-only" role="status" aria-live="polite">${this.label}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-spinner': RrSpinner;
  }
}
