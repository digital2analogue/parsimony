import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-button>.
 *
 * Figma file:  Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Component:   Button ComponentSet — node 98:56
 * Variant props:
 *   "Variant" — primary | secondary | ghost | danger
 *   "Size"    — sm | md | lg  (1:1 with the element after the vocabulary unification)
 *   "State"   — default | hover | active | focus | disabled | loading
 *
 * Notes:
 *   - `disabled` derived from State=disabled, `loading` from State=loading
 *     (no separate boolean props in Figma).
 *   - hover/active/focus are CSS-only states — they exist as Figma variants
 *     for design reference but emit the same element as State=default.
 *   - variant and size are always emitted; consumers trim defaults manually.
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=98-56',
  {
    props: {
      variant: figma.enum('Variant', {
        primary:   'primary',
        secondary: 'secondary',
        ghost:     'ghost',
        danger:    'danger',
      }),
      size: figma.enum('Size', {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
      }),
      disabled: figma.enum('State', {
        disabled: true,
      }),
      loading: figma.enum('State', {
        loading: true,
      }),
    },
    example: ({ variant, size, disabled, loading }) =>
      html`<rr-button variant="${variant}" size="${size}" disabled=${disabled} loading=${loading}>Button</rr-button>`,
  }
);
