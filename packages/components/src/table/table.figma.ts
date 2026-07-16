import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mappings for <rr-table> and <rr-table-cell>.
 * Figma nodes: Components / Table page → Table (189-2), Table Cell (188-2)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * (rr-table-row has no standalone Figma set — rows appear inside the composed Table.)
 */

// Table Cell component set — Type (body/header/numeric) maps to the boolean modifiers.
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=188-2',
  {
    props: {
      header: figma.enum('Type', {
        header: true,
      }),
      numeric: figma.enum('Type', {
        numeric: true,
      }),
      label: figma.string('Label Text'),
    },
    example: ({ header, numeric, label }) =>
      html`<rr-table-cell header=${header} numeric=${numeric}>${label}</rr-table-cell>`,
  }
);

// Table component — the composed surface; rows and cells are slotted.
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=189-2',
  {
    props: {},
    example: () =>
      html`<rr-table label="Decision rules" zebra interactive>
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
</rr-table>`,
  }
);
