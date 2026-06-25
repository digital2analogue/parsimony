import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Card',
  component: 'rr-card',
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: {
    padding: 'md',
  },
  render: ({ padding }) => html`
    <rr-card padding=${padding}>
      A simple card with body content only.
    </rr-card>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const WithHeaderAndFooter: Story = {
  render: () => html`
    <rr-card>
      <span slot="header">Project status</span>
      The build passed and tokens are in sync.
      <span slot="footer">Updated just now</span>
    </rr-card>
  `,
};

export const Padding: Story = {
  render: () => html`
    <div style="display: flex; align-items: flex-start; gap: var(--spacing-inline);">
      <rr-card padding="none">No padding</rr-card>
      <rr-card padding="sm">Small padding</rr-card>
      <rr-card padding="md">Medium padding</rr-card>
      <rr-card padding="lg">Large padding</rr-card>
    </div>
  `,
};
