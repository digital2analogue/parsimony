import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type TableDensity = 'default' | 'compact';

/**
 * `<rr-table>` — a structural data table composed from `rr-table-row` and
 * `rr-table-cell`.
 *
 * Raw `<tr>`/`<td>` can't be slotted into a custom element (the HTML parser
 * drops table tags outside a `<table>` context), so the family uses CSS
 * table display with explicit ARIA table semantics: this host is the
 * `role="table"`, rows are `role="row"`, cells `role="cell"` /
 * `role="columnheader"`. Cells accept arbitrary content — badges, menus,
 * buttons.
 *
 * Row states are owned here (zebra striping, hover tint, selected rail) so
 * every table in the system shares one visual language. The hover tint only
 * renders when `interactive` is set — accent green signals interactivity,
 * never decoration.
 *
 * @slot header - A single rr-table-row of header cells (rr-table-cell header)
 * @slot - Body rr-table-row elements
 *
 * @csspart table - The table layout container
 *
 * @example
 * <rr-table label="Rules" zebra interactive>
 *   <rr-table-row slot="header">
 *     <rr-table-cell header>Rule</rr-table-cell>
 *     <rr-table-cell header numeric>Amount</rr-table-cell>
 *   </rr-table-row>
 *   <rr-table-row>
 *     <rr-table-cell>High-value approvals</rr-table-cell>
 *     <rr-table-cell numeric>25,000</rr-table-cell>
 *   </rr-table-row>
 * </rr-table>
 */
@customElement('rr-table')
export class RrTable extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* Cell padding is published as inherited custom properties so
         rr-table-cell (its own shadow root) picks the density up. */
      --rr-table-cell-padding-y: var(--spacing-inline);
      --rr-table-cell-padding-x: var(--spacing-element);
    }

    :host([density='compact']) {
      --rr-table-cell-padding-y: var(--spacing-tight);
      --rr-table-cell-padding-x: var(--spacing-inline);
    }

    .table {
      display: table;
      width: 100%;
      border-radius: var(--radius-none);
    }

    .head {
      display: table-header-group;
    }

    .body {
      display: table-row-group;
    }

    :host([zebra]) .body ::slotted(rr-table-row:nth-child(even)) {
      background: var(--component-table-row-zebra-background);
    }

    :host([interactive]) .body ::slotted(rr-table-row:hover) {
      background: var(--component-table-row-hover-background);
      cursor: pointer;
    }

    .body ::slotted(rr-table-row[selected]) {
      background: var(--component-table-row-selected-background) !important;
      box-shadow: inset 3px 0 0 var(--component-table-row-selected-rail);
    }
  `;

  /** Accessible name for the table (required); sets aria-label on the role=table host. */
  @property() label = '';

  /** Row density: default (12/16 cell padding) or compact (8/12) for data-dense surfaces. */
  @property({ reflect: true }) density: TableDensity = 'default';

  /** Zebra-stripes even body rows with the elevated surface fill. */
  @property({ type: Boolean, reflect: true }) zebra = false;

  /** Marks rows as clickable: enables the green hover tint and pointer cursor. */
  @property({ type: Boolean, reflect: true }) interactive = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'table');
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
    }
  }

  render() {
    return html`
      <div class="table" part="table">
        <div class="head" role="rowgroup">
          <slot name="header"></slot>
        </div>
        <div class="body" role="rowgroup">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rr-table': RrTable;
  }
}
