import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

/**
 * An inline notification banner for success, warning, danger, and info messages.
 *
 * Use for form-level feedback, async status messages, and system notifications.
 * For field-level validation errors, use `<rr-input error-text="...">` instead.
 *
 * @slot - Alert body content
 * @slot icon - Optional icon in front of the title (use <rr-icon>)
 * @fires close - When the dismiss button is clicked (only fires when dismissible)
 * @csspart alert - The root alert element
 * @csspart title - The title text element
 * @csspart content - The content slot wrapper
 * @csspart dismiss - The dismiss button
 */
@customElement('rr-alert')
export class RrAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-tight);
      padding: var(--component-alert-padding-y) var(--component-alert-padding-x);
      border-radius: var(--component-alert-radius);
      border: 1px solid var(--component-alert-success-border);
      background: var(--component-alert-success-background);
      color: var(--component-alert-success-foreground);
    }

    /* Variant: warning */
    :host([variant='warning']) .alert {
      border-color: var(--component-alert-warning-border);
      background: var(--component-alert-warning-background);
      color: var(--component-alert-warning-foreground);
    }

    /* Variant: danger */
    :host([variant='danger']) .alert {
      border-color: var(--component-alert-danger-border);
      background: var(--component-alert-danger-background);
      color: var(--component-alert-danger-foreground);
    }

    /* Variant: info */
    :host([variant='info']) .alert {
      border-color: var(--component-alert-info-border);
      background: var(--component-alert-info-background);
      color: var(--component-alert-info-foreground);
    }

    .body {
      flex: 1;
      min-width: 0;
    }

    .title {
      font: var(--font-label-strong-medium);
      margin: 0 0 2px;
    }

    .content {
      font: var(--font-body-medium);
    }

    /* Icon slot */
    ::slotted([slot='icon']) {
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Dismiss button */
    .dismiss {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: currentColor;
      padding: 2px;
      border-radius: var(--radius-sm);
      opacity: 0.7;
      transition: opacity var(--motion-duration-instant) var(--motion-easing-default);
      margin-top: -1px;
      margin-right: -4px;
    }

    .dismiss:hover {
      opacity: 1;
    }

    .dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
      opacity: 1;
    }
  `;

  @property({ reflect: true }) variant: AlertVariant = 'success';
  @property() title = '';
  @property({ type: Boolean, reflect: true }) dismissible = false;

  @state() private _dismissed = false;

  private _dismiss() {
    this._dismissed = true;
    this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
    this.setAttribute('hidden', '');
  }

  /** Reshow the alert after it has been dismissed. */
  show() {
    this._dismissed = false;
    this.removeAttribute('hidden');
  }

  render() {
    if (this._dismissed) return nothing;

    return html`
      <div class="alert" part="alert" role="alert">
        <slot name="icon"></slot>
        <div class="body">
          ${this.title
            ? html`<p class="title" part="title">${this.title}</p>`
            : nothing}
          <div class="content" part="content"><slot></slot></div>
        </div>
        ${this.dismissible
          ? html`
            <button
              class="dismiss"
              part="dismiss"
              aria-label="Dismiss"
              @click=${this._dismiss}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-alert': RrAlert;
  }
}
