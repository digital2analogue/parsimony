import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './select.js';
import type { RrSelect } from './select.js';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

function createSelect(attrs = ''): RrSelect {
  const el = createElement(`<rr-select label="Pick one" ${attrs}></rr-select>`) as RrSelect;
  el.options = OPTIONS;
  return el;
}

describe('rr-select', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders label and select element', async () => {
    const el = createSelect();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('label')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('select')).toBeTruthy();
  });

  it('renders options from the options property', async () => {
    const el = createSelect();
    await el.updateComplete;
    const opts = el.shadowRoot!.querySelectorAll('option');
    expect(opts.length).toBe(3);
    expect(opts[0].value).toBe('a');
    expect(opts[1].value).toBe('b');
    expect(opts[2].value).toBe('c');
    expect(opts[2].disabled).toBe(true);
  });

  it('reflects value attribute', async () => {
    const el = createSelect();
    await el.updateComplete;
    el.value = 'b';
    await el.updateComplete;
    expect(el.value).toBe('b');
  });

  it('reflects disabled attribute', async () => {
    const el = createSelect('disabled');
    await el.updateComplete;
    expect(el.disabled).toBe(true);
    expect(el.getAttribute('disabled')).toBe('');
    const select = el.shadowRoot!.querySelector('select')!;
    expect(select.disabled).toBe(true);
  });

  it('shows helper text when no error', async () => {
    const el = createSelect();
    el.helperText = 'Choose wisely';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')?.textContent).toBe('Choose wisely');
  });

  it('shows error text and sets data-invalid', async () => {
    const el = createSelect();
    el.errorText = 'Required';
    await el.updateComplete;
    expect(el.hasAttribute('data-invalid')).toBe(true);
    expect(el.shadowRoot!.querySelector('.error')?.textContent).toBe('Required');
  });

  it('hides helper text when error is present', async () => {
    const el = createSelect();
    el.helperText = 'Choose wisely';
    el.errorText = 'Required';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')).toBeNull();
    expect(el.shadowRoot!.querySelector('.error')).toBeTruthy();
  });

  it('shows required asterisk', async () => {
    const el = createSelect('required');
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.required')).toBeTruthy();
  });

  it('has no a11y violations — default state', async () => {
    const el = createSelect();
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — disabled', async () => {
    const el = createSelect('disabled');
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — error state', async () => {
    const el = createSelect();
    el.errorText = 'Please select an option';
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
