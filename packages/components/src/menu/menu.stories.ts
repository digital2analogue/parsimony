import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@digital2analogue2/parsimony-components';

const meta: Meta = {
  title: 'Components/Menu',
  component: 'rr-menu',
  argTypes: {
    placement: { control: 'select', options: ['bottom-start', 'bottom-end'] },
    open: { control: 'boolean' },
  },
  args: {
    placement: 'bottom-start',
    open: true,
  },
  render: ({ placement, open }) => html`
    <div style="min-height: 220px;">
      <rr-menu label="Row actions" placement=${placement} ?open=${open}>
        <rr-button slot="trigger" variant="secondary">Actions</rr-button>
        <rr-menu-item value="edit">Edit rule</rr-menu-item>
        <rr-menu-item value="duplicate">Duplicate</rr-menu-item>
        <rr-menu-item value="archive" disabled>Archive</rr-menu-item>
        <rr-menu-item value="delete" danger>Delete rule</rr-menu-item>
      </rr-menu>
    </div>
  `,
};
export default meta;

type Story = StoryObj;

export const Open: Story = {};

export const Closed: Story = { args: { open: false } };

export const BottomEnd: Story = {
  render: () => html`
    <div style="min-height: 220px; display: flex; justify-content: flex-end;">
      <rr-menu label="Row actions" placement="bottom-end" open>
        <rr-button slot="trigger" variant="secondary">Actions</rr-button>
        <rr-menu-item value="edit">Edit rule</rr-menu-item>
        <rr-menu-item value="duplicate">Duplicate</rr-menu-item>
        <rr-menu-item value="delete" danger>Delete rule</rr-menu-item>
      </rr-menu>
    </div>
  `,
};

export const DangerAndDisabled: Story = {
  render: () => html`
    <div style="min-height: 220px;">
      <rr-menu label="Rule actions" open>
        <rr-button slot="trigger" variant="ghost">More</rr-button>
        <rr-menu-item value="rename">Rename</rr-menu-item>
        <rr-menu-item value="export" disabled>Export (soon)</rr-menu-item>
        <rr-menu-item value="delete" danger>Delete</rr-menu-item>
      </rr-menu>
    </div>
  `,
};
