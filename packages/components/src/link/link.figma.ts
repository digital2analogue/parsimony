import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-link>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Link
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
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
