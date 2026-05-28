import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './textarea.js';
import type { RrTextarea } from './textarea.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-textarea', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default value and rows', async () => {
    const el = createElement('<rr-textarea label="Notes"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(el.rows).toBe(3);
    const ta = el.shadowRoot!.querySelector('textarea')!;
    expect(ta.rows).toBe(3);
  });

  it('reflects value via property', async () => {
    const el = createElement('<rr-textarea label="Notes"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    el.value = 'Hello world';
    await el.updateComplete;
    const ta = el.shadowRoot!.querySelector('textarea')!;
    expect(ta.value).toBe('Hello world');
  });

  it('reflects disabled attribute', async () => {
    const el = createElement('<rr-textarea disabled label="Notes"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.disabled).toBe(true);
    expect(el.shadowRoot!.querySelector('textarea')!.disabled).toBe(true);
  });

  it('reflects required attribute', async () => {
    const el = createElement('<rr-textarea required label="Notes"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.required).toBe(true);
    expect(el.shadowRoot!.querySelector('.required')).toBeTruthy();
  });

  it('shows helper text', async () => {
    const el = createElement('<rr-textarea label="Notes" helper-text="Max 500 chars"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')?.textContent).toBe('Max 500 chars');
  });

  it('shows error text and sets data-invalid', async () => {
    const el = createElement('<rr-textarea label="Notes" error-text="Too short"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.hasAttribute('data-invalid')).toBe(true);
    expect(el.shadowRoot!.querySelector('.error')?.textContent).toBe('Too short');
  });

  it('hides helper when error is present', async () => {
    const el = createElement('<rr-textarea label="Notes" helper-text="Hint" error-text="Error"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')).toBeNull();
  });

  it('respects rows property', async () => {
    const el = createElement('<rr-textarea label="Notes"></rr-textarea>') as RrTextarea;
    await el.updateComplete;
    el.rows = 6;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('textarea')!.rows).toBe(6);
  });

  it('has no a11y violations — default', async () => {
    createElement('<rr-textarea label="Notes"></rr-textarea>');
    await (document.querySelector('rr-textarea') as RrTextarea).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — disabled', async () => {
    createElement('<rr-textarea disabled label="Notes"></rr-textarea>');
    await (document.querySelector('rr-textarea') as RrTextarea).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — error state', async () => {
    createElement('<rr-textarea label="Notes" error-text="Required"></rr-textarea>');
    await (document.querySelector('rr-textarea') as RrTextarea).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
