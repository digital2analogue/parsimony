import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Table',
  component: 'rr-table',
  argTypes: {
    density: { control: 'select', options: ['default', 'compact'] },
    zebra: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
  args: {
    density: 'default',
    zebra: false,
    interactive: false,
  },
  render: ({ density, zebra, interactive }) => html`
    <rr-table label="Decision rules" density=${density} ?zebra=${zebra} ?interactive=${interactive}>
      <rr-table-row slot="header">
        <rr-table-cell header>Rule</rr-table-cell>
        <rr-table-cell header>Outcome</rr-table-cell>
        <rr-table-cell header numeric>Amount</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>High-value approvals</rr-table-cell>
        <rr-table-cell><rr-badge variant="success">Approve</rr-badge></rr-table-cell>
        <rr-table-cell numeric>25,000</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>Low income</rr-table-cell>
        <rr-table-cell><rr-badge variant="danger">Deny</rr-badge></rr-table-cell>
        <rr-table-cell numeric>1,200</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>Thin file</rr-table-cell>
        <rr-table-cell><rr-badge variant="info">Review</rr-badge></rr-table-cell>
        <rr-table-cell numeric>8,400</rr-table-cell>
      </rr-table-row>
    </rr-table>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Zebra: Story = { args: { zebra: true } };

export const Compact: Story = { args: { density: 'compact', zebra: true } };

export const InteractiveWithSelection: Story = {
  render: () => html`
    <rr-table label="Decision rules" interactive>
      <rr-table-row slot="header">
        <rr-table-cell header>Rule</rr-table-cell>
        <rr-table-cell header numeric>Amount</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>High-value approvals</rr-table-cell>
        <rr-table-cell numeric>25,000</rr-table-cell>
      </rr-table-row>
      <rr-table-row selected>
        <rr-table-cell>Low income</rr-table-cell>
        <rr-table-cell numeric>1,200</rr-table-cell>
      </rr-table-row>
      <rr-table-row>
        <rr-table-cell>Thin file</rr-table-cell>
        <rr-table-cell numeric>8,400</rr-table-cell>
      </rr-table-row>
    </rr-table>
  `,
};
