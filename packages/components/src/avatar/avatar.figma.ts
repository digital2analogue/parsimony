import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-avatar>.
 *
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Avatar (node 119:65)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=119-65',
  {
    props: {
      size: figma.enum('Size', {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
      }),
      color: figma.enum('Color', {
        default: 'default',
        indigo: 'indigo',
        sky: 'sky',
        green: 'green',
        amber: 'amber',
      }),
    },
    example: ({ size, color }) =>
      html`<rr-avatar name="River Romney" size="${size}" color="${color}"></rr-avatar>`,
  }
);
