import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-tab-list> + <rr-tab>.
 * Figma node: Components page → TabList (node 125-7)
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=125-7',
  {
    example: () =>
      html`<rr-tab-list label="View options" value="overview">
  <rr-tab value="overview">Overview</rr-tab>
  <rr-tab value="details">Details</rr-tab>
  <rr-tab value="settings">Settings</rr-tab>
</rr-tab-list>`,
  }
);
