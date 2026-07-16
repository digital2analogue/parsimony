import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-dialog>.
 * Figma node: Components page → Dialog (node 124-31)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=124-31',
  {
    variant: { Footer: 'false' },
    example: () =>
      html`<rr-dialog heading="Dialog heading">
  Dialog body content goes here.
</rr-dialog>`,
  }
);

figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=124-31',
  {
    variant: { Footer: 'true' },
    example: () =>
      html`<rr-dialog heading="Dialog heading">
  Dialog body content goes here.
  <rr-button slot="footer" variant="primary">Confirm</rr-button>
  <rr-button slot="footer" variant="secondary">Cancel</rr-button>
</rr-dialog>`,
  }
);
