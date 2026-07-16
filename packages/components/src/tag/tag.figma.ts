import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-tag>.
 *
 * Figma file:  Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component:   Tag ComponentSet — node 171:28 (page "Components / Tag")
 * Variant props:
 *   "Variant" — default | subtle  (1:1 with the element)
 *
 * The set was created 2026-07-15 during the FigmaLint gap-fill — Tag was
 * the last rr-* component with no design counterpart.
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=171-28',
  {
    props: {
      variant: figma.enum('Variant', {
        default: 'default',
        subtle:  'subtle',
      }),
    },
    example: ({ variant }) =>
      html`<rr-tag variant="${variant}">Tag</rr-tag>`,
  }
);
