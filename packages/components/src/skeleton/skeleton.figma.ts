import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-skeleton>.
 * Figma node: Components page → Skeleton (node 126-5)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=126-5',
  {
    props: {
      variant: figma.enum('Variant', {
        text: 'text',
        circular: 'circular',
        rectangular: 'rectangular',
      }),
    },
    example: ({ variant }) =>
      html`<rr-skeleton variant="${variant}"></rr-skeleton>`,
  }
);
