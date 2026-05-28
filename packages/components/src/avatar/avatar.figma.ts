import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-avatar>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Avatar
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
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
