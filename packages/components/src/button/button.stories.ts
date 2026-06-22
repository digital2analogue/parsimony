import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Button',
  component: 'rr-button',
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    label: 'Save changes',
  },
  render: ({ variant, size, disabled, loading, label }) => html`
    <rr-button
      variant=${variant}
      size=${size}
      ?disabled=${disabled}
      ?loading=${loading}
    >${label}</rr-button>
  `,
};
export default meta;

type Story = StoryObj;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };

export const Danger: Story = { args: { variant: 'danger', label: 'Delete' } };

export const Loading: Story = { args: { loading: true } };

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--spacing-inline);">
      <rr-button size="small">Small</rr-button>
      <rr-button size="medium">Medium</rr-button>
      <rr-button size="large">Large</rr-button>
    </div>
  `,
};
