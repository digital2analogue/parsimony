import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-select>.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component: Select (node 117:28)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=117-28',
  {
    props: {
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ disabled }) =>
      html`<rr-select
  label="Label"
  disabled=${disabled}
></rr-select>`,
  }
);
