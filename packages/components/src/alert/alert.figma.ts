import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-alert>.
 * Figma node: Components page → Alert (node 121-50)
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=121-50',
  {
    props: {
      variant: figma.enum('Variant', {
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        info: 'info',
      }),
      dismissible: figma.enum('Dismissible', {
        true: true,
      }),
    },
    example: ({ variant, dismissible }) =>
      html`<rr-alert variant="${variant}" title="Alert title" dismissible=${dismissible}>
  Alert body content goes here.
</rr-alert>`,
  }
);
