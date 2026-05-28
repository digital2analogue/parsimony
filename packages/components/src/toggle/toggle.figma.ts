import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-toggle>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the Toggle
 * component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
  {
    props: {
      checked: figma.enum('State', {
        on: true,
      }),
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ checked, disabled }) =>
      html`<rr-toggle label="Label" checked=${checked} disabled=${disabled}></rr-toggle>`,
  }
);
