import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RrMenuItem } from './menu-item.js';

export type MenuPlacement = 'bottom-start' | 'bottom-end';

/**
 * `<rr-menu>` — an accessible dropdown action menu (WAI-ARIA menu-button pattern).
 *
 * Slot any control into the `trigger` slot and `<rr-menu-item>` elements into
 * the default slot. The component owns the open state, trigger ARIA wiring
 * (aria-haspopup / aria-expanded), outside-click and Escape dismissal, and
 * full keyboard navigation: ArrowDown/ArrowUp move through enabled items
 * (wrapping), Home/End jump, Enter/Space activate, Escape closes and returns
 * focus to the trigger. Opening with ArrowDown focuses the first item;
 * ArrowUp opens focusing the last.
 *
 * The popup positions itself below the trigger with CSS (no portal) — for
 * use inside `overflow: hidden` ancestors, place the menu outside the
 * clipping container.
 *
 * @slot trigger - The control that opens the menu (e.g. an rr-button)
 * @slot - Place `<rr-menu-item>` elements here
 *
 * @fires rr-menu-select - When an item is chosen; detail: { value: string }
 * @fires rr-menu-toggle - When the menu opens or closes; detail: { open: boolean }
 *
 * @csspart menu - The floating menu surface
 *
 * @example
 * <rr-menu label="Row actions">
 *   <rr-button slot="trigger" variant="ghost">Actions</rr-button>
 *   <rr-menu-item value="edit">Edit rule</rr-menu-item>
 *   <rr-menu-item value="duplicate">Duplicate</rr-menu-item>
 *   <rr-menu-item value="delete" danger>Delete rule</rr-menu-item>
 * </rr-menu>
 */
@customElement('rr-menu')
export class RrMenu extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .menu {
      position: absolute;
      top: calc(100% + var(--spacing-micro));
      left: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      min-width: 180px;
      padding: var(--spacing-micro);
      background: var(--component-menu-background);
      border: 1px solid var(--component-menu-border);
      border-radius: var(--component-menu-radius);
      box-shadow: var(--shadow-overlay);
    }

    .menu[hidden] {
      display: none;
    }

    :host([placement='bottom-end']) .menu {
      left: auto;
      right: 0;
    }
  `;

  /** Whether the menu is open. Usually driven by the component itself; settable for controlled usage. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Which edge of the trigger the menu aligns to: bottom-start (default) or bottom-end. */
  @property({ reflect: true }) placement: MenuPlacement = 'bottom-start';

  /** Accessible label for the menu popup (required); sets aria-label on the role=menu element. */
  @property() label = '';

  private _trigger: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('rr-menu-item-select', this._onItemSelect as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('rr-menu-item-select', this._onItemSelect as EventListener);
    this.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onOutsidePointerDown);
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('open')) {
      this._trigger?.setAttribute('aria-expanded', String(this.open));
      if (this.open) {
        document.addEventListener('pointerdown', this._onOutsidePointerDown);
      } else {
        document.removeEventListener('pointerdown', this._onOutsidePointerDown);
      }
      // Fire only on real transitions, not the initial false → false render
      if (changed.get('open') !== undefined || this.open) {
        this.dispatchEvent(
          new CustomEvent('rr-menu-toggle', {
            bubbles: true,
            composed: true,
            detail: { open: this.open },
          })
        );
      }
    }
  }

  /** Open the menu and optionally move focus to the first or last enabled item. */
  show(focusItem: 'first' | 'last' | 'none' = 'none') {
    this.open = true;
    if (focusItem === 'none') return;
    requestAnimationFrame(() => {
      const items = this._items();
      const target = focusItem === 'first' ? items[0] : items[items.length - 1];
      target?.focus();
    });
  }

  /** Close the menu and return focus to the trigger. */
  hide(refocusTrigger = true) {
    if (!this.open) return;
    this.open = false;
    if (refocusTrigger) this._trigger?.focus();
  }

  private _items(): RrMenuItem[] {
    return ([...this.querySelectorAll('rr-menu-item')] as RrMenuItem[]).filter(
      (i) => !i.disabled
    );
  }

  private _onTriggerSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const el = slot.assignedElements()[0] as HTMLElement | undefined;
    if (this._trigger && this._trigger !== el) {
      this._trigger.removeEventListener('click', this._onTriggerClick);
    }
    this._trigger = el ?? null;
    if (this._trigger) {
      this._trigger.setAttribute('aria-haspopup', 'menu');
      this._trigger.setAttribute('aria-expanded', String(this.open));
      this._trigger.addEventListener('click', this._onTriggerClick);
    }
  };

  private _onTriggerClick = () => {
    if (this.open) this.hide(false);
    else this.show('none');
  };

  private _onOutsidePointerDown = (e: Event) => {
    if (!e.composedPath().includes(this)) this.hide(false);
  };

  private _onItemSelect = (e: CustomEvent<{ value: string }>) => {
    e.stopPropagation();
    this.hide();
    this.dispatchEvent(
      new CustomEvent('rr-menu-select', {
        bubbles: true,
        composed: true,
        detail: { value: e.detail.value },
      })
    );
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const fromTrigger =
      this._trigger !== null && e.composedPath().includes(this._trigger);

    if (!this.open) {
      // ArrowDown/ArrowUp on the trigger open the menu and focus an end item
      if (fromTrigger && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        this.show(e.key === 'ArrowDown' ? 'first' : 'last');
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this.hide();
      return;
    }
    if (e.key === 'Tab') {
      // Menus close on Tab — focus proceeds naturally from the trigger
      this.hide(false);
      return;
    }

    const items = this._items();
    if (items.length === 0) return;
    const active = (this.getRootNode() as Document | ShadowRoot).activeElement;
    const current = items.findIndex((i) => i === active);
    let next = -1;

    switch (e.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    items[next].focus();
  };

  render() {
    return html`
      <slot name="trigger" @slotchange=${this._onTriggerSlotChange}></slot>
      <div
        class="menu"
        part="menu"
        role="menu"
        aria-label=${this.label}
        ?hidden=${!this.open}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-menu': RrMenu;
  }
}
