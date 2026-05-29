import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-button>.
 *
 * Figma file:  Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component:   Button ComponentSet — node 98:56
 * Variant props:
 *   "Variant" — primary | secondary | ghost
 *   "Size"    — sm | md | lg  (maps to small | medium | large on the element)
 *   "State"   — default | hover | disabled
 *
 * Notes:
 *   - `disabled` derived from State=disabled (no separate boolean prop in Figma).
 *   - variant and size are always emitted; consumers trim defaults manually.
 *   - The code component also supports variant="danger", but the Figma Button
 *     set does not yet have a danger variant. Add the danger variant in Figma,
 *     then add `danger: 'danger'` to the enum below. See ai/FIGMA.md.
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=98-56',
  {
    props: {
      variant: figma.enum('Variant', {
        primary:   'primary',
        secondary: 'secondary',
        ghost:     'ghost',
      }),
      size: figma.enum('Size', {
        sm: 'small',
        md: 'medium',
        lg: 'large',
      }),
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ variant, size, disabled }) =>
      html`<rr-button variant="${variant}" size="${size}" disabled=${disabled}>Button</rr-button>`,
  }
);
