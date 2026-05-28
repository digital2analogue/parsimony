import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './skeleton.js';
import type { RrSkeleton } from './skeleton.js';

function createSkeleton(variant?: 'text' | 'circular' | 'rectangular'): RrSkeleton {
  const el = document.createElement('rr-skeleton') as RrSkeleton;
  if (variant) el.variant = variant;
  document.body.appendChild(el);
  return el;
}

describe('rr-skeleton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default variant text', async () => {
    const el = createSkeleton();
    await el.updateComplete;
    expect(el.variant).toBe('text');
  });

  it('reflects variant attribute', async () => {
    const el = createSkeleton('circular');
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('circular');
  });

  it('renders all three variants', async () => {
    for (const v of ['text', 'circular', 'rectangular'] as const) {
      document.body.innerHTML = '';
      const el = createSkeleton(v);
      await el.updateComplete;
      expect(el.variant).toBe(v);
    }
  });

  it('renders a span with role="presentation"', async () => {
    const el = createSkeleton();
    await el.updateComplete;
    const span = el.shadowRoot!.querySelector('span');
    expect(span).toBeTruthy();
    expect(span!.getAttribute('role')).toBe('presentation');
  });

  it('span is aria-hidden', async () => {
    const el = createSkeleton();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('span')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies custom width and height via style', async () => {
    const el = createSkeleton('rectangular');
    el.width = '300px';
    el.height = '180px';
    await el.updateComplete;
    const span = el.shadowRoot!.querySelector('span') as HTMLElement;
    expect(span.style.width).toBe('300px');
    expect(span.style.height).toBe('180px');
  });

  it('defaults circular size to 40px × 40px', async () => {
    const el = createSkeleton('circular');
    await el.updateComplete;
    const span = el.shadowRoot!.querySelector('span') as HTMLElement;
    expect(span.style.width).toBe('40px');
    expect(span.style.height).toBe('40px');
  });

  it('defaults text height to 1em', async () => {
    const el = createSkeleton('text');
    await el.updateComplete;
    const span = el.shadowRoot!.querySelector('span') as HTMLElement;
    expect(span.style.height).toBe('1em');
  });

  it('has skeleton CSS class', async () => {
    const el = createSkeleton();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.skeleton')).toBeTruthy();
  });

  it('has no a11y violations — text', async () => {
    createSkeleton('text');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — circular', async () => {
    createSkeleton('circular');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — rectangular', async () => {
    createSkeleton('rectangular');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
