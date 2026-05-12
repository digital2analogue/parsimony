import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

/**
 * A form-associated text input with label, helper text, and error state.
 *
 * Uses `ElementInternals` for native form participation and
 * `delegatesFocus` so the host forwards focus to the inner `<input>`.
 *
 * @slot label - Optional override for the label text
 * @fires input - When the input value changes (mirrors native input event)
 * @fires change - When the input value is committed (mirrors native change event)
 * @csspart label - The label element
 * @csspart input - The inner input element
 * @csspart helper - The helper text container
 * @csspart error - The error message container
 */
@customElement('rr-input')
export class RrInput extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: block;
    }

    label {
      display: block;
      font: var(--font-label-medium);
      color: var(--component-input-foreground-label);
      margin-bottom: 4px;
    }

    .required {
      color: var(--component-input-foreground-label-required);
      margin-left: 2px;
    }

    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font: var(--font-body-large);
      color: var(--component-input-foreground-value);
      background: var(--component-input-background-default);
      border: 1px solid var(--component-input-border-default);
      border-radius: var(--component-input-radius);
      padding: var(--component-input-padding-y) var(--component-input-padding-x);
      outline: none;
      transition: border-color 120ms ease;
    }

    input::placeholder {
      color: var(--component-input-foreground-placeholder);
    }

    input:hover {
      border-color: var(--component-input-border-hover);
    }

    input:focus {
      border-color: var(--component-input-border-focus);
      box-shadow: 0 0 0 1px var(--component-input-border-focus);
    }

    :host([disabled]) input {
      background: var(--component-input-background-disabled);
      border-color: var(--component-input-border-disabled);
      color: var(--component-input-foreground-disabled);
      cursor: not-allowed;
    }

    :host([disabled]) label {
      color: var(--component-input-foreground-disabled);
    }

    .helper {
      font: var(--font-label-small);
      color: var(--component-input-foreground-helper);
      margin-top: 4px;
    }

    .error {
      font: var(--font-label-small);
      color: var(--component-input-foreground-error);
      margin-top: 4px;
    }

    :host([data-invalid]) input {
      border-color: var(--component-input-border-error);
    }

    :host([data-invalid]) input:focus {
      box-shadow: 0 0 0 1px var(--component-input-border-error);
    }
  `;

  @property() type = 'text';
  @property() name = '';
  @property() value = '';
  @property() placeholder = '';
  @property() label = '';
  @property({ attribute: 'helper-text' }) helperText = '';
  @property({ attribute: 'error-text' }) errorText = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: 'autocomplete' }) autoComplete = '';

  @query('input') private _input!: HTMLInputElement;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  private get _isInvalid(): boolean {
    return this.errorText.length > 0;
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      this._internals.setFormValue?.(this.value);
    }
    if (changed.has('errorText')) {
      if (this._isInvalid) {
        this.setAttribute('data-invalid', '');
        this._internals.setValidity?.(
          { customError: true },
          this.errorText,
          this._input
        );
      } else {
        this.removeAttribute('data-invalid');
        this._internals.setValidity?.({});
      }
    }
  }

  private _onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._internals.setFormValue?.(this.value);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._internals.setFormValue?.(this.value);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  render() {
    const hasLabel = this.label.length > 0;
    const describedBy = this._isInvalid ? 'error' : this.helperText ? 'helper' : undefined;

    return html`
      ${hasLabel
        ? html`<label part="label" for="input">
            <slot name="label">${this.label}</slot>${this.required
              ? html`<span class="required" aria-hidden="true">*</span>`
              : nothing}
          </label>`
        : nothing}
      <input
        part="input"
        id="input"
        .type=${this.type}
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        .name=${this.name}
        .disabled=${this.disabled}
        .required=${this.required}
        autocomplete=${this.autoComplete || nothing}
        aria-required=${this.required ? 'true' : nothing}
        aria-invalid=${this._isInvalid ? 'true' : nothing}
        aria-errormessage=${this._isInvalid ? 'error' : nothing}
        aria-describedby=${describedBy || nothing}
        @input=${this._onInput}
        @change=${this._onChange}
      />
      ${this.helperText && !this._isInvalid
        ? html`<div id="helper" part="helper" class="helper">${this.helperText}</div>`
        : nothing}
      ${this._isInvalid
        ? html`<div id="error" part="error" class="error" role="alert">${this.errorText}</div>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-input': RrInput;
  }
}
