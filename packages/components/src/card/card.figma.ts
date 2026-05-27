import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-card>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Card
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
  {
    props: {
      padding: figma.enum('Padding', {
        none: 'none',
        sm:   'sm',
        md:   'md',
        lg:   'lg',
      }),
    },
    example: ({ padding }) =>
      html`<rr-card padding="${padding}"><!-- content --></rr-card>`,
  }
);
