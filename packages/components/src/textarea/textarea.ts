import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

/**
 * A form-associated multi-line text area with label, helper text, and error state.
 *
 * Mirrors `<rr-input>` in API and token usage. Uses `ElementInternals` for
 * native form participation and `delegatesFocus` so the host forwards focus
 * to the inner `<textarea>`.
 *
 * @slot label - Optional override for the label text
 * @fires input - When the value changes (mirrors native input event)
 * @fires change - When the value is committed (mirrors native change event)
 * @csspart label - The label element
 * @csspart textarea - The inner textarea element
 * @csspart helper - The helper text container
 * @csspart error - The error message container
 */
@customElement('rr-textarea')
export class RrTextarea extends LitElement {
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

    textarea {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font: var(--font-body-large);
      font-family: inherit;
      color: var(--component-input-foreground-value);
      background: var(--component-input-background-default);
      border: 1px solid var(--component-input-border-default);
      border-radius: var(--component-input-radius);
      padding: var(--component-input-padding-y) var(--component-input-padding-x);
      outline: none;
      resize: vertical;
      min-height: 80px;
      transition: border-color var(--motion-duration-instant) var(--motion-easing-default);
    }

    textarea::placeholder {
      color: var(--component-input-foreground-placeholder);
    }

    textarea:hover {
      border-color: var(--component-input-border-hover);
    }

    textarea:focus {
      border-color: var(--component-input-border-focus);
      box-shadow: 0 0 0 1px var(--component-input-border-focus);
    }

    :host([disabled]) textarea {
      background: var(--component-input-background-disabled);
      border-color: var(--component-input-border-disabled);
      color: var(--component-input-foreground-disabled);
      cursor: not-allowed;
      resize: none;
    }

    :host([disabled]) label {
      color: var(--component-input-foreground-disabled);
    }

    :host([data-invalid]) textarea {
      border-color: var(--component-input-border-error);
    }

    :host([data-invalid]) textarea:focus {
      box-shadow: 0 0 0 1px var(--component-input-border-error);
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
  `;

  /** Form field name submitted with the form value. */
  @property() name = '';
  /** Current text value; set as the form value via ElementInternals. */
  @property() value = '';
  /** Placeholder text shown when empty. */
  @property() placeholder = '';
  /** Label text; renders a label element when non-empty. */
  @property() label = '';
  /** Helper text shown below the field (attribute: helper-text). Hidden when an error is present. */
  @property({ attribute: 'helper-text' }) helperText = '';
  /** Error message (attribute: error-text); when set, marks the field invalid and replaces the helper text. */
  @property({ attribute: 'error-text' }) errorText = '';
  /** Number of visible text rows on the inner textarea. */
  @property({ type: Number }) rows = 3;
  /** Marks the field required; shows a required indicator. Reflected. */
  @property({ type: Boolean, reflect: true }) required = false;
  /** Disables the field. Reflected. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('textarea') private _textarea!: HTMLTextAreaElement;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  private get _isInvalid(): boolean {
    return this.errorText.length > 0;
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      this._internals.setFormValue?.(this.value);
    }
    if (changed.has('errorText')) {
      if (this._isInvalid) {
        this.setAttribute('data-invalid', '');
        this._internals.setValidity?.(
          { customError: true },
          this.errorText,
          this._textarea
        );
      } else {
        this.removeAttribute('data-invalid');
        this._internals.setValidity?.({});
      }
    }
  }

  private _onInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this.value = ta.value;
    this._internals.setFormValue?.(this.value);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _onChange(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this.value = ta.value;
    this._internals.setFormValue?.(this.value);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  render() {
    const hasLabel = this.label.length > 0;
    const describedBy = this._isInvalid ? 'error' : this.helperText ? 'helper' : undefined;

    return html`
      ${hasLabel
        ? html`<label part="label" for="textarea">
            <slot name="label">${this.label}</slot>${this.required
              ? html`<span class="required" aria-hidden="true">*</span>`
              : nothing}
          </label>`
        : nothing}
      <textarea
        part="textarea"
        id="textarea"
        .value=${live(this.value)}
        .placeholder=${this.placeholder}
        .name=${this.name}
        .disabled=${this.disabled}
        .required=${this.required}
        .rows=${this.rows}
        aria-required=${this.required ? 'true' : nothing}
        aria-invalid=${this._isInvalid ? 'true' : nothing}
        aria-errormessage=${this._isInvalid ? 'error' : nothing}
        aria-describedby=${describedBy || nothing}
        @input=${this._onInput}
        @change=${this._onChange}
      ></textarea>
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
    'rr-textarea': RrTextarea;
  }
}
