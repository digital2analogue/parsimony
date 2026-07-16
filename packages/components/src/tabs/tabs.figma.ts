import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mappings for <rr-tab-list> + <rr-tab>.
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 * Page: "Components / Tabs"
 *   TabList — node 125-7 (composed of Tab instances)
 *   Tab ComponentSet — node 173-18 (Selected=true|false × State=default|hover|focus|disabled;
 *   rebuilt 2026-07-15 from the old static Tabs=3 component)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=125-7',
  {
    example: () =>
      html`<rr-tab-list label="View options" value="overview">
  <rr-tab value="overview">Overview</rr-tab>
  <rr-tab value="details">Details</rr-tab>
  <rr-tab value="settings">Settings</rr-tab>
</rr-tab-list>`,
  }
);

figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=173-18',
  {
    props: {
      selected: figma.enum('Selected', {
        true: true,
      }),
      // hover/focus are CSS-only states; disabled is the only State that maps to a prop
      disabled: figma.enum('State', {
        disabled: true,
      }),
    },
    example: ({ selected, disabled }) =>
      html`<rr-tab value="tab" selected=${selected} disabled=${disabled}>Tab</rr-tab>`,
  }
);
