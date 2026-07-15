import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<rr-menu-item>` — a single action inside `<rr-menu>`.
 *
 * The host itself carries `role="menuitem"` and `tabindex="-1"` so the
 * flattened tree reads as menu → menuitem; focus and roving order are
 * managed by the parent `rr-menu`.
 *
 * @slot - Item label (and optional leading icon)
 *
 * @fires rr-menu-item-select - Bubbles (composed) to rr-menu when the item
 *   is activated; detail.value is this item's value. Not fired when disabled.
 *
 * @csspart item - The item row
 */
@customElement('rr-menu-item')
export class RrMenuItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      cursor: pointer;
      outline: none;
      border-radius: var(--radius-sm);
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--spacing-tight);
      padding: var(--spacing-tight) var(--spacing-inline);
      border-radius: var(--radius-sm);
      font: var(--font-label-medium);
      color: var(--component-menu-item-foreground);
      white-space: nowrap;
      transition: background var(--motion-duration-instant) var(--motion-easing-default);
    }

    :host(:hover:not([disabled])) .item,
    :host(:focus) .item {
      background: var(--component-menu-item-hover-background);
    }

    /* Items only receive focus programmatically during keyboard nav — an
       inset ring on the focused row keeps it visible inside the overlay. */
    :host(:focus) .item {
      box-shadow: inset 0 0 0 2px var(--color-border-focus);
    }

    :host([danger]) .item {
      color: var(--component-menu-item-danger-foreground);
    }

    :host([danger]:hover:not([disabled])) .item,
    :host([danger]:focus) .item {
      background: var(--component-menu-item-danger-hover-background);
    }

    :host([disabled]) {
      cursor: default;
    }

    :host([disabled]) .item {
      color: var(--component-menu-item-disabled-foreground);
      background: none;
    }
  `;

  /** Value reported in rr-menu's rr-menu-select event when this item is chosen. */
  @property() value = '';

  /** Marks a destructive action — danger foreground, red-tinted hover. */
  @property({ type: Boolean, reflect: true }) danger = false;

  /** Disables the item — skipped by keyboard navigation, click is inert. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._onActivate);
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onActivate);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('disabled')) {
      if (this.disabled) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
  }

  private _onActivate = () => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('rr-menu-item-select', {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      })
    );
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._onActivate();
    }
  };

  render() {
    return html`<div class="item" part="item"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-menu-item': RrMenuItem;
  }
}
