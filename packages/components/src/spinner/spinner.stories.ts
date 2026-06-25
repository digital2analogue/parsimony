import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Spinner',
  component: 'rr-spinner',
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: {
    size: 'md',
    label: 'Loading',
  },
  render: ({ size, label }) => html`
    <rr-spinner size=${size} label=${label}></rr-spinner>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--spacing-inline);">
      <rr-spinner size="sm"></rr-spinner>
      <rr-spinner size="md"></rr-spinner>
      <rr-spinner size="lg"></rr-spinner>
    </div>
  `,
};
