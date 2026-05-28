import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './dialog.js';
import type { RrDialog } from './dialog.js';

function createDialog(heading = 'Test Dialog'): RrDialog {
  const el = document.createElement('rr-dialog') as RrDialog;
  el.heading = heading;
  el.innerHTML = '<p>Dialog body content.</p>';
  document.body.appendChild(el);
  return el;
}

describe('rr-dialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with closed state by default', async () => {
    const el = createDialog();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('renders heading text', async () => {
    const el = createDialog('Confirm delete');
    await el.updateComplete;
    const heading = el.shadowRoot!.querySelector('.heading');
    expect(heading?.textContent?.trim()).toBe('Confirm delete');
  });

  it('renders close button with accessible label', async () => {
    const el = createDialog();
    await el.updateComplete;
    const btn = el.shadowRoot!.querySelector('.close-btn');
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute('aria-label')).toBe('Close dialog');
  });

  it('sets open property when show() is called', async () => {
    const el = createDialog();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('sets open to false when close() is called', async () => {
    const el = createDialog();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    el.close();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('reflects open attribute', async () => {
    const el = createDialog();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('dispatches rr-dialog-close when close() is called', async () => {
    const el = createDialog();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    let fired = false;
    el.addEventListener('rr-dialog-close', () => { fired = true; });
    el.close();
    await el.updateComplete;
    expect(fired).toBe(true);
  });

  it('has footer slot', async () => {
    const el = createDialog();
    const btn = document.createElement('button');
    btn.slot = 'footer';
    btn.textContent = 'OK';
    el.appendChild(btn);
    await el.updateComplete;
    const footerSlot = el.shadowRoot!.querySelector('.footer slot[name="footer"]');
    expect(footerSlot).toBeTruthy();
  });

  it('has default slot for body content', async () => {
    const el = createDialog();
    await el.updateComplete;
    const defaultSlot = el.shadowRoot!.querySelector('.body slot:not([name])');
    expect(defaultSlot).toBeTruthy();
  });

  it('renders inner dialog element', async () => {
    const el = createDialog();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('dialog')).toBeTruthy();
  });

  it('closeOnBackdrop defaults to true', async () => {
    const el = createDialog();
    await el.updateComplete;
    expect(el.closeOnBackdrop).toBe(true);
  });

  it('has no a11y violations — closed state', async () => {
    createDialog('Accessible Dialog');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — open state', async () => {
    const el = createDialog('Accessible Open Dialog');
    el.show();
    await el.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
