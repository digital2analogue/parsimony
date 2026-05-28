import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A form-associated toggle switch for binary on/off settings.
 *
 * The pill-shaped track and sliding knob are rendered in shadow DOM;
 * the hidden native `<input type="checkbox">` provides focus, keyboard,
 * and label-click semantics. `ElementInternals` handles form participation.
 *
 * Usage:
 *   <rr-toggle name="darkMode" label="Dark mode" checked></rr-toggle>
 *   <rr-toggle name="notify">Email notifications</rr-toggle>
 *
 * @slot - Label text (alternative to the `label` property)
 * @fires change - When the toggle state changes
 * @csspart track - The pill-shaped track element
 * @csspart knob - The sliding knob element
 * @csspart label - The label text element
 */
@customElement('rr-toggle')
export class RrToggle extends LitElement {
  static formAssociated = true;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-tight);
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) {
      cursor: not-allowed;
    }

    /* Wrap positions the hidden input over the visible track */
    .track-wrap {
      position: relative;
      flex-shrink: 0;
      width: 36px;
      height: 20px;
    }

    /* Visually hidden native input — covers the track area for click/focus */
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

    .track {
      position: absolute;
      inset: 0;
      border-radius: var(--radius-full);
      border: 1px solid var(--component-toggle-track-border-off);
      background: var(--component-toggle-track-background-off);
      transition:
        background-color var(--motion-duration-instant) var(--motion-easing-default),
        border-color var(--motion-duration-instant) var(--motion-easing-default);
      display: flex;
      align-items: center;
      padding: 0 3px;
    }

    :host([checked]) .track {
      background: var(--component-toggle-track-background-on);
      border-color: var(--component-toggle-track-border-on);
    }

    :host([disabled]) .track {
      background: var(--component-toggle-track-background-disabled);
      border-color: var(--component-toggle-track-border-disabled);
    }

    .knob {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--component-toggle-knob-background-off);
      transition:
        transform var(--motion-duration-instant) var(--motion-easing-move),
        background-color var(--motion-duration-instant) var(--motion-easing-default);
      flex-shrink: 0;
    }

    :host([checked]) .knob {
      transform: translateX(16px);
      background: var(--component-toggle-knob-background-on);
    }

    :host([disabled]) .knob {
      background: var(--component-toggle-knob-background-disabled);
    }

    /* Focus ring on the track driven by the hidden input's focus state */
    input:focus-visible ~ .track {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

    label {
      font: var(--font-label-medium);
      color: var(--component-toggle-foreground-label);
      cursor: inherit;
      line-height: 1.4;
    }

    :host([disabled]) label {
      color: var(--component-toggle-foreground-disabled);
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() value = 'on';
  @property() name = '';
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
    this._internals.setFormValue?.(this.checked ? this.value : null);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="track-wrap">
        <input
          type="checkbox"
          id="toggle"
          role="switch"
          .name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          .disabled=${this.disabled}
          aria-checked=${this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <div class="track" part="track">
          <div class="knob" part="knob"></div>
        </div>
      </div>
      <label part="label" for="toggle">
        ${this.label ? this.label : html`<slot></slot>`}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-toggle': RrToggle;
  }
}
