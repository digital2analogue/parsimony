import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './progress.js';
import type { RrProgress } from './progress.js';

function createProgress(attrs: Partial<{ value: number; max: number; label: string; indeterminate: boolean }> = {}): RrProgress {
  const el = document.createElement('rr-progress') as RrProgress;
  if (attrs.value !== undefined) el.value = attrs.value;
  if (attrs.max !== undefined) el.max = attrs.max;
  if (attrs.label !== undefined) el.label = attrs.label;
  if (attrs.indeterminate) el.indeterminate = true;
  document.body.appendChild(el);
  return el;
}

describe('rr-progress', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default value 0', async () => {
    const el = createProgress({ label: 'Loading' });
    await el.updateComplete;
    expect(el.value).toBe(0);
  });

  it('renders track with role="progressbar"', async () => {
    const el = createProgress({ label: 'Progress' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it('sets aria-valuenow to the current value', async () => {
    const el = createProgress({ value: 40, label: 'Progress' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('40');
  });

  it('sets aria-valuemax to the max value', async () => {
    const el = createProgress({ max: 200, label: 'Progress' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')!.getAttribute('aria-valuemax')).toBe('200');
  });

  it('always sets aria-valuemin to 0', async () => {
    const el = createProgress({ label: 'Progress' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')!.getAttribute('aria-valuemin')).toBe('0');
  });

  it('sets aria-label to the label prop', async () => {
    const el = createProgress({ label: 'Upload progress' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="progressbar"]')!.getAttribute('aria-label')).toBe('Upload progress');
  });

  it('clamps fill width at 0%', async () => {
    const el = createProgress({ value: -10, label: 'Progress' });
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('clamps fill width at 100%', async () => {
    const el = createProgress({ value: 999, label: 'Progress' });
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('computes correct fill percentage', async () => {
    const el = createProgress({ value: 50, max: 200, label: 'Progress' });
    await el.updateComplete;
    const fill = el.shadowRoot!.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('sets aria-busy and omits aria-valuenow in indeterminate mode', async () => {
    const el = createProgress({ indeterminate: true, label: 'Loading' });
    await el.updateComplete;
    const track = el.shadowRoot!.querySelector('[role="progressbar"]')!;
    expect(track.getAttribute('aria-busy')).toBe('true');
    expect(track.getAttribute('aria-valuenow')).toBeNull();
  });

  it('reflects indeterminate attribute', async () => {
    const el = createProgress({ indeterminate: true, label: 'Loading' });
    await el.updateComplete;
    expect(el.hasAttribute('indeterminate')).toBe(true);
  });

  it('has no a11y violations — determinate', async () => {
    createProgress({ value: 60, label: 'Upload progress' });
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — indeterminate', async () => {
    createProgress({ indeterminate: true, label: 'Loading content' });
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
