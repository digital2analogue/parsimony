import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-link>.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Link (node 115:26)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=115-26',
  {
    props: {
      variant: figma.enum('Variant', {
        default: 'default',
        muted:   'muted',
        subtle:  'subtle',
      }),
    },
    example: ({ variant }) =>
      html`<rr-link href="#" variant="${variant}">Link text</rr-link>`,
  }
);
