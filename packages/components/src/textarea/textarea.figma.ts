import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-textarea>.
 *
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Textarea (node 119:24)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=119-24',
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
