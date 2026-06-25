import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A form-associated checkbox with checked, indeterminate, and disabled states.
 *
 * The visual control is rendered in shadow DOM; the hidden native
 * `<input type="checkbox">` provides focus, keyboard, and label-click semantics.
 * `ElementInternals` handles form participation.
 *
 * Usage:
 *   <rr-checkbox name="agree" label="I agree to the terms" checked></rr-checkbox>
 *   <rr-checkbox name="notify">Send me notifications</rr-checkbox>
 *
 * @slot - Label text (alternative to the `label` property)
 * @fires change - When the checked state changes
 * @csspart box - The visual checkbox square
 * @csspart label - The label text element
 */
@customElement('rr-checkbox')
export class RrCheckbox extends LitElement {
  static formAssociated = true;

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

    /* Wrap that positions the hidden input over the visual box */
    .box-wrap {
      position: relative;
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-top: 2px; /* align with cap-height of label text */
    }

    /* Visually hidden native input — physically covers the box-wrap area
       so clicks on the visual box hit the real input for focus + activation */
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

    .box {
      position: absolute;
      inset: 0;
      border: 1px solid var(--component-checkbox-border-default);
      border-radius: var(--component-checkbox-radius);
      background: var(--component-checkbox-background-unchecked);
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color var(--motion-duration-instant) var(--motion-easing-default),
        background-color var(--motion-duration-instant) var(--motion-easing-default);
    }

    :host(:not([disabled]):not([checked]):not([indeterminate])) .box-wrap:hover .box {
      border-color: var(--component-checkbox-border-hover);
    }

    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--component-checkbox-background-checked);
      border-color: var(--component-checkbox-border-checked);
    }

    :host([disabled]) .box {
      background: var(--component-checkbox-background-disabled);
      border-color: var(--component-checkbox-border-disabled);
    }

    /* Focus ring on the visual box driven by the hidden input's focus state */
    input:focus-visible ~ .box {
      outline: 2px solid var(--component-checkbox-border-focus);
      outline-offset: 2px;
    }

    .check,
    .dash {
      display: none;
      color: var(--component-checkbox-foreground-checkmark);
    }

    :host([checked]) .check {
      display: block;
    }

    :host([indeterminate]) .dash {
      display: block;
    }

    label {
      font: var(--font-label-medium);
      color: var(--component-checkbox-foreground-label);
      cursor: inherit;
      line-height: 1.4;
    }

    :host([disabled]) label {
      color: var(--component-checkbox-foreground-disabled);
    }
  `;

  /** Whether the checkbox is checked. */
  @property({ type: Boolean, reflect: true }) checked = false;
  /** Mixed state; cleared when the user toggles the checkbox. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** Disables interaction and form participation. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Form value submitted when checked. */
  @property() value = 'on';
  /** Form field name. */
  @property() name = '';
  /** Label text; falls back to slotted content when empty. */
  @property() label = '';

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override updated() {
    this._internals.setFormValue?.(this.checked ? this.value : null);
  }

  private _onChange() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.indeterminate = false;
    this._internals.setFormValue?.(this.checked ? this.value : null);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="box-wrap">
        <input
          type="checkbox"
          id="cb"
          .name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          .disabled=${this.disabled}
          aria-checked=${this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <div class="box" part="box">
          <svg class="check" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 5L4.2 7.5L8.5 3" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="dash" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2.5 5H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <label part="label" for="cb">
        ${this.label ? this.label : html`<slot></slot>`}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-checkbox': RrCheckbox;
  }
}
