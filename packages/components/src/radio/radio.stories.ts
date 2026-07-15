import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

/**
 * `rr-radio` is a child element: it must live inside an `rr-radio-group`,
 * which manages selection state and keyboard navigation. This standalone
 * story shows a single radio in isolation for reference only — see the
 * Radio Group stories for real usage.
 */
const meta: Meta = {
  title: 'Components/Radio',
  component: 'rr-radio',
  argTypes: {
    value: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 'a',
    checked: false,
    disabled: false,
  },
  render: ({ value, checked, disabled }) => html`
    <rr-radio value=${value} ?checked=${checked} ?disabled=${disabled}>Option A</rr-radio>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};
