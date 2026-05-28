import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-progress>.
 * Figma node: Components page → Progress (node 125-6)
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=125-6',
  {
    variant: { State: 'determinate' },
    example: () =>
      html`<rr-progress value="60" max="100" label="Progress"></rr-progress>`,
  }
);

figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=125-6',
  {
    variant: { State: 'indeterminate' },
    example: () =>
      html`<rr-progress indeterminate label="Loading…"></rr-progress>`,
  }
);
