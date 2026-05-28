import figma, { html } from '@figma/code-connect';

/**
 * Code Connect mapping for <rr-radio-group> + <rr-radio>.
 * Figma node: Components page → RadioGroup (node 121-77)
 * Figma file: Brand Tokens Design System (4aOEBHcnAv2Kbn0g1arL78)
 */
figma.connect(
  'https://figma.com/design/4aOEBHcnAv2Kbn0g1arL78/Brand-Tokens-Design-System?node-id=121-77',
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
