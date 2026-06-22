import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  // CSF stories for the rr-* web components. These live alongside the source;
  // the legacy *.stories.html files are standalone dev harnesses and are not
  // picked up by Storybook.
  stories: ['../src/**/*.stories.@(js|ts)'],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
};

export default config;
