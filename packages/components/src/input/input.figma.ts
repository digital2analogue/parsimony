import figma from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-input>.
 *
 * TODO: Replace the placeholder Figma URL with the actual component URL
 * once the Figma library is created. The URL format is:
 *   https://figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>
 */
figma.connect(
  // Figma component URL — update when Figma library exists
  'https://figma.com/design/PLACEHOLDER/brand-system?node-id=0:3',
  {
    props: {
      label: figma.string('Label'),
      placeholder: figma.string('Placeholder'),
      helperText: figma.string('Helper Text'),
      errorText: figma.string('Error Text'),
      disabled: figma.boolean('Disabled'),
      required: figma.boolean('Required'),
    },
    example: ({ label, placeholder, helperText, errorText, disabled, required }) => {
      const attrs = [
        `label="${label}"`,
        placeholder ? `placeholder="${placeholder}"` : '',
        helperText ? `helper-text="${helperText}"` : '',
        errorText ? `error-text="${errorText}"` : '',
        disabled ? 'disabled' : '',
        required ? 'required' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<rr-input ${attrs}></rr-input>`;
    },
  }
);
