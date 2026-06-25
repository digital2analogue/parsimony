import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

/**
 * `rr-tab` is a single tab button. Selection is normally managed by the
 * parent `rr-tab-list` (it sets `selected` and handles keyboard navigation).
 * This standalone story shows one tab in isolation for reference — see the
 * Tab List stories for real usage.
 */
const meta: Meta = {
  title: 'Components/Tab',
  component: 'rr-tab',
  argTypes: {
    value: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 'overview',
    selected: true,
    disabled: false,
  },
  render: ({ value, selected, disabled }) => html`
    <rr-tab value=${value} ?selected=${selected} ?disabled=${disabled}>Overview</rr-tab>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};
