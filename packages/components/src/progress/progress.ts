import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<rr-progress>` — horizontal progress bar.
 *
 * Supports determinate (0–max) and indeterminate (animated) modes.
 * Fully accessible via native `role="progressbar"` ARIA attributes.
 *
 * @attr {Number} value      - Current value (0–max). Ignored when indeterminate.
 * @attr {Number} max        - Maximum value (default: 100)
 * @attr indeterminate       - Animate as an indeterminate loading state
 * @attr label               - Accessible label (required if no visible label nearby)
 *
 * @example
 * <rr-progress value="60" label="Upload progress"></rr-progress>
 * <rr-progress indeterminate label="Loading…"></rr-progress>
 */
@customElement('rr-progress')
export class RrProgress extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .track {
      width: 100%;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--color-background-disabled);
      overflow: hidden;
      position: relative;
    }

    .fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: var(--color-background-action);
      transition: width var(--motion-duration-standard) var(--motion-easing-move);
      will-change: width;
    }

    :host([indeterminate]) .fill {
      width: 30%;
      animation: rr-progress-slide 1.4s ease-in-out infinite;
    }

    @keyframes rr-progress-slide {
      0%   { transform: translateX(-100%); }
      50%  { transform: translateX(300%); }
      100% { transform: translateX(300%); }
    }
  `;

  /** Current progress value. */
  @property({ type: Number }) value = 0;

  /** Maximum value. */
  @property({ type: Number }) max = 100;

  /** Show an animated indeterminate state instead of a fixed value. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  /** Accessible label for the progress bar. */
  @property() label = '';

  private get _pct(): number {
    if (this.indeterminate) return 30;
    return Math.min(Math.max((this.value / this.max) * 100, 0), 100);
  }

  render() {
    return html`
      <div
        class="track"
        role="progressbar"
        aria-valuenow="${this.indeterminate ? nothing : this.value}"
        aria-valuemin="0"
        aria-valuemax="${this.max}"
        aria-label="${this.label || nothing}"
        aria-busy="${this.indeterminate ? 'true' : nothing}"
      >
        <div
          class="fill"
          style="${this.indeterminate ? '' : `width: ${this._pct}%`}"
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-progress': RrProgress;
  }
}
