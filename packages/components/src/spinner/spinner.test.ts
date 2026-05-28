import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './spinner.js';
import type { RrSpinner } from './spinner.js';

function createSpinner(): RrSpinner {
  const el = document.createElement('rr-spinner') as RrSpinner;
  document.body.appendChild(el);
  return el;
}

describe('rr-spinner', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default size md', async () => {
    const el = createSpinner();
    await el.updateComplete;
    expect(el.size).toBe('md');
  });

  it('reflects size attribute for all variants', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const el = createSpinner();
      el.size = size;
      await el.updateComplete;
      expect(el.getAttribute('size')).toBe(size);
    }
  });

  it('renders an SVG element', async () => {
    const el = createSpinner();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')).toBeTruthy();
  });

  it('SVG is aria-hidden', async () => {
    const el = createSpinner();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders default label in sr-only span', async () => {
    const el = createSpinner();
    await el.updateComplete;
    const srOnly = el.shadowRoot!.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly!.textContent?.trim()).toBe('Loading');
  });

  it('renders custom label text', async () => {
    const el = createSpinner();
    el.label = 'Saving changes…';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.sr-only')!.textContent?.trim()).toBe('Saving changes…');
  });

  it('sr-only span has role="status"', async () => {
    const el = createSpinner();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.sr-only')!.getAttribute('role')).toBe('status');
  });

  it('renders track and arc circles', async () => {
    const el = createSpinner();
    await el.updateComplete;
    const circles = el.shadowRoot!.querySelectorAll('circle');
    expect(circles.length).toBe(2);
    expect(circles[0].classList.contains('track')).toBe(true);
    expect(circles[1].classList.contains('arc')).toBe(true);
  });

  it('arc circle has stroke-dasharray for partial fill', async () => {
    const el = createSpinner();
    await el.updateComplete;
    const arc = el.shadowRoot!.querySelector('circle.arc')!;
    expect(arc.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('has no a11y violations — default', async () => {
    createSpinner();
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — sm size', async () => {
    const el = createSpinner();
    el.size = 'sm';
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — custom label', async () => {
    const el = createSpinner();
    el.label = 'Processing payment';
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
