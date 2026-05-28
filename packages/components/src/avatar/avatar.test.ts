import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './avatar.js';
import type { RrAvatar } from './avatar.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-avatar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders default size and color', async () => {
    const el = createElement('<rr-avatar name="River Romney"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    expect(el.size).toBe('md');
    expect(el.color).toBe('default');
  });

  it('derives two-letter initials from a full name', async () => {
    const el = createElement('<rr-avatar name="River Romney"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    const initials = el.shadowRoot!.querySelector('[part="initials"]')!;
    expect(initials.textContent).toBe('RR');
  });

  it('derives one-letter initial from a single name', async () => {
    const el = createElement('<rr-avatar name="River"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="initials"]')!.textContent).toBe('R');
  });

  it('uses first and last word for multi-word names', async () => {
    const el = createElement('<rr-avatar name="John Michael Smith"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[part="initials"]')!.textContent).toBe('JS');
  });

  it('reflects size attribute', async () => {
    const el = createElement('<rr-avatar name="RR" size="lg"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    expect(el.size).toBe('lg');
    expect(el.getAttribute('size')).toBe('lg');
  });

  it('reflects color attribute', async () => {
    const el = createElement('<rr-avatar name="RR" color="indigo"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    expect(el.color).toBe('indigo');
    expect(el.getAttribute('color')).toBe('indigo');
  });

  it('renders an img when src is provided', async () => {
    const el = createElement('<rr-avatar name="River" src="/avatar.jpg"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    const img = el.shadowRoot!.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('/avatar.jpg');
    expect(el.shadowRoot!.querySelector('[part="initials"]')).toBeNull();
  });

  it('sets role=img and aria-label on initials avatar', async () => {
    const el = createElement('<rr-avatar name="River Romney"></rr-avatar>') as RrAvatar;
    await el.updateComplete;
    const avatar = el.shadowRoot!.querySelector('.avatar')!;
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('River Romney');
  });

  it('has no a11y violations — default initials', async () => {
    createElement('<rr-avatar name="River Romney"></rr-avatar>');
    await (document.querySelector('rr-avatar') as RrAvatar).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — all color variants', async () => {
    document.body.innerHTML = `
      <rr-avatar name="A B" color="default"></rr-avatar>
      <rr-avatar name="C D" color="indigo"></rr-avatar>
      <rr-avatar name="E F" color="sky"></rr-avatar>
      <rr-avatar name="G H" color="green"></rr-avatar>
      <rr-avatar name="I J" color="amber"></rr-avatar>
    `;
    for (const el of document.querySelectorAll('rr-avatar')) {
      await (el as RrAvatar).updateComplete;
    }
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — all sizes', async () => {
    document.body.innerHTML = `
      <rr-avatar name="R S" size="sm"></rr-avatar>
      <rr-avatar name="R S" size="md"></rr-avatar>
      <rr-avatar name="R S" size="lg"></rr-avatar>
      <rr-avatar name="R S" size="xl"></rr-avatar>
    `;
    for (const el of document.querySelectorAll('rr-avatar')) {
      await (el as RrAvatar).updateComplete;
    }
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
