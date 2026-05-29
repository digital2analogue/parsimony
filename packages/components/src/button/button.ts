import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * A button with variant, size, loading, and disabled states.
 *
 * Renders a native `<button>` inside its shadow root for full
 * keyboard and form semantics. Uses `delegatesFocus` so the host
 * forwards focus to the inner button.
 *
 * @slot - Button label text
 * @slot prefix - Icon or element before the label
 * @slot suffix - Icon or element after the label
 * @fires click - Native click (suppressed when disabled or loading)
 * @csspart button - The inner <button> element
 */
@customElement('rr-button')
export class RrButton extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-tight);
      border: 1px solid var(--component-button-primary-border-default);
      border-radius: var(--radius-default);
      font: var(--font-label-strong-medium);
      cursor: pointer;
      padding: var(--spacing-tight) var(--spacing-element);
      background: var(--component-button-primary-background-default);
      color: var(--component-button-primary-foreground-default);
      transition:
        background-color var(--motion-duration-instant) var(--motion-easing-default),
        border-color var(--motion-duration-instant) var(--motion-easing-default);
      outline: none;
      text-decoration: none;
      white-space: nowrap;
    }

    button:hover {
      background: var(--component-button-primary-background-hover);
      border-color: var(--component-button-primary-border-hover);
    }

    button:active {
      background: var(--component-button-primary-background-active);
      border-color: var(--component-button-primary-border-active);
    }

    button:focus-visible {
      box-shadow: 0 0 0 2px var(--color-border-focus);
    }

    /* --- Size: small --- */
    :host([size='small']) button {
      font: var(--font-label-strong-small);
      padding: var(--spacing-micro) var(--spacing-tight);
    }

    /* --- Size: large --- */
    :host([size='large']) button {
      font: var(--font-label-strong-large);
      padding: var(--spacing-inline) var(--spacing-element);
    }

    /* --- Variant: secondary --- */
    :host([variant='secondary']) button {
      background: var(--component-button-secondary-background-default);
      color: var(--component-button-secondary-foreground-default);
      border-color: var(--component-button-secondary-border-default);
    }
    :host([variant='secondary']) button:hover {
      background: var(--component-button-secondary-background-hover);
      border-color: var(--component-button-secondary-border-hover);
    }

    /* --- Variant: ghost --- */
    :host([variant='ghost']) button {
      background: var(--component-button-ghost-background-default);
      color: var(--component-button-ghost-foreground-default);
      border-color: var(--component-button-ghost-border-default);
    }
    :host([variant='ghost']) button:hover {
      background: var(--component-button-ghost-background-hover);
      border-color: var(--component-button-ghost-border-hover);
    }

    /* --- Variant: danger --- */
    :host([variant='danger']) button {
      background: var(--component-button-danger-background-default);
      color: var(--component-button-danger-foreground-default);
      border-color: var(--component-button-danger-border-default);
    }
    :host([variant='danger']) button:hover {
      background: var(--component-button-danger-background-hover);
      border-color: var(--component-button-danger-border-hover);
    }

    /* --- Disabled --- */
    :host([disabled]) button {
      background: var(--color-background-disabled);
      color: var(--color-foreground-disabled);
      border-color: var(--color-border-disabled);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* --- Loading --- */
    :host([loading]) button {
      cursor: wait;
      pointer-events: none;
    }

    .spinner {
      display: inline-block;
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .label {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-tight);
    }

    :host([loading]) .label {
      visibility: hidden;
    }

    .loading-container {
      position: absolute;
    }

    .wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;

  @property({ reflect: true }) variant: ButtonVariant = 'primary';
  @property({ reflect: true }) size: ButtonSize = 'medium';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property() type: 'button' | 'submit' | 'reset' = 'button';
  @property({ attribute: 'aria-label' }) override ariaLabel: string | null = null;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  private _handleClick(e: Event) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  render() {
    return html`
      <button
        part="button"
        .type=${this.type}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-busy=${this.loading ? 'true' : nothing}
        aria-label=${this.ariaLabel || nothing}
        @click=${this._handleClick}
      >
        <span class="wrapper">
          ${this.loading
            ? html`<span class="loading-container"><span class="spinner" aria-hidden="true"></span></span>`
            : nothing}
          <span class="label">
            <slot name="prefix"></slot>
            <slot></slot>
            <slot name="suffix"></slot>
          </span>
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-button': RrButton;
  }
}
