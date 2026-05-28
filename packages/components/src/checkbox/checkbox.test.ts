import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './checkbox.js';
import type { RrCheckbox } from './checkbox.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-checkbox', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders unchecked by default', async () => {
    const el = createElement('<rr-checkbox label="Accept"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(el.getAttribute('checked')).toBeNull();
  });

  it('renders checked when attribute is set', async () => {
    const el = createElement('<rr-checkbox checked label="Accept"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(el.getAttribute('checked')).toBe('');
  });

  it('reflects checked property to attribute', async () => {
    const el = createElement('<rr-checkbox label="Accept"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    el.checked = true;
    await el.updateComplete;
    expect(el.getAttribute('checked')).toBe('');
  });

  it('reflects indeterminate attribute', async () => {
    const el = createElement('<rr-checkbox indeterminate label="Partial"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    expect(el.indeterminate).toBe(true);
  });

  it('reflects disabled attribute', async () => {
    const el = createElement('<rr-checkbox disabled label="Disabled"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    expect(el.disabled).toBe(true);
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.disabled).toBe(true);
  });

  it('sets aria-checked="mixed" for indeterminate state', async () => {
    const el = createElement('<rr-checkbox indeterminate label="Partial"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('sets aria-checked="true" when checked', async () => {
    const el = createElement('<rr-checkbox checked label="Accept"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('dispatches change event on native input change', async () => {
    const el = createElement('<rr-checkbox label="Accept"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    const input = el.shadowRoot!.querySelector('input')!;
    input.click();
    expect(fired).toBe(true);
    expect(el.checked).toBe(true);
  });

  it('clears indeterminate state when toggled', async () => {
    const el = createElement('<rr-checkbox indeterminate label="Partial"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    input.click();
    await el.updateComplete;
    expect(el.indeterminate).toBe(false);
  });

  it('ignores clicks when disabled', async () => {
    const el = createElement('<rr-checkbox disabled label="Disabled"></rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el._onChange();  // call directly since disabled input won't fire change
    expect(fired).toBe(false);
    expect(el.checked).toBe(false);
  });

  it('uses slotted content as label when label prop is empty', async () => {
    const el = createElement('<rr-checkbox>Subscribe</rr-checkbox>') as RrCheckbox;
    await el.updateComplete;
    expect(el.textContent?.trim()).toBe('Subscribe');
  });

  it('has no a11y violations — unchecked', async () => {
    createElement('<rr-checkbox label="Accept terms"></rr-checkbox>');
    await (document.querySelector('rr-checkbox') as RrCheckbox).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — checked', async () => {
    createElement('<rr-checkbox checked label="Accept terms"></rr-checkbox>');
    await (document.querySelector('rr-checkbox') as RrCheckbox).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — indeterminate', async () => {
    createElement('<rr-checkbox indeterminate label="Select all"></rr-checkbox>');
    await (document.querySelector('rr-checkbox') as RrCheckbox).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — disabled', async () => {
    createElement('<rr-checkbox disabled label="Disabled option"></rr-checkbox>');
    await (document.querySelector('rr-checkbox') as RrCheckbox).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
