import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Toggle',
  component: 'rr-toggle',
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
    name: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    value: 'on',
    name: '',
    label: 'Enable notifications',
  },
  render: ({ checked, disabled, value, name, label }) => html`
    <rr-toggle
      ?checked=${checked}
      ?disabled=${disabled}
      value=${value}
      name=${name}
      label=${label}
    ></rr-toggle>
  `,
};
export default meta;

type Story = StoryObj;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };
