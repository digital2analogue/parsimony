import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Dialog',
  component: 'rr-dialog',
  argTypes: {
    heading: { control: 'text' },
    open: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    heading: 'Confirm',
    open: true,
    closeOnBackdrop: true,
  },
  render: ({ heading, open, closeOnBackdrop }) => html`
    <rr-dialog
      heading=${heading}
      ?open=${open}
      ?close-on-backdrop=${closeOnBackdrop}
    >
      Are you sure you want to continue?
      <rr-button slot="footer" variant="secondary">Cancel</rr-button>
      <rr-button slot="footer">Confirm</rr-button>
    </rr-dialog>
  `,
};
export default meta;

type Story = StoryObj;

export const Open: Story = {};
