import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './input.js';
import type { RrInput } from './input.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-input', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default properties', async () => {
    const el = createElement('<rr-input label="Name"></rr-input>') as RrInput;
    await el.updateComplete;
    expect(el.type).toBe('text');
    expect(el.value).toBe('');
    expect(el.disabled).toBe(false);
    expect(el.required).toBe(false);
  });

  it('renders label text', async () => {
    const el = createElement('<rr-input label="Email"></rr-input>') as RrInput;
    await el.updateComplete;
    const label = el.shadowRoot!.querySelector('label');
    expect(label).toBeTruthy();
    expect(label!.textContent).toContain('Email');
  });

  it('renders required indicator', async () => {
    const el = createElement('<rr-input label="Name" required></rr-input>') as RrInput;
    await el.updateComplete;
    const indicator = el.shadowRoot!.querySelector('.required');
    expect(indicator).toBeTruthy();
    expect(indicator!.textContent).toBe('*');
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('renders helper text', async () => {
    const el = createElement('<rr-input label="User" helper-text="Pick a name"></rr-input>') as RrInput;
    await el.updateComplete;
    const helper = el.shadowRoot!.querySelector('#helper');
    expect(helper).toBeTruthy();
    expect(helper!.textContent).toBe('Pick a name');
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-describedby')).toBe('helper');
  });

  it('shows error text and sets aria-invalid', async () => {
    const el = createElement('<rr-input label="Email" error-text="Invalid"></rr-input>') as RrInput;
    await el.updateComplete;
    const error = el.shadowRoot!.querySelector('#error');
    expect(error).toBeTruthy();
    expect(error!.textContent).toBe('Invalid');
    expect(error!.getAttribute('role')).toBe('alert');
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-errormessage')).toBe('error');
    expect(input.getAttribute('aria-describedby')).toBe('error');
  });

  it('hides helper text when error is shown', async () => {
    const el = createElement(
      '<rr-input label="X" helper-text="Help" error-text="Error"></rr-input>'
    ) as RrInput;
    await el.updateComplete;
    const helper = el.shadowRoot!.querySelector('#helper');
    const error = el.shadowRoot!.querySelector('#error');
    expect(helper).toBeNull();
    expect(error).toBeTruthy();
  });

  it('reflects disabled to inner input', async () => {
    const el = createElement('<rr-input label="X" disabled></rr-input>') as RrInput;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.disabled).toBe(true);
  });

  it('sets placeholder on inner input', async () => {
    const el = createElement('<rr-input label="X" placeholder="Type here"></rr-input>') as RrInput;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.placeholder).toBe('Type here');
  });

  it('updates value on input event', async () => {
    const el = createElement('<rr-input label="X"></rr-input>') as RrInput;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).toBe('hello');
  });

  it('attaches ElementInternals for form association', async () => {
    const el = createElement('<rr-input label="X" name="test" value="val"></rr-input>') as RrInput;
    await el.updateComplete;
    // ElementInternals is attached (setFormValue may not exist in test env)
    expect((el as any)._internals).toBeTruthy();
    // Value property syncs correctly
    el.value = 'updated';
    await el.updateComplete;
    expect(el.value).toBe('updated');
    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.value).toBe('updated');
  });

  it('has no a11y violations (default)', async () => {
    createElement('<rr-input label="Name"></rr-input>') as RrInput;
    await (document.querySelector('rr-input') as RrInput).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (error state)', async () => {
    createElement(
      '<rr-input label="Email" error-text="Invalid email"></rr-input>'
    ) as RrInput;
    await (document.querySelector('rr-input') as RrInput).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (disabled)', async () => {
    createElement('<rr-input label="Locked" disabled></rr-input>') as RrInput;
    await (document.querySelector('rr-input') as RrInput).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (required)', async () => {
    createElement('<rr-input label="Name" required></rr-input>') as RrInput;
    await (document.querySelector('rr-input') as RrInput).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
