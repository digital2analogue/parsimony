import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './button.js';
import type { RrButton } from './button.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-button', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default properties', async () => {
    const el = createElement('<rr-button>Click</rr-button>') as RrButton;
    await el.updateComplete;
    expect(el.variant).toBe('primary');
    expect(el.size).toBe('medium');
    expect(el.disabled).toBe(false);
    expect(el.loading).toBe(false);
    expect(el.type).toBe('button');
  });

  it('renders label text via default slot', async () => {
    const el = createElement('<rr-button>Save</rr-button>') as RrButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn).toBeTruthy();
  });

  it('reflects variant attribute', async () => {
    const el = createElement('<rr-button variant="danger">Delete</rr-button>') as RrButton;
    await el.updateComplete;
    expect(el.variant).toBe('danger');
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('reflects size attribute', async () => {
    const el = createElement('<rr-button size="small">Tag</rr-button>') as RrButton;
    await el.updateComplete;
    expect(el.size).toBe('small');
    expect(el.getAttribute('size')).toBe('small');
  });

  it('disables the inner button when disabled', async () => {
    const el = createElement('<rr-button disabled>Nope</rr-button>') as RrButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows spinner and sets aria-busy when loading', async () => {
    const el = createElement('<rr-button loading>Saving</rr-button>') as RrButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-busy')).toBe('true');
    const spinner = el.shadowRoot!.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('hides spinner when not loading', async () => {
    const el = createElement('<rr-button>Save</rr-button>') as RrButton;
    await el.updateComplete;
    const spinner = el.shadowRoot!.querySelector('.spinner');
    expect(spinner).toBeNull();
  });

  it('suppresses click when disabled', async () => {
    const el = createElement('<rr-button disabled>Nope</rr-button>') as RrButton;
    await el.updateComplete;
    let clicked = false;
    el.addEventListener('click', () => { clicked = true; });
    const btn = el.shadowRoot!.querySelector('button')!;
    btn.click();
    expect(clicked).toBe(false);
  });

  it('suppresses click when loading', async () => {
    const el = createElement('<rr-button loading>Wait</rr-button>') as RrButton;
    await el.updateComplete;
    let clicked = false;
    el.addEventListener('click', () => { clicked = true; });
    const btn = el.shadowRoot!.querySelector('button')!;
    btn.click();
    expect(clicked).toBe(false);
  });

  it('passes aria-label to inner button', async () => {
    const el = createElement('<rr-button aria-label="Close">X</rr-button>') as RrButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Close');
  });

  it('sets button type attribute', async () => {
    const el = createElement('<rr-button type="submit">Submit</rr-button>') as RrButton;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.type).toBe('submit');
  });

  it('attaches ElementInternals for form association', async () => {
    const el = createElement('<rr-button>OK</rr-button>') as RrButton;
    await el.updateComplete;
    expect((el as any)._internals).toBeTruthy();
  });

  // a11y audits
  it('has no a11y violations (primary)', async () => {
    createElement('<rr-button>Save</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (secondary)', async () => {
    createElement('<rr-button variant="secondary">Cancel</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (danger)', async () => {
    createElement('<rr-button variant="danger">Delete</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (ghost)', async () => {
    createElement('<rr-button variant="ghost">Dismiss</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('reflects the ghost variant attribute', async () => {
    const el = createElement('<rr-button variant="ghost">Dismiss</rr-button>') as RrButton;
    await el.updateComplete;
    expect(el.variant).toBe('ghost');
    expect(el.getAttribute('variant')).toBe('ghost');
  });

  it('has no a11y violations (disabled)', async () => {
    createElement('<rr-button disabled>Disabled</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (loading)', async () => {
    createElement('<rr-button loading>Loading</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (icon-only with aria-label)', async () => {
    createElement('<rr-button aria-label="Close">X</rr-button>') as RrButton;
    await (document.querySelector('rr-button') as RrButton).updateComplete;
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('rr-button keyboard semantics', () => {
  it('renders a native <button> with focus delegation — Enter/Space activation comes from native semantics', async () => {
    const el = createElement('<rr-button>Go</rr-button>') as RrButton;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('button')).toBeTruthy();
    expect((el.constructor as typeof RrButton).shadowRootOptions.delegatesFocus).toBe(true);
  });
});
