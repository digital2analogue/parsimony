import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Toast',
  component: 'rr-toast',
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'success', 'warning', 'danger', 'info'] },
    heading: { control: 'text' },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
  },
  args: {
    variant: 'neutral',
    heading: '',
    dismissible: true,
    message: 'Your changes were saved.',
  },
  render: ({ variant, heading, dismissible, message }) => html`
    <rr-toast
      variant=${variant}
      heading=${heading}
      ?dismissible=${dismissible}
      style="max-width: 22rem;"
    >${message}</rr-toast>
  `,
};
export default meta;

type Story = StoryObj;

export const Neutral: Story = {};

export const Success: Story = { args: { variant: 'success', heading: 'Saved', message: 'Your changes are live.' } };

export const Warning: Story = { args: { variant: 'warning', heading: 'Connection unstable', message: 'Changes may take longer to sync.' } };

export const Danger: Story = { args: { variant: 'danger', heading: 'Upload failed', message: 'The file could not be processed.' } };

export const Info: Story = { args: { variant: 'info', heading: 'Heads up', message: 'Maintenance is scheduled for tonight.' } };

export const WithAction: Story = {
  render: () => html`
    <rr-toast variant="neutral" heading="Rule deleted" style="max-width: 22rem;">
      "High-value approvals" was removed.
      <rr-button slot="action" variant="ghost" size="sm">Undo</rr-button>
    </rr-toast>
  `,
};
