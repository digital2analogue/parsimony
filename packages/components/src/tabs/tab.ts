import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<rr-tab>` — a single tab button, used inside `<rr-tab-list>`.
 *
 * Selection state is managed by the parent `<rr-tab-list>`. Do not set
 * `selected` directly — use `rr-tab-list[value]` to control which tab is active.
 *
 * @slot - Tab label text (and optional icon)
 *
 * @attr value    - Unique identifier for this tab (required)
 * @attr selected - Set by parent; marks the active tab
 * @attr disabled - Prevents selection
 *
 * @fires rr-tab-select - Bubbles up to rr-tab-list when clicked
 */
@customElement('rr-tab')
export class RrTab extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static styles = css`
    :host {
      display: inline-flex;
    }

    button {
      all: unset;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-tight);
      padding: var(--spacing-tight) var(--spacing-inline);
      font: var(--font-label-medium);
      color: var(--color-foreground-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition:
        color var(--motion-duration-instant) var(--motion-easing-default),
        border-color var(--motion-duration-instant) var(--motion-easing-default);
      white-space: nowrap;
      position: relative;
    }

    button:hover {
      color: var(--color-foreground-alt);
    }

    button:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    :host([selected]) button {
      color: var(--color-foreground-action);
      border-bottom-color: var(--color-background-action);
      font: var(--font-label-strong-medium);
    }

    :host([disabled]) button {
      color: var(--color-foreground-disabled);
      cursor: not-allowed;
      pointer-events: none;
    }
  `;

  /** Identifier value — must match what rr-tab-list uses for selection. */
  @property({ reflect: true }) value = '';

  /** True when this tab is the active selection. Managed by rr-tab-list. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** Prevents tab selection. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _handleClick() {
    if (this.disabled || this.selected) return;
    this.dispatchEvent(new CustomEvent('rr-tab-select', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
  }

  render() {
    return html`
      <button
        role="tab"
        aria-selected="${this.selected ? 'true' : 'false'}"
        tabindex="${this.selected ? 0 : -1}"
        ?disabled="${this.disabled}"
        @click="${this._handleClick}"
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-tab': RrTab;
  }
}
