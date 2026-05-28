import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './toggle.js';
import type { RrToggle } from './toggle.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-toggle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders off by default', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(el.getAttribute('checked')).toBeNull();
  });

  it('renders on when attribute is set', async () => {
    const el = createElement('<rr-toggle checked label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(el.getAttribute('checked')).toBe('');
  });

  it('reflects checked property to attribute', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    el.checked = true;
    await el.updateComplete;
    expect(el.getAttribute('checked')).toBe('');
  });

  it('reflects disabled attribute', async () => {
    const el = createElement('<rr-toggle disabled label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    expect(el.disabled).toBe(true);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.disabled).toBe(true);
  });

  it('renders native input with role="switch"', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('sets aria-checked="true" when on', async () => {
    const el = createElement('<rr-toggle checked label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked="false" when off', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('dispatches change event and toggles state', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    const input = el.shadowRoot!.querySelector('input')!;
    input.click();
    expect(fired).toBe(true);
    expect(el.checked).toBe(true);
  });

  it('toggling twice returns to off', async () => {
    const el = createElement('<rr-toggle label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    input.click();
    await el.updateComplete;
    input.click();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('ignores clicks when disabled', async () => {
    const el = createElement('<rr-toggle disabled label="Dark mode"></rr-toggle>') as RrToggle;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el._onChange();
    expect(fired).toBe(false);
    expect(el.checked).toBe(false);
  });

  it('uses slotted content as label when label prop is empty', async () => {
    const el = createElement('<rr-toggle>Notifications</rr-toggle>') as RrToggle;
    await el.updateComplete;
    expect(el.textContent?.trim()).toBe('Notifications');
  });

  it('has no a11y violations — off', async () => {
    createElement('<rr-toggle label="Dark mode"></rr-toggle>');
    await (document.querySelector('rr-toggle') as RrToggle).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — on', async () => {
    createElement('<rr-toggle checked label="Dark mode"></rr-toggle>');
    await (document.querySelector('rr-toggle') as RrToggle).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — disabled', async () => {
    createElement('<rr-toggle disabled label="Dark mode"></rr-toggle>');
    await (document.querySelector('rr-toggle') as RrToggle).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
