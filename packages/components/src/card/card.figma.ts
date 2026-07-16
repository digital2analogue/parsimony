import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-card>.
 *
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Card (node 115:19)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=115-19',
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
