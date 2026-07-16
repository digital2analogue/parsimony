import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mappings for <rr-menu> and <rr-menu-item>.
 * Figma nodes: Components / Menu page → Menu (186-3), Menu Item (186-2)
 * Figma file: Parsimony Design System (4aOEBHcnAv2Kbn0g1arL78)
 */

// Menu Item component set — Variant (default/danger) maps to the danger prop;
// State (rest/hover/disabled) maps disabled; hover is a presentation-only state.
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=186-2',
  {
    props: {
      danger: figma.enum('Variant', {
        danger: true,
      }),
      disabled: figma.enum('State', {
        disabled: true,
      }),
      label: figma.string('Label Text'),
    },
    example: ({ danger, disabled, label }) =>
      html`<rr-menu-item value="action" danger=${danger} disabled=${disabled}>${label}</rr-menu-item>`,
  }
);

// Menu component — the open surface; the trigger and items are slotted.
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Parsimony-Design-System?node-id=186-3',
  {
    props: {},
    example: () =>
      html`<rr-menu label="Row actions">
  <rr-button slot="trigger" variant="secondary">Actions</rr-button>
  <rr-menu-item value="edit">Edit rule</rr-menu-item>
  <rr-menu-item value="duplicate">Duplicate</rr-menu-item>
  <rr-menu-item value="delete" danger>Delete rule</rr-menu-item>
</rr-menu>`,
  }
);
