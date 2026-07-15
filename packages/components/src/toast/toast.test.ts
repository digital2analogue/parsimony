import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { axe } from 'vitest-axe';
import './toast.js';
import type { RrToast } from './toast.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-toast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default properties', async () => {
    const el = createElement('<rr-toast>Saved</rr-toast>') as RrToast;
    await el.updateComplete;
    expect(el.variant).toBe('neutral');
    expect(el.duration).toBe(0);
    expect(el.dismissible).toBe(true);
  });

  it('uses role=status with polite live region by default', async () => {
    const el = createElement('<rr-toast>Saved</rr-toast>') as RrToast;
    await el.updateComplete;
    const surface = el.shadowRoot!.querySelector('.toast')!;
    expect(surface.getAttribute('role')).toBe('status');
    expect(surface.getAttribute('aria-live')).toBe('polite');
  });

  it('escalates danger to role=alert with assertive live region', async () => {
    const el = createElement('<rr-toast variant="danger">Failed</rr-toast>') as RrToast;
    await el.updateComplete;
    const surface = el.shadowRoot!.querySelector('.toast')!;
    expect(surface.getAttribute('role')).toBe('alert');
    expect(surface.getAttribute('aria-live')).toBe('assertive');
  });

  it('renders heading when provided', async () => {
    const el = createElement('<rr-toast heading="Rule deleted">Undo available</rr-toast>') as RrToast;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.heading')!.textContent).toBe('Rule deleted');
  });

  it('dismiss button hides the toast and fires rr-toast-close with reason dismiss', async () => {
    const el = createElement('<rr-toast>Saved</rr-toast>') as RrToast;
    await el.updateComplete;
    let reason = '';
    el.addEventListener('rr-toast-close', (e) => (reason = (e as CustomEvent).detail.reason));
    (el.shadowRoot!.querySelector('.dismiss') as HTMLButtonElement).click();
    expect(el.hidden).toBe(true);
    expect(reason).toBe('dismiss');
  });

  it('hides the dismiss button when dismissible is false', async () => {
    const el = createElement('<rr-toast dismissible="false">Saved</rr-toast>') as RrToast;
    el.dismissible = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.dismiss')).toBeNull();
  });

  it('close() is idempotent — a second close dispatches no extra event', async () => {
    const el = createElement('<rr-toast>Saved</rr-toast>') as RrToast;
    await el.updateComplete;
    let fired = 0;
    el.addEventListener('rr-toast-close', () => fired++);
    el.dismiss();
    el.dismiss();
    expect(fired).toBe(1);
  });

  describe('auto-dismiss timer', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('auto-dismisses after duration with reason timeout', async () => {
      const el = createElement('<rr-toast duration="4000">Saved</rr-toast>') as RrToast;
      await el.updateComplete;
      let reason = '';
      el.addEventListener('rr-toast-close', (e) => (reason = (e as CustomEvent).detail.reason));
      vi.advanceTimersByTime(4001);
      expect(el.hidden).toBe(true);
      expect(reason).toBe('timeout');
    });

    it('duration 0 never auto-dismisses', async () => {
      const el = createElement('<rr-toast>Saved</rr-toast>') as RrToast;
      await el.updateComplete;
      vi.advanceTimersByTime(60_000);
      expect(el.hidden).toBe(false);
    });

    it('pauses the timer while hovered and resumes on leave', async () => {
      const el = createElement('<rr-toast duration="4000">Saved</rr-toast>') as RrToast;
      await el.updateComplete;
      const surface = el.shadowRoot!.querySelector('.toast')!;
      vi.advanceTimersByTime(2000);
      surface.dispatchEvent(new Event('mouseenter'));
      vi.advanceTimersByTime(60_000); // paused — nothing should happen
      expect(el.hidden).toBe(false);
      surface.dispatchEvent(new Event('mouseleave'));
      vi.advanceTimersByTime(2001); // remaining ~2000ms runs out
      expect(el.hidden).toBe(true);
    });
  });

  // a11y audits
  for (const variant of ['neutral', 'success', 'warning', 'danger', 'info']) {
    it(`has no a11y violations (${variant})`, async () => {
      createElement(`<rr-toast variant="${variant}" heading="Heads up">Message body</rr-toast>`);
      await (document.querySelector('rr-toast') as RrToast).updateComplete;
      const results = await axe(document.body, { rules: { region: { enabled: false } } });
      expect(results).toHaveNoViolations();
    });
  }
});
