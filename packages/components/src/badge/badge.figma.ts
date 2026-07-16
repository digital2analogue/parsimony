import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-badge>.
 *
 * Figma file:  Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component:   Badge ComponentSet — node 96:21
 * Variant prop: "Variant" — values are lowercase (default, success, …)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=96-21',
  {
    props: {
      variant: figma.enum('Variant', {
        default:         'default',
        success:         'success',
        warning:         'warning',
        danger:          'danger',
        info:            'info',
        'accent-green':  'accent-green',
        'accent-blue':   'accent-blue',
        'accent-violet': 'accent-violet',
        'accent-amber':  'accent-amber',
      }),
    },
    example: ({ variant }) =>
      html`<rr-badge variant="${variant}">Label</rr-badge>`,
  }
);
