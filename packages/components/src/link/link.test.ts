import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './link.js';
import type { RrLink } from './link.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-link', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default variant and href', async () => {
    const el = createElement('<rr-link href="/home">Home</rr-link>') as RrLink;
    await el.updateComplete;
    expect(el.variant).toBe('default');
    const anchor = el.shadowRoot!.querySelector('a')!;
    expect(anchor.getAttribute('href')).toBe('/home');
  });

  it('reflects variant attribute', async () => {
    const el = createElement('<rr-link href="#" variant="muted">Info</rr-link>') as RrLink;
    await el.updateComplete;
    expect(el.variant).toBe('muted');
    expect(el.getAttribute('variant')).toBe('muted');
  });

  it('adds rel="noopener noreferrer" for target="_blank" automatically', async () => {
    const el = createElement('<rr-link href="https://example.com" target="_blank">External</rr-link>') as RrLink;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('a')!;
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not add rel when target is not _blank', async () => {
    const el = createElement('<rr-link href="/page">Page</rr-link>') as RrLink;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('a')!;
    expect(anchor.getAttribute('rel')).toBeNull();
  });

  it('respects explicit rel override', async () => {
    const el = createElement('<rr-link href="https://example.com" target="_blank" rel="noopener">Link</rr-link>') as RrLink;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('a')!;
    expect(anchor.getAttribute('rel')).toBe('noopener');
  });

  it('forwards aria-label to the anchor', async () => {
    const el = createElement('<rr-link href="/docs" aria-label="Read the docs">Docs</rr-link>') as RrLink;
    await el.updateComplete;
    const anchor = el.shadowRoot!.querySelector('a')!;
    expect(anchor.getAttribute('aria-label')).toBe('Read the docs');
  });

  it('has no a11y violations — default', async () => {
    createElement('<rr-link href="/home">Home</rr-link>');
    await (document.querySelector('rr-link') as RrLink).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — external link', async () => {
    createElement('<rr-link href="https://example.com" target="_blank">Visit site</rr-link>');
    await (document.querySelector('rr-link') as RrLink).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — all variants', async () => {
    document.body.innerHTML = `
      <rr-link href="/a">Default</rr-link>
      <rr-link href="/b" variant="muted">Muted</rr-link>
      <rr-link href="/c" variant="subtle">Subtle</rr-link>
    `;
    for (const el of document.querySelectorAll('rr-link')) {
      await (el as RrLink).updateComplete;
    }
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
