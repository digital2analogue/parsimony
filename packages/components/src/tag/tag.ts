import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type TagVariant = 'default' | 'subtle';

/**
 * An outlined, uppercase tag / chip component.
 *
 * The deliberate inverse of `<rr-badge>`: where the badge is a filled pill for
 * status, the tag is a square-cornered (radius.sm), transparent-filled, bordered
 * label for skills, categories, and metadata. Content is rendered UPPERCASE with
 * all-caps letter-spacing, so authors pass normal-case text.
 *
 * Uses component-level design tokens for all visual properties. Brand theming
 * cascades automatically via CSS custom properties on `:root`.
 *
 * @slot - Tag label text
 * @cssprop --component-tag-{variant}-background
 * @cssprop --component-tag-{variant}-foreground
 * @cssprop --component-tag-{variant}-border
 * @cssprop --component-tag-radius
 * @cssprop --component-tag-padding-x
 * @cssprop --component-tag-padding-y
 */
@customElement('rr-tag')
export class RrTag extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-all-caps);
      font: var(--font-label-medium);
      border-radius: var(--component-tag-radius);
      padding: var(--component-tag-padding-y) var(--component-tag-padding-x);
      border: 1px solid var(--component-tag-default-border);
      background: var(--component-tag-default-background);
      color: var(--component-tag-default-foreground);
    }

    :host([variant='subtle']) {
      background: var(--component-tag-subtle-background);
      color: var(--component-tag-subtle-foreground);
      border-color: var(--component-tag-subtle-border);
    }
  `;

  @property({ reflect: true })
  variant: TagVariant = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-tag': RrTag;
  }
}
