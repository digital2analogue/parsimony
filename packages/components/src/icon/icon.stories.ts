import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const checkSvg = html`
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
`;

const meta: Meta = {
  title: 'Components/Icon',
  component: 'rr-icon',
  argTypes: {
    size: { control: 'select', options: ['compact', 'default', 'large', 'xl'] },
    'aria-label': { control: 'text' },
  },
  args: {
    size: 'default',
    'aria-label': null,
  },
  render: ({ size, ['aria-label']: ariaLabel }) => html`
    <rr-icon size=${size} aria-label=${ariaLabel ?? ''}>${checkSvg}</rr-icon>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--spacing-inline);">
      <rr-icon size="compact">${checkSvg}</rr-icon>
      <rr-icon size="default">${checkSvg}</rr-icon>
      <rr-icon size="large">${checkSvg}</rr-icon>
      <rr-icon size="xl">${checkSvg}</rr-icon>
    </div>
  `,
};

export const Labelled: Story = {
  render: () => html`
    <rr-icon aria-label="Info">${checkSvg}</rr-icon>
  `,
};
