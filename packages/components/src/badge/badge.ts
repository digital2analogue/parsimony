import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent-green'
  | 'accent-blue'
  | 'accent-violet'
  | 'accent-amber';

/**
 * A status badge / chip component.
 *
 * Uses component-level design tokens for all visual properties.
 * Brand theming cascades automatically via CSS custom properties on `:root`.
 *
 * @slot - Badge label text
 * @cssprop --component-badge-{variant}-background
 * @cssprop --component-badge-{variant}-foreground
 * @cssprop --component-badge-{variant}-border
 * @cssprop --component-badge-radius
 * @cssprop --component-badge-padding-x
 * @cssprop --component-badge-padding-y
 */
@customElement('rr-badge')
export class RrBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      border-radius: var(--component-badge-radius);
      padding: var(--component-badge-padding-y) var(--component-badge-padding-x);
      font: var(--font-label-small);
      border: 1px solid var(--component-badge-default-border);
      background: var(--component-badge-default-background);
      color: var(--component-badge-default-foreground);
    }

    :host([variant='success']) {
      background: var(--component-badge-success-background);
      color: var(--component-badge-success-foreground);
      border-color: var(--component-badge-success-border);
    }

    :host([variant='warning']) {
      background: var(--component-badge-warning-background);
      color: var(--component-badge-warning-foreground);
      border-color: var(--component-badge-warning-border);
    }

    :host([variant='danger']) {
      background: var(--component-badge-danger-background);
      color: var(--component-badge-danger-foreground);
      border-color: var(--component-badge-danger-border);
    }

    :host([variant='info']) {
      background: var(--component-badge-info-background);
      color: var(--component-badge-info-foreground);
      border-color: var(--component-badge-info-border);
    }

    :host([variant='accent-green']) {
      background: var(--component-badge-accent-green-background);
      color: var(--component-badge-accent-green-foreground);
      border-color: var(--component-badge-accent-green-border);
    }

    :host([variant='accent-blue']) {
      background: var(--component-badge-accent-blue-background);
      color: var(--component-badge-accent-blue-foreground);
      border-color: var(--component-badge-accent-blue-border);
    }

    :host([variant='accent-violet']) {
      background: var(--component-badge-accent-violet-background);
      color: var(--component-badge-accent-violet-foreground);
      border-color: var(--component-badge-accent-violet-border);
    }

    :host([variant='accent-amber']) {
      background: var(--component-badge-accent-amber-background);
      color: var(--component-badge-accent-amber-foreground);
      border-color: var(--component-badge-accent-amber-border);
    }
  `;

  /**
   * Visual variant. Status variants (success, warning, danger, info) convey
   * semantic meaning. Accent variants are decorative emphasis tags.
   */
  @property({ reflect: true })
  variant: BadgeVariant = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-badge': RrBadge;
  }
}
