import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<rr-table-row>` — a row inside `rr-table`.
 *
 * The host carries `role="row"` and lays out as a CSS table row; its visual
 * states (zebra, hover, selected fill and rail) are painted by the parent
 * rr-table's stylesheet so every table shares one recipe. `selected` is the
 * only state a row owns — set it from your selection model.
 *
 * @slot - rr-table-cell elements
 */
@customElement('rr-table-row')
export class RrTableRow extends LitElement {
  static styles = css`
    :host {
      display: table-row;
      transition: background var(--motion-duration-instant) var(--motion-easing-default);
    }
  `;

  /** Marks the row as selected — tint fill plus the solid action rail, strongest row state. */
  @property({ type: Boolean, reflect: true }) selected = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'row');
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('selected')) {
      if (this.selected) this.setAttribute('aria-selected', 'true');
      else this.removeAttribute('aria-selected');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-table-row': RrTableRow;
  }
}
