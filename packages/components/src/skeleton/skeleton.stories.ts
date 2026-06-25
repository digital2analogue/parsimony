import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Skeleton',
  component: 'rr-skeleton',
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
  args: {
    variant: 'text',
    width: '',
    height: '',
  },
  render: ({ variant, width, height }) => html`
    <rr-skeleton variant=${variant} width=${width} height=${height}></rr-skeleton>
  `,
};
export default meta;

type Story = StoryObj;

export const Text: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--spacing-tight);">
      <rr-skeleton variant="text"></rr-skeleton>
      <rr-skeleton variant="text"></rr-skeleton>
      <rr-skeleton variant="text" width="60%"></rr-skeleton>
    </div>
  `,
};

export const Circular: Story = {
  args: { variant: 'circular', width: '48px', height: '48px' },
};

export const Rectangular: Story = {
  args: { variant: 'rectangular', width: '100%', height: '120px' },
};
