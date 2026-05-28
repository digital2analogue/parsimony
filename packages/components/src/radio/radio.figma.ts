import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-radio-group> + <rr-radio>.
 *
 * TODO: Replace PLACEHOLDER with the real Figma node-id once the
 * RadioGroup component is added to the Figma component library.
 *
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=PLACEHOLDER',
  {
    props: {
      orientation: figma.enum('Orientation', {
        vertical: 'vertical',
        horizontal: 'horizontal',
      }),
    },
    example: ({ orientation }) =>
      html`<rr-radio-group name="option" label="Choose one" orientation="${orientation}">
  <rr-radio value="a">Option A</rr-radio>
  <rr-radio value="b">Option B</rr-radio>
  <rr-radio value="c">Option C</rr-radio>
</rr-radio-group>`,
  }
);
