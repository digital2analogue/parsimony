import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

/**
 * `<rr-dialog>` — modal dialog using the native `<dialog>` element.
 *
 * Leverages native focus trap, Escape-to-close, and `::backdrop`.
 * Programmatic control via `show()` / `close()` methods, or bind the
 * `open` property/attribute.
 *
 * @slot         — Dialog body content
 * @slot footer  — Action buttons (displayed in a right-aligned footer row)
 *
 * @attr heading          - Dialog title text
 * @attr {Boolean} open   - Whether the dialog is open
 * @attr {Boolean} close-on-backdrop - Close when backdrop is clicked (default: true)
 *
 * @fires rr-dialog-close - Fired whenever the dialog closes (Escape, close button, or programmatic)
 *
 * @example
 * <rr-dialog heading="Confirm action">
 *   Are you sure you want to delete this item?
 *   <rr-button slot="footer" variant="danger" @click=${() => dialog.close()}>Delete</rr-button>
 *   <rr-button slot="footer" variant="secondary" @click=${() => dialog.close()}>Cancel</rr-button>
 * </rr-dialog>
 */
@customElement('rr-dialog')
export class RrDialog extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      padding: 0;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-xl);
      background: var(--color-background-alt);
      color: var(--color-foreground-default);
      max-width: min(90vw, 560px);
      width: 100%;
      box-shadow: var(--shadow-dialog);
      /* Remove UA outline; focus is managed by the browser's dialog role */
      outline: none;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
    }

    .dialog-inner {
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-tight);
      padding: var(--spacing-element) var(--spacing-component);
      border-bottom: 1px solid var(--color-border-default);
    }

    .heading {
      font: var(--font-title-small);
      letter-spacing: var(--letter-spacing-title);
      color: var(--color-foreground-default);
      margin: 0;
    }

    /* ── Close button ── */
    .close-btn {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-default);
      color: var(--color-foreground-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition:
        color var(--motion-duration-instant) var(--motion-easing-default),
        background var(--motion-duration-instant) var(--motion-easing-default);
    }

    .close-btn:hover {
      color: var(--color-foreground-default);
      background: var(--color-background-alt);
    }

    .close-btn:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

    /* ── Body ── */
    .body {
      padding: var(--spacing-component);
      font: var(--font-body-large);
      color: var(--color-foreground-alt);
      overflow-y: auto;
    }

    /* ── Footer ── */
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-tight);
      padding: var(--spacing-inline) var(--spacing-component);
      border-top: 1px solid var(--color-border-default);
    }

    /* Hide footer when no slotted content */
    .footer:not(:has(*)) {
      display: none;
    }
  `;

  /** Dialog heading text. */
  @property() heading = '';

  /** Whether the dialog is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Whether clicking the backdrop closes the dialog. */
  @property({ type: Boolean, attribute: 'close-on-backdrop' }) closeOnBackdrop = true;

  @query('dialog') private _dialog!: HTMLDialogElement;

  /** Open the dialog as a modal. */
  show() {
    this.open = true;
    // showModal() is unavailable in test environments (happy-dom); guard gracefully.
    if (this._dialog && typeof this._dialog.showModal === 'function' && !this._dialog.open) {
      this._dialog.showModal();
    }
  }

  /**
   * Close the dialog. Single source of truth — always dispatches `rr-dialog-close`.
   * Also called internally when Escape is pressed (via native `close` event).
   */
  close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('rr-dialog-close', { bubbles: true, composed: true }));
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (!changed.has('open')) return;
    if (this.open) {
      if (this._dialog && typeof this._dialog.showModal === 'function' && !this._dialog.open) {
        this._dialog.showModal();
      }
    } else {
      if (this._dialog && typeof this._dialog.close === 'function' && this._dialog.open) {
        this._dialog.close();
      }
    }
  }

  private _onBackdropClick(e: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    const rect = this._dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    ) {
      this.close();
    }
  }

  private _onNativeClose() {
    // Fires when Escape is pressed — delegate to close() for consistent behavior.
    this.close();
  }

  render() {
    return html`
      <dialog
        @click="${this._onBackdropClick}"
        @close="${this._onNativeClose}"
      >
        <div class="dialog-inner">
          <div class="header">
            <h2 class="heading">${this.heading}</h2>
            <button
              class="close-btn"
              @click="${() => this.close()}"
              aria-label="Close dialog"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <div class="body">
            <slot></slot>
          </div>

          <div class="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-dialog': RrDialog;
  }
}
