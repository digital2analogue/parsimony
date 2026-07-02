import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RrTab } from './tab.js';

/**
 * `<rr-tab-list>` — the accessible tab strip container.
 *
 * Wraps `<rr-tab>` elements and manages selection state, keyboard navigation
 * (left/right arrows, Home, End), and ARIA attributes.
 *
 * The tab panels are managed by the consuming app — listen for the `change`
 * event and show/hide content accordingly.
 *
 * @slot - Place `<rr-tab>` elements here
 *
 * @attr label - Accessible label for the tablist (required)
 * @attr value - Currently selected tab value
 *
 * @fires change - When a tab is selected; detail: { value: string }
 *
 * @example
 * <rr-tab-list label="View options" value="overview">
 *   <rr-tab value="overview">Overview</rr-tab>
 *   <rr-tab value="history">History</rr-tab>
 *   <rr-tab value="settings">Settings</rr-tab>
 * </rr-tab-list>
 */
@customElement('rr-tab-list')
export class RrTabList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .tablist {
      display: flex;
      align-items: flex-end;
      gap: 0;
      border-bottom: 1px solid var(--color-border-alt);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tablist::-webkit-scrollbar {
      display: none;
    }
  `;

  /** Accessible label for the tablist (required); sets aria-label on the role=tablist element. */
  @property() label = '';

  /** Currently selected tab value. Reflected; syncs the matching rr-tab child's selected state. */
  @property({ reflect: true }) value = '';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('rr-tab-select', this._onTabSelect as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
    // Sync on first connect in case value is preset
    this._syncTabs();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('rr-tab-select', this._onTabSelect as EventListener);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value')) {
      this._syncTabs();
    }
  }

  private _getTabs(): RrTab[] {
    return [...this.querySelectorAll('rr-tab')] as RrTab[];
  }

  private _syncTabs() {
    const tabs = this._getTabs();
    tabs.forEach(tab => {
      tab.selected = tab.value === this.value;
    });
  }

  private _onTabSelect = (e: CustomEvent<{ value: string }>) => {
    e.stopPropagation();
    this.value = e.detail.value;
    this._syncTabs();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const tabs = this._getTabs().filter(t => !t.disabled);
    if (tabs.length === 0) return;

    const current = tabs.findIndex(t => t.value === this.value);
    let next = -1;

    switch (e.key) {
      case 'ArrowRight':
        next = (current + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const target = tabs[next];
    this.value = target.value;
    this._syncTabs();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
    // Move focus to the newly selected tab
    (target as HTMLElement).focus();
  };

  render() {
    return html`
      <div
        class="tablist"
        role="tablist"
        aria-label="${this.label}"
      >
        <slot @slotchange="${this._syncTabs}"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-tab-list': RrTabList;
  }
}
