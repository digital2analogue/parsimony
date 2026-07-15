import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Alert',
  component: 'rr-alert',
  argTypes: {
    variant: { control: 'select', options: ['success', 'warning', 'danger', 'info'] },
    heading: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'success',
    heading: 'Heads up',
    dismissible: false,
  },
  render: ({ variant, heading, dismissible }) => html`
    <rr-alert
      variant=${variant}
      heading=${heading}
      ?dismissible=${dismissible}
    >Your changes have been saved.</rr-alert>
  `,
};
export default meta;

type Story = StoryObj;

export const Success: Story = { args: { variant: 'success', heading: 'Saved' } };

export const Warning: Story = {
  args: { variant: 'warning', heading: 'Check this' },
  render: ({ variant, heading }) => html`
    <rr-alert variant=${variant} heading=${heading}>Some fields need your attention.</rr-alert>
  `,
};

export const Danger: Story = {
  args: { variant: 'danger', heading: 'Something went wrong' },
  render: ({ variant, heading }) => html`
    <rr-alert variant=${variant} heading=${heading}>We couldn't process your request.</rr-alert>
  `,
};

export const Info: Story = {
  args: { variant: 'info', heading: 'Did you know' },
  render: ({ variant, heading }) => html`
    <rr-alert variant=${variant} heading=${heading}>Tokens sync automatically on build.</rr-alert>
  `,
};

export const Dismissible: Story = {
  args: { variant: 'info', heading: 'Dismissible', dismissible: true },
};

export const WithIcon: Story = {
  render: () => html`
    <rr-alert variant="success" heading="Deployed">
      <rr-icon slot="icon" aria-label="Success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </rr-icon>
      Your site is live.
    </rr-alert>
  `,
};
