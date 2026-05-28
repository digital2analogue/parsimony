import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-textarea>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Textarea
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
  {
    props: {
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ disabled }) =>
      html`<rr-textarea
        label="Label"
        placeholder="Placeholder text"
        helper-text="Helper text"
        disabled=${disabled}
      ></rr-textarea>`,
  }
);
