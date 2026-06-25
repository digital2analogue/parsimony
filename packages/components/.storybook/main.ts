import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  // CSF stories for the rr-* web components. These live alongside the source;
  // the legacy *.stories.html files are standalone dev harnesses and are not
  // picked up by Storybook.
  stories: ['../src/**/*.stories.@(js|ts)'],
  // addon-docs powers the autodocs pages (prop tables + descriptions) generated
  // from the Custom Elements Manifest wired in preview.ts. Required in SB10 —
  // it's no longer bundled via essentials.
  // addon-a11y runs axe-core against each story and surfaces violations in the
  // Accessibility panel. Note: axe does NOT reliably catch SC 1.4.11 non-text
  // contrast (see docs/decisions.md 2026-06-22) — it complements, not replaces,
  // the non-text-contrast review still owed on outlined controls.
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
};

export default config;
