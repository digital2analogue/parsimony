import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-icon>.
 *
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Icon (node 115:10)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=115-10',
  {
    props: {
      size: figma.enum('Size', {
        compact: 'compact',
        default: 'default',
        large:   'large',
        xl:      'xl',
      }),
    },
    example: ({ size }) =>
      html`<rr-icon size="${size}"><!-- svg here --></rr-icon>`,
  }
);
