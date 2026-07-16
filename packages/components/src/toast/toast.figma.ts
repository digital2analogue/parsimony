import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-toast>.
 * Figma node: Components / Toast page → Toast (node 182-32)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=182-32',
  {
    props: {
      variant: figma.enum('Variant', {
        neutral: 'neutral',
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        info: 'info',
      }),
      heading: figma.string('Heading Text'),
      message: figma.string('Message Text'),
    },
    example: ({ variant, heading, message }) =>
      html`<rr-toast variant="${variant}" heading="${heading}">
  ${message}
</rr-toast>`,
  }
);
