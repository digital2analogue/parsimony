import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type IconSize = 'compact' | 'default' | 'large' | 'xl';

/**
 * A sized, accessible wrapper for inline SVG icons.
 *
 * Slot any SVG icon inside — the component handles sizing via icon-size
 * tokens and accessibility attributes. By default the icon is decorative
 * (aria-hidden="true"). Set `aria-label` to make it a meaningful image.
 *
 * @example Decorative (screen readers skip it):
 *   <rr-icon size="default">
 *     <svg ...><path .../></svg>
 *   </rr-icon>
 *
 * @example Standalone icon with label:
 *   <rr-icon aria-label="Close dialog">
 *     <svg ...><path .../></svg>
 *   </rr-icon>
 *
 * @slot - The SVG icon element.
 * @cssprop --icon-size-compact  16px
 * @cssprop --icon-size-default  20px
 * @cssprop --icon-size-large    24px
 * @cssprop --icon-size-xl       32px
 */
@customElement('rr-icon')
export class RrIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--icon-size-default);
      height: var(--icon-size-default);
      color: inherit;
      line-height: 0;
    }

    :host([size='compact']) {
      width: var(--icon-size-compact);
      height: var(--icon-size-compact);
    }

    :host([size='large']) {
      width: var(--icon-size-large);
      height: var(--icon-size-large);
    }

    :host([size='xl']) {
      width: var(--icon-size-xl);
      height: var(--icon-size-xl);
    }

    ::slotted(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  /** Icon size, mapped to the icon-size design tokens. Reflected to an attribute. */
  @property({ reflect: true })
  size: IconSize = 'default';

  /** Accessible label. When set, the host gets role="img"; otherwise it is aria-hidden="true" (decorative). */
  @property({ attribute: 'aria-label' })
  override ariaLabel: string | null = null;

  override updated() {
    // Manage host-level aria attributes imperatively so they appear
    // on the element itself (not inside the shadow root).
    if (this.ariaLabel) {
      this.setAttribute('role', 'img');
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.setAttribute('aria-hidden', 'true');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-icon': RrIcon;
  }
}
