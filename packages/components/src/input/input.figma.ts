import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-input>.
 *
 * Figma file:  Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component:   Input ComponentSet — node 103:27
 * Variant prop: "State" — default | hover | focus | error | disabled
 *
 * Notes:
 *   - Label and placeholder are static in Figma; representative values shown.
 *   - `disabled` derived from State=disabled.
 *   - Error state border/color is communicated visually in the Figma component;
 *     the code snippet shows `error-text` to guide implementation.
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=103-27',
  {
    props: {
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ disabled }) =>
      html`<rr-input
  label="Label"
  placeholder="Placeholder text"
  helper-text="Helper text"
  disabled=${disabled}></rr-input>`,
  }
);
