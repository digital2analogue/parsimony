import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Input',
  component: 'rr-input',
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    type: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    value: '',
    type: 'email',
    helperText: '',
    errorText: '',
    required: false,
    disabled: false,
  },
  render: ({ label, placeholder, value, type, helperText, errorText, required, disabled }) => html`
    <rr-input
      label=${label}
      placeholder=${placeholder}
      value=${value}
      type=${type}
      helper-text=${helperText}
      error-text=${errorText}
      ?required=${required}
      ?disabled=${disabled}
    ></rr-input>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "We'll never share your email." },
};

export const Error: Story = {
  args: { value: 'not-an-email', errorText: 'Enter a valid email address.' },
};

export const Disabled: Story = { args: { disabled: true, value: 'locked@example.com' } };
