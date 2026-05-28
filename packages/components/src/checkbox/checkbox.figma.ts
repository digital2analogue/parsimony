import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-checkbox>.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Checkbox (node 117:43)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=117-43',
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
