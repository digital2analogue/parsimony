import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
// Barrel side-effect import registers every rr-* element (see story-ui.config.js).
import '@digital2analogue2/parsimony-components';

const VARIANTS = [
  'default',
  'success',
  'warning',
  'danger',
  'info',
  'accent-green',
  'accent-blue',
  'accent-violet',
  'accent-amber',
] as const;

const meta: Meta = {
  title: 'Components/Badge',
  component: 'rr-badge',
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    label: { control: 'text' },
  },
  args: { variant: 'default', label: 'Badge' },
  render: ({ variant, label }) => html`<rr-badge variant=${variant}>${label}</rr-badge>`,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Success: Story = { args: { variant: 'success', label: 'Connected' } };

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-inline);">
      ${VARIANTS.map((v) => html`<rr-badge variant=${v}>${v}</rr-badge>`)}
    </div>
  `,
};
