import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Textarea',
  component: 'rr-textarea',
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    rows: { control: { type: 'number' } },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    name: '',
    value: '',
    placeholder: 'Share your thoughts…',
    label: 'Feedback',
    helperText: '',
    errorText: '',
    rows: 3,
    required: false,
    disabled: false,
  },
  render: ({ name, value, placeholder, label, helperText, errorText, rows, required, disabled }) => html`
    <rr-textarea
      name=${name}
      value=${value}
      placeholder=${placeholder}
      label=${label}
      helper-text=${helperText}
      error-text=${errorText}
      rows=${rows}
      ?required=${required}
      ?disabled=${disabled}
    ></rr-textarea>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const WithHelper: Story = { args: { helperText: 'Max 500 characters.' } };

export const WithError: Story = { args: { errorText: 'This field is required.' } };

export const Disabled: Story = { args: { disabled: true, value: 'Cannot edit this.' } };
