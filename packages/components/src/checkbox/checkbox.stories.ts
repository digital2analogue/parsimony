import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Checkbox',
  component: 'rr-checkbox',
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
    name: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    value: 'on',
    name: '',
    label: 'Accept terms',
  },
  render: ({ checked, indeterminate, disabled, value, name, label }) => html`
    <rr-checkbox
      ?checked=${checked}
      ?indeterminate=${indeterminate}
      ?disabled=${disabled}
      value=${value}
      name=${name}
      label=${label}
    ></rr-checkbox>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Indeterminate: Story = { args: { indeterminate: true, label: 'Select all' } };

export const Disabled: Story = { args: { disabled: true } };
