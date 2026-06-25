import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const options = [
  { label: 'One', value: '1' },
  { label: 'Two', value: '2' },
  { label: 'Three', value: '3' },
];

const meta: Meta = {
  title: 'Components/Select',
  component: 'rr-select',
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    name: '',
    value: '',
    label: 'Quantity',
    helperText: '',
    errorText: '',
    required: false,
    disabled: false,
  },
  render: ({ name, value, label, helperText, errorText, required, disabled }) => html`
    <rr-select
      name=${name}
      value=${value}
      label=${label}
      helper-text=${helperText}
      error-text=${errorText}
      ?required=${required}
      ?disabled=${disabled}
      .options=${options}
    ></rr-select>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const WithValue: Story = { args: { value: '2' } };

export const WithError: Story = { args: { errorText: 'Please choose a value.' } };
