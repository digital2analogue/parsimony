import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-icon>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Icon
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
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
