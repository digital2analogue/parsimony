import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<rr-table-cell>` — a cell inside `rr-table-row`.
 *
 * The host carries `role="cell"` (or `role="columnheader"` when `header` is
 * set) and lays out as a CSS table cell. Padding comes from the parent
 * table's density via inherited custom properties. Cells accept arbitrary
 * content — text, badges, menus, buttons.
 *
 * Header cells render the system's column-header recipe: muted, uppercase,
 * all-caps tracking, label-strong-small. Numeric cells right-align in
 * mono with tabular figures so digit columns line up.
 *
 * @slot - Cell content
 */
@customElement('rr-table-cell')
export class RrTableCell extends LitElement {
  static styles = css`
    :host {
      display: table-cell;
      vertical-align: middle;
      padding: var(--rr-table-cell-padding-y, var(--spacing-inline))
        var(--rr-table-cell-padding-x, var(--spacing-element));
      border-bottom: 1px solid var(--component-table-row-separator);
      font: var(--font-label-medium);
      color: var(--component-table-cell-foreground);
    }

    :host([header]) {
      font: var(--font-label-strong-small);
      letter-spacing: var(--letter-spacing-all-caps);
      text-transform: uppercase;
      color: var(--component-table-header-foreground);
    }

    :host([numeric]) {
      text-align: right;
      font: var(--font-mono-label-small);
      font-variant-numeric: tabular-nums;
    }

    :host([header][numeric]) {
      font: var(--font-label-strong-small);
      letter-spacing: var(--letter-spacing-all-caps);
    }
  `;

  /** Renders the cell as a column header (role=columnheader, muted all-caps recipe). */
  @property({ type: Boolean, reflect: true }) header = false;

  /** Right-aligns the cell in mono with tabular figures — for amounts, counts, IDs. */
  @property({ type: Boolean, reflect: true }) numeric = false;

  connectedCallback() {
    super.connectedCallback();
    this._syncRole();
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('header')) this._syncRole();
  }

  private _syncRole() {
    this.setAttribute('role', this.header ? 'columnheader' : 'cell');
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-table-cell': RrTableCell;
  }
}
