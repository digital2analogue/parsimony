import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './badge.js';
import type { RrBadge } from './badge.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-badge', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default variant', async () => {
    const el = createElement('<rr-badge>Label</rr-badge>') as RrBadge;
    await el.updateComplete;
    expect(el.variant).toBe('default');
    expect(el.getAttribute('variant')).toBe('default');
    expect(el.shadowRoot!.querySelector('slot')).toBeTruthy();
  });

  it('reflects variant attribute to property', async () => {
    const el = createElement('<rr-badge variant="success">OK</rr-badge>') as RrBadge;
    await el.updateComplete;
    expect(el.variant).toBe('success');
  });

  it('reflects variant property to attribute', async () => {
    const el = createElement('<rr-badge>Test</rr-badge>') as RrBadge;
    await el.updateComplete;
    el.variant = 'danger';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('renders slotted content', async () => {
    const el = createElement('<rr-badge>Hello</rr-badge>') as RrBadge;
    await el.updateComplete;
    expect(el.textContent).toBe('Hello');
  });

  it('preserves role="status" on host', async () => {
    const el = createElement('<rr-badge role="status" variant="success">Live</rr-badge>');
    await (el as RrBadge).updateComplete;
    expect(el.getAttribute('role')).toBe('status');
  });

  const variants = [
    'default', 'success', 'warning', 'danger', 'info',
    'accent-green', 'accent-blue', 'accent-violet', 'accent-amber',
  ] as const;

  for (const variant of variants) {
    it(`has no a11y violations for variant="${variant}"`, async () => {
      const el = createElement(
        `<rr-badge variant="${variant}">${variant}</rr-badge>`
      ) as RrBadge;
      await el.updateComplete;
      const results = await axe(document.body, {
        rules: {
          // The badge is an inline element, not a page landmark.
          // The region rule tests page structure, not component correctness.
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  }
});
