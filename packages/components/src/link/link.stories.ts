import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@riverromney/components';

const meta: Meta = {
  title: 'Components/Link',
  component: 'rr-link',
  argTypes: {
    href: { control: 'text' },
    target: { control: 'select', options: ['_self', '_blank', '_parent', '_top'] },
    rel: { control: 'text' },
    variant: { control: 'select', options: ['default', 'muted', 'subtle'] },
    'aria-label': { control: 'text' },
  },
  args: {
    href: '#',
    target: '_self',
    rel: '',
    variant: 'default',
    'aria-label': null,
  },
  render: ({ href, target, rel, variant, ['aria-label']: ariaLabel }) => html`
    <rr-link
      href=${href}
      target=${target}
      rel=${rel}
      variant=${variant}
      aria-label=${ariaLabel ?? ''}
    >Read the documentation</rr-link>
  `,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--spacing-inline);">
      <rr-link href="#" variant="default">Default</rr-link>
      <rr-link href="#" variant="muted">Muted</rr-link>
      <rr-link href="#" variant="subtle">Subtle</rr-link>
    </div>
  `,
};

export const External: Story = {
  args: { target: '_blank', rel: 'noopener' },
};
