import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Progress',
  component: 'rr-progress',
  argTypes: {
    value: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    value: 60,
    max: 100,
    indeterminate: false,
    label: 'Uploading',
  },
  render: ({ value, max, indeterminate, label }) => html`
    <rr-progress
      value=${value}
      max=${max}
      ?indeterminate=${indeterminate}
      label=${label}
    ></rr-progress>
  `,
};
export default meta;

type Story = StoryObj;

export const Determinate: Story = { args: { value: 60, label: 'Uploading' } };

export const Zero: Story = { args: { value: 0, label: 'Waiting' } };

export const Complete: Story = { args: { value: 100, label: 'Done' } };

export const Indeterminate: Story = { args: { indeterminate: true, label: 'Working' } };
