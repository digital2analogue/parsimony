import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * An individual radio button. Must be used inside `<rr-radio-group>`.
 *
 * The group manages the name, form value, and selection state — individual
 * radios only hold their own `value` prop and visual `checked` state.
 *
 * @slot - Label text
 * @fires rr-radio-change - Bubbles to the parent rr-radio-group when selected
 * @csspart circle - The visual radio circle element
 * @csspart label - The label text element
 */
@customElement('rr-radio')
export class RrRadio extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: flex-start;
      gap: var(--spacing-tight);
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) {
      cursor: not-allowed;
    }

    .circle-wrap {
      position: relative;
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-top: 2px;
    }

    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      margin: 0;
      cursor: inherit;
      z-index: 1;
    }

    .circle {
      position: absolute;
      inset: 0;
      border: 1px solid var(--component-radio-border-default);
      border-radius: 50%;
      background: var(--component-radio-background-unchecked);
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color var(--motion-duration-instant) var(--motion-easing-default),
        background-color var(--motion-duration-instant) var(--motion-easing-default);
    }

    :host(:not([disabled]):not([checked])) .circle-wrap:hover .circle {
      border-color: var(--component-radio-border-hover);
    }

    :host([checked]) .circle {
      border-color: var(--component-radio-border-checked);
    }

    :host([disabled]) .circle {
      background: var(--component-radio-background-disabled);
      border-color: var(--component-radio-border-disabled);
    }

    /* Inner dot */
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--component-radio-background-checked);
      transform: scale(0);
      transition: transform var(--motion-duration-instant) var(--motion-easing-enter);
    }

    :host([checked]) .dot {
      transform: scale(1);
    }

    :host([disabled]) .dot {
      background: var(--component-radio-foreground-disabled);
    }

    /* Focus ring */
    input:focus-visible ~ .circle {
      outline: 2px solid var(--component-radio-border-focus);
      outline-offset: 2px;
    }

    label {
      font: var(--font-label-medium);
      color: var(--component-radio-foreground-label);
      cursor: inherit;
      line-height: 1.4;
    }

    :host([disabled]) label {
      color: var(--component-radio-foreground-disabled);
    }
  `;

  @property({ reflect: true }) value = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _onChange() {
    if (this.disabled || this.checked) return;
    this.dispatchEvent(
      new CustomEvent('rr-radio-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      })
    );
  }

  render() {
    return html`
      <div class="circle-wrap">
        <input
          type="radio"
          id="radio"
          .value=${this.value}
          .checked=${this.checked}
          .disabled=${this.disabled}
          aria-checked=${this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <div class="circle" part="circle">
          <div class="dot"></div>
        </div>
      </div>
      <label part="label" for="radio"><slot></slot></label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-radio': RrRadio;
  }
}
