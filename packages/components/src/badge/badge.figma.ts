import figma from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-badge>.
 *
 * TODO: Replace the placeholder Figma URL with the actual component URL
 * once the Figma library is created. The URL format is:
 *   https://figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>
 */
figma.connect(
  // Figma component URL — update when Figma library exists
  'https://figma.com/design/PLACEHOLDER/brand-system?node-id=0:1',
  {
    props: {
      variant: figma.enum('Variant', {
        Default: 'default',
        Success: 'success',
        Warning: 'warning',
        Danger: 'danger',
        Info: 'info',
        'Accent Green': 'accent-green',
        'Accent Blue': 'accent-blue',
        'Accent Violet': 'accent-violet',
        'Accent Amber': 'accent-amber',
      }),
      label: figma.string('Label'),
    },
    example: ({ variant, label }) =>
      `<rr-badge variant="${variant}">${label}</rr-badge>`,
  }
);
