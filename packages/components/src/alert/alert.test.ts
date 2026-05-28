import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './alert.js';
import type { RrAlert } from './alert.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-alert', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default variant (success)', async () => {
    const el = createElement('<rr-alert>All good!</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.variant).toBe('success');
    expect(el.shadowRoot!.querySelector('.alert')).toBeTruthy();
  });

  it('renders title when provided', async () => {
    const el = createElement('<rr-alert title="Success" variant="success">Done</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.title')?.textContent).toBe('Success');
  });

  it('does not render title element when title is empty', async () => {
    const el = createElement('<rr-alert>Done</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.title')).toBeNull();
  });

  it('reflects variant attribute', async () => {
    const el = createElement('<rr-alert variant="danger">Error</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.variant).toBe('danger');
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('does not show dismiss button when not dismissible', async () => {
    const el = createElement('<rr-alert>Info</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.dismiss')).toBeNull();
  });

  it('shows dismiss button when dismissible', async () => {
    const el = createElement('<rr-alert dismissible>Info</rr-alert>') as RrAlert;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.dismiss')).toBeTruthy();
  });

  it('hides when dismiss button is clicked', async () => {
    const el = createElement('<rr-alert dismissible>Info</rr-alert>') as RrAlert;
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector<HTMLButtonElement>('.dismiss')!;
    btn.click();
    await el.updateComplete;
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('dispatches close event on dismiss', async () => {
    const el = createElement('<rr-alert dismissible>Info</rr-alert>') as RrAlert;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('close', () => { fired = true; });
    el.shadowRoot!.querySelector<HTMLButtonElement>('.dismiss')!.click();
    expect(fired).toBe(true);
  });

  it('show() restores dismissed alert', async () => {
    const el = createElement('<rr-alert dismissible>Info</rr-alert>') as RrAlert;
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLButtonElement>('.dismiss')!.click();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  const variants = ['success', 'warning', 'danger', 'info'] as const;

  for (const variant of variants) {
    it(`has no a11y violations — ${variant}`, async () => {
      createElement(`<rr-alert variant="${variant}" title="${variant} title">${variant} message</rr-alert>`);
      await (document.querySelector('rr-alert') as RrAlert).updateComplete;
      const results = await axe(document.body, { rules: { region: { enabled: false } } });
      expect(results).toHaveNoViolations();
    });
  }

  it('has no a11y violations — dismissible', async () => {
    createElement('<rr-alert dismissible title="Heads up">This is important.</rr-alert>');
    await (document.querySelector('rr-alert') as RrAlert).updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
