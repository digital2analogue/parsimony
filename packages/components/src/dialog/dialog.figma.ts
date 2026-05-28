import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-dialog>.
 * Figma node: Components page → Dialog (node 124-31)
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=124-31',
  {
    props: {
      heading: figma.string('Heading'),
      hasFooter: figma.enum('Footer', {
        true: true,
      }),
    },
    example: ({ heading, hasFooter }) =>
      html`<rr-dialog heading="${heading}">
  Dialog body content goes here.
  ${hasFooter
    ? html`<rr-button slot="footer" variant="primary">Confirm</rr-button>
  <rr-button slot="footer" variant="secondary">Cancel</rr-button>`
    : html``}
</rr-dialog>`,
  }
);
