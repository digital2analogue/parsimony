import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './icon.js';
import type { RrIcon } from './icon.js';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-icon', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders default size', async () => {
    const el = createElement(`<rr-icon>${SVG}</rr-icon>`) as RrIcon;
    await el.updateComplete;
    expect(el.size).toBe('default');
    expect(el.getAttribute('size')).toBe('default');
  });

  it('reflects size attribute', async () => {
    const el = createElement(`<rr-icon size="large">${SVG}</rr-icon>`) as RrIcon;
    await el.updateComplete;
    expect(el.size).toBe('large');
  });

  it('is aria-hidden by default (decorative)', async () => {
    const el = createElement(`<rr-icon>${SVG}</rr-icon>`) as RrIcon;
    await el.updateComplete;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('role')).toBe(false);
  });

  it('gets role="img" when aria-label is set', async () => {
    const el = createElement(`<rr-icon aria-label="Close">${SVG}</rr-icon>`) as RrIcon;
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('img');
    expect(el.hasAttribute('aria-hidden')).toBe(false);
  });

  it('removes aria-hidden when aria-label added dynamically', async () => {
    const el = createElement(`<rr-icon>${SVG}</rr-icon>`) as RrIcon;
    await el.updateComplete;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    el.ariaLabel = 'Settings';
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('img');
    expect(el.hasAttribute('aria-hidden')).toBe(false);
  });

  it('has no a11y violations — decorative', async () => {
    createElement(`<rr-icon>${SVG}</rr-icon>`);
    await (document.querySelector('rr-icon') as RrIcon).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — labelled', async () => {
    createElement(`<rr-icon aria-label="Go to home">${SVG}</rr-icon>`);
    await (document.querySelector('rr-icon') as RrIcon).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
