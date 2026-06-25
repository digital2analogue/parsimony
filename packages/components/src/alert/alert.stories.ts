import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Alert',
  component: 'rr-alert',
  argTypes: {
    variant: { control: 'select', options: ['success', 'warning', 'danger', 'info'] },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'success',
    title: 'Heads up',
    dismissible: false,
  },
  render: ({ variant, title, dismissible }) => html`
    <rr-alert
      variant=${variant}
      title=${title}
      ?dismissible=${dismissible}
    >Your changes have been saved.</rr-alert>
  `,
};
export default meta;

type Story = StoryObj;

export const Success: Story = { args: { variant: 'success', title: 'Saved' } };

export const Warning: Story = {
  args: { variant: 'warning', title: 'Check this' },
  render: ({ variant, title }) => html`
    <rr-alert variant=${variant} title=${title}>Some fields need your attention.</rr-alert>
  `,
};

export const Danger: Story = {
  args: { variant: 'danger', title: 'Something went wrong' },
  render: ({ variant, title }) => html`
    <rr-alert variant=${variant} title=${title}>We couldn't process your request.</rr-alert>
  `,
};

export const Info: Story = {
  args: { variant: 'info', title: 'Did you know' },
  render: ({ variant, title }) => html`
    <rr-alert variant=${variant} title=${title}>Tokens sync automatically on build.</rr-alert>
  `,
};

export const Dismissible: Story = {
  args: { variant: 'info', title: 'Dismissible', dismissible: true },
};

export const WithIcon: Story = {
  render: () => html`
    <rr-alert variant="success" title="Deployed">
      <rr-icon slot="icon" aria-label="Success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </rr-icon>
      Your site is live.
    </rr-alert>
  `,
};
