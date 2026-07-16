import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './table.js';
import './table-row.js';
import './table-cell.js';
import type { RrTable } from './table.js';
import type { RrTableRow } from './table-row.js';
import type { RrTableCell } from './table-cell.js';

function mount(attrs = ''): RrTable {
  const tpl = document.createElement('template');
  tpl.innerHTML = `
    <rr-table label="Rules" ${attrs}>
      <rr-table-row slot="header">
        <rr-table-cell header>Rule</rr-table-cell>
        <rr-table-cell header>Outcome</rr-table-cell>
        <rr-table-cell header numeric>Amount</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>High-value approvals</rr-table-cell>
        <rr-table-cell>Approve</rr-table-cell>
        <rr-table-cell numeric>25,000</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>Low income</rr-table-cell>
        <rr-table-cell>Deny</rr-table-cell>
        <rr-table-cell numeric>1,200</rr-table-cell>
      </rr-table-row>
    </rr-table>
  `.trim();
  const el = tpl.content.firstElementChild as RrTable;
  document.body.appendChild(el);
  return el;
}

describe('rr-table', () => {
  let table: RrTable;

  beforeEach(async () => {
    document.body.innerHTML = '';
    table = mount();
    await table.updateComplete;
    await Promise.all(
      [...table.querySelectorAll('rr-table-row, rr-table-cell')].map(
        (el) => (el as RrTableRow | RrTableCell).updateComplete
      )
    );
  });

  it('exposes role=table with the accessible label', () => {
    expect(table.getAttribute('role')).toBe('table');
    expect(table.getAttribute('aria-label')).toBe('Rules');
  });

  it('rows carry role=row', () => {
    for (const row of table.querySelectorAll('rr-table-row')) {
      expect(row.getAttribute('role')).toBe('row');
    }
  });

  it('cells carry role=cell; header cells role=columnheader', () => {
    const headerCells = table.querySelectorAll('rr-table-cell[header]');
    const bodyCells = table.querySelectorAll('rr-table-cell:not([header])');
    expect(headerCells.length).toBe(3);
    for (const c of headerCells) expect(c.getAttribute('role')).toBe('columnheader');
    for (const c of bodyCells) expect(c.getAttribute('role')).toBe('cell');
  });

  it('flipping header at runtime re-syncs the role', async () => {
    const cell = table.querySelector('rr-table-cell:not([header])') as RrTableCell;
    cell.header = true;
    await cell.updateComplete;
    expect(cell.getAttribute('role')).toBe('columnheader');
  });

  it('selected rows expose aria-selected and clear it when deselected', async () => {
    const row = table.querySelectorAll('rr-table-row')[1] as RrTableRow;
    row.selected = true;
    await row.updateComplete;
    expect(row.getAttribute('aria-selected')).toBe('true');
    row.selected = false;
    await row.updateComplete;
    expect(row.hasAttribute('aria-selected')).toBe(false);
  });

  it('density reflects for the padding custom-property switch', async () => {
    expect(table.hasAttribute('density')).toBe(true);
    table.density = 'compact';
    await table.updateComplete;
    expect(table.getAttribute('density')).toBe('compact');
  });

  it('zebra and interactive reflect as attributes for the state stylesheet', async () => {
    table.zebra = true;
    table.interactive = true;
    await table.updateComplete;
    expect(table.hasAttribute('zebra')).toBe(true);
    expect(table.hasAttribute('interactive')).toBe(true);
  });

  it('updating label updates aria-label; empty label removes it', async () => {
    table.label = 'Decision rules';
    await table.updateComplete;
    expect(table.getAttribute('aria-label')).toBe('Decision rules');
    table.label = '';
    await table.updateComplete;
    expect(table.hasAttribute('aria-label')).toBe(false);
  });

  it('has no a11y violations', async () => {
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with zebra + interactive + a selected row', async () => {
    table.zebra = true;
    table.interactive = true;
    const row = table.querySelectorAll('rr-table-row')[1] as RrTableRow;
    row.selected = true;
    await Promise.all([table.updateComplete, row.updateComplete]);
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
