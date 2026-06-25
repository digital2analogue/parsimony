import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Tab List',
  component: 'rr-tab-list',
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
  },
  args: {
    label: 'View options',
    value: 'overview',
  },
  render: ({ label, value }) => html`
    <rr-tab-list label=${label} value=${value}>
      <rr-tab value="overview">Overview</rr-tab>
      <rr-tab value="history">History</rr-tab>
      <rr-tab value="settings">Settings</rr-tab>
    </rr-tab-list>
    <div style="padding-top: var(--spacing-element); color: var(--color-foreground-default);">
      Panel content for the selected tab.
    </div>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};
