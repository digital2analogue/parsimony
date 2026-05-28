import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-checkbox>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Checkbox
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
  {
    props: {
      checked: figma.enum('State', {
        checked: true,
      }),
      indeterminate: figma.enum('State', {
        indeterminate: true,
      }),
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ checked, indeterminate, disabled }) =>
      html`<rr-checkbox
        label="Label"
        checked=${checked}
        indeterminate=${indeterminate}
        disabled=${disabled}
      ></rr-checkbox>`,
  }
);
