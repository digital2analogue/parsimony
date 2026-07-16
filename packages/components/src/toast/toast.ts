import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ToastVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * A transient floating notification — announces, lingers briefly, and leaves.
 *
 * Where `rr-alert` is an in-flow tinted banner that belongs to the page,
 * the toast is a floating neutral surface with a variant accent rail.
 * Placement is the consumer's job (a fixed-position region in the app
 * corner); the component owns the surface, the status semantics, the
 * optional auto-dismiss timer (paused while hovered or focused), and the
 * dismiss affordance.
 *
 * @slot - Toast message content
 * @slot action - Optional action (e.g. an Undo rr-button variant="ghost")
 * @fires rr-toast-close - When the toast closes; detail.reason is 'dismiss' | 'timeout' | 'programmatic'
 * @csspart toast - The root toast surface
 * @csspart heading - The heading text element
 * @csspart content - The content slot wrapper
 * @csspart dismiss - The dismiss button
 */
@customElement('rr-toast')
export class RrToast extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-tight);
      padding: var(--spacing-inline) var(--spacing-element);
      border-radius: var(--radius-default);
      border: 1px solid var(--color-border-elevated);
      background: var(--color-background-alt);
      color: var(--color-foreground-default);
      box-shadow: var(--shadow-dialog), inset 3px 0 0 var(--color-foreground-alt);
    }

    :host([variant='success']) .toast {
      box-shadow: var(--shadow-dialog), inset 3px 0 0 var(--color-foreground-success);
    }
    :host([variant='warning']) .toast {
      box-shadow: var(--shadow-dialog), inset 3px 0 0 var(--color-foreground-warning);
    }
    :host([variant='danger']) .toast {
      box-shadow: var(--shadow-dialog), inset 3px 0 0 var(--color-foreground-danger);
    }
    :host([variant='info']) .toast {
      box-shadow: var(--shadow-dialog), inset 3px 0 0 var(--color-foreground-info);
    }

    .body {
      flex: 1;
      min-width: 0;
    }

    .heading {
      margin: 0 0 var(--spacing-micro) 0;
      font: var(--font-label-strong-medium);
    }

    :host([variant='success']) .heading { color: var(--color-foreground-success); }
    :host([variant='warning']) .heading { color: var(--color-foreground-warning); }
    :host([variant='danger']) .heading { color: var(--color-foreground-danger); }
    :host([variant='info']) .heading { color: var(--color-foreground-info); }

    .content {
      font: var(--font-body-medium);
    }

    .action {
      display: flex;
      align-items: center;
    }

    .dismiss {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--icon-size-default);
      height: var(--icon-size-default);
      border-radius: var(--radius-sm);
      color: var(--color-foreground-alt);
      transition: color var(--motion-duration-instant) var(--motion-easing-default);
    }

    .dismiss:hover {
      color: var(--color-foreground-default);
    }

    .dismiss:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 1px;
    }
  `;

  /** Status variant: neutral (default), success, warning, danger, info. Expressed via the accent rail and heading color. */
  @property({ reflect: true }) variant: ToastVariant = 'neutral';

  /** Optional bold heading rendered above the message, in the variant accent color. */
  @property() heading = '';

  /** Auto-dismiss after this many milliseconds. 0 (default) means persistent until dismissed. Timer pauses while hovered or focused. */
  @property({ type: Number }) duration = 0;

  /** Shows the dismiss button. On by default — a toast the user can't clear is a trap. */
  @property({ type: Boolean, reflect: true }) dismissible = true;

  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _deadline = 0;
  private _remaining = 0;

  connectedCallback() {
    super.connectedCallback();
    if (this.duration > 0) this._startTimer(this.duration);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer();
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('duration')) {
      this._clearTimer();
      if (this.duration > 0) this._startTimer(this.duration);
    }
  }

  /** Close the toast. Single source of truth — always dispatches `rr-toast-close`. */
  dismiss(reason: 'dismiss' | 'timeout' | 'programmatic' = 'programmatic') {
    this._clearTimer();
    if (this.hidden) return;
    this.hidden = true;
    this.dispatchEvent(
      new CustomEvent('rr-toast-close', {
        bubbles: true,
        composed: true,
        detail: { reason },
      })
    );
  }

  private _startTimer(ms: number) {
    this._deadline = Date.now() + ms;
    this._timer = setTimeout(() => this.dismiss('timeout'), ms);
  }

  private _clearTimer() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  // Pause the auto-dismiss while the user is reading or interacting —
  // a timer that steals the toast mid-hover fails WCAG 2.2.1's spirit.
  private _pause = () => {
    if (this._timer === null) return;
    this._remaining = Math.max(0, this._deadline - Date.now());
    this._clearTimer();
  };

  private _resume = () => {
    if (this._timer !== null || this.hidden || this.duration === 0) return;
    if (this._remaining > 0) this._startTimer(this._remaining);
  };

  render() {
    return html`
      <div
        part="toast"
        class="toast"
        role=${this.variant === 'danger' ? 'alert' : 'status'}
        aria-live=${this.variant === 'danger' ? 'assertive' : 'polite'}
        @mouseenter=${this._pause}
        @mouseleave=${this._resume}
        @focusin=${this._pause}
        @focusout=${this._resume}
      >
        <div class="body">
          ${this.heading
            ? html`<p class="heading" part="heading">${this.heading}</p>`
            : nothing}
          <div class="content" part="content"><slot></slot></div>
        </div>
        <div class="action"><slot name="action"></slot></div>
        ${this.dismissible
          ? html`<button class="dismiss" part="dismiss" aria-label="Dismiss" @click=${() => this.dismiss('dismiss')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-toast': RrToast;
  }
}
