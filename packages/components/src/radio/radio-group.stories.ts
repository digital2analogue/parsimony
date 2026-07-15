import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Radio Group',
  component: 'rr-radio-group',
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    label: { control: 'text' },
    errorText: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
  args: {
    name: 'plan',
    value: 'standard',
    label: 'Choose a plan',
    errorText: '',
    required: false,
    disabled: false,
    orientation: 'vertical',
  },
  render: ({ name, value, label, errorText, required, disabled, orientation }) => html`
    <rr-radio-group
      name=${name}
      value=${value}
      label=${label}
      error-text=${errorText}
      ?required=${required}
      ?disabled=${disabled}
      orientation=${orientation}
    >
      <rr-radio value="basic">Basic</rr-radio>
      <rr-radio value="standard">Standard</rr-radio>
      <rr-radio value="pro">Pro</rr-radio>
    </rr-radio-group>
  `,
};
export default meta;

type Story = StoryObj;

export const Vertical: Story = {};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const WithError: Story = { args: { value: '', errorText: 'Pick one' } };
