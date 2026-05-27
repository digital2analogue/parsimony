import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './card.js';
import type { RrCard } from './card.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-card', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default padding', async () => {
    const el = createElement('<rr-card>Content</rr-card>') as RrCard;
    await el.updateComplete;
    expect(el.padding).toBe('md');
    expect(el.getAttribute('padding')).toBe('md');
  });

  it('reflects padding attribute', async () => {
    const el = createElement('<rr-card padding="lg">Content</rr-card>') as RrCard;
    await el.updateComplete;
    expect(el.padding).toBe('lg');
  });

  it('renders slotted body content', async () => {
    const el = createElement('<rr-card>Hello card</rr-card>') as RrCard;
    await el.updateComplete;
    expect(el.textContent?.trim()).toBe('Hello card');
  });

  it('renders named header and footer slots', async () => {
    const el = createElement(`
      <rr-card>
        <span slot="header">Title</span>
        Body
        <span slot="footer">Meta</span>
      </rr-card>
    `) as RrCard;
    await el.updateComplete;
    const header = el.querySelector('[slot="header"]');
    const footer = el.querySelector('[slot="footer"]');
    expect(header?.textContent).toBe('Title');
    expect(footer?.textContent).toBe('Meta');
  });

  it('has no a11y violations — body only', async () => {
    createElement('<rr-card>Simple card content</rr-card>');
    await (document.querySelector('rr-card') as RrCard).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — header + body + footer', async () => {
    createElement(`
      <rr-card>
        <h2 slot="header">Card title</h2>
        <p>Card body text.</p>
        <span slot="footer">Last updated today</span>
      </rr-card>
    `);
    await (document.querySelector('rr-card') as RrCard).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
