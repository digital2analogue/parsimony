import figma from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-button>.
 *
 * TODO: Replace the placeholder Figma URL with the actual component URL
 * once the Figma library is created. The URL format is:
 *   https://figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>
 */
figma.connect(
  // Figma component URL — update when Figma library exists
  'https://figma.com/design/PLACEHOLDER/brand-system?node-id=0:2',
  {
    props: {
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
        Danger: 'danger',
      }),
      size: figma.enum('Size', {
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
      label: figma.string('Label'),
      disabled: figma.boolean('Disabled'),
      loading: figma.boolean('Loading'),
    },
    example: ({ variant, size, label, disabled, loading }) => {
      const attrs = [
        variant !== 'primary' ? `variant="${variant}"` : '',
        size !== 'medium' ? `size="${size}"` : '',
        disabled ? 'disabled' : '',
        loading ? 'loading' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<rr-button${attrs ? ' ' + attrs : ''}>${label}</rr-button>`;
    },
  }
);
