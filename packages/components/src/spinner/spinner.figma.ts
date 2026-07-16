import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-spinner>.
 * Figma node: Components page → Spinner (node 124-11)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=124-11',
  {
    props: {
      size: figma.enum('Size', {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
      }),
    },
    example: ({ size }) => html`<rr-spinner size="${size}"></rr-spinner>`,
  }
);
