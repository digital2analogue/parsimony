import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './radio.js';
import './radio-group.js';
import type { RrRadio } from './radio.js';
import type { RrRadioGroup } from './radio-group.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

function createGroup(value = ''): RrRadioGroup {
  const el = createElement(`
    <rr-radio-group label="Size" name="size" value="${value}">
      <rr-radio value="sm">Small</rr-radio>
      <rr-radio value="md">Medium</rr-radio>
      <rr-radio value="lg">Large</rr-radio>
    </rr-radio-group>
  `) as RrRadioGroup;
  return el;
}

describe('rr-radio', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders unchecked by default', async () => {
    const group = createGroup();
    await group.updateComplete;
    const radios = group.querySelectorAll('rr-radio') as NodeListOf<RrRadio>;
    for (const r of radios) {
      await r.updateComplete;
      expect(r.checked).toBe(false);
    }
  });

  it('reflects checked state to attribute', async () => {
    const group = createGroup('sm');
    await group.updateComplete;
    const sm = group.querySelector('rr-radio[value="sm"]') as RrRadio;
    await sm.updateComplete;
    expect(sm.checked).toBe(true);
    expect(sm.getAttribute('checked')).toBe('');
  });

  it('dispatches rr-radio-change event', async () => {
    const group = createGroup();
    await group.updateComplete;
    const md = group.querySelector('rr-radio[value="md"]') as RrRadio;
    await md.updateComplete;
    let eventFired = false;
    group.addEventListener('rr-radio-change', () => { eventFired = true; });
    md.shadowRoot!.querySelector('input')!.click();
    expect(eventFired).toBe(true);
  });
});

describe('rr-radio-group', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders legend and slot', async () => {
    const group = createGroup();
    await group.updateComplete;
    expect(group.shadowRoot!.querySelector('legend')?.textContent?.trim()).toBe('Size');
    expect(group.shadowRoot!.querySelector('slot')).toBeTruthy();
  });

  it('sets initial checked state based on value', async () => {
    const group = createGroup('md');
    await group.updateComplete;
    const radios = group.querySelectorAll('rr-radio') as NodeListOf<RrRadio>;
    for (const r of radios) await r.updateComplete;
    expect((group.querySelector('rr-radio[value="md"]') as RrRadio).checked).toBe(true);
    expect((group.querySelector('rr-radio[value="sm"]') as RrRadio).checked).toBe(false);
  });

  it('updates value and syncs radios when radio is selected', async () => {
    const group = createGroup();
    await group.updateComplete;
    const lg = group.querySelector('rr-radio[value="lg"]') as RrRadio;
    await lg.updateComplete;
    lg.shadowRoot!.querySelector('input')!.click();
    await group.updateComplete;
    expect(group.value).toBe('lg');
    expect(lg.checked).toBe(true);
    expect((group.querySelector('rr-radio[value="sm"]') as RrRadio).checked).toBe(false);
  });

  it('dispatches change event when selection changes', async () => {
    const group = createGroup();
    await group.updateComplete;
    let fired = false;
    group.addEventListener('change', () => { fired = true; });
    const md = group.querySelector('rr-radio[value="md"]') as RrRadio;
    await md.updateComplete;
    md.shadowRoot!.querySelector('input')!.click();
    expect(fired).toBe(true);
  });

  it('deselects previous radio when new one is selected', async () => {
    const group = createGroup('sm');
    await group.updateComplete;
    const md = group.querySelector('rr-radio[value="md"]') as RrRadio;
    await md.updateComplete;
    md.shadowRoot!.querySelector('input')!.click();
    await group.updateComplete;
    expect((group.querySelector('rr-radio[value="sm"]') as RrRadio).checked).toBe(false);
    expect(md.checked).toBe(true);
  });

  it('disables all radios when group is disabled', async () => {
    const el = createElement(`
      <rr-radio-group label="Size" disabled>
        <rr-radio value="sm">Small</rr-radio>
        <rr-radio value="md">Medium</rr-radio>
      </rr-radio-group>
    `) as RrRadioGroup;
    await el.updateComplete;
    const radios = el.querySelectorAll('rr-radio') as NodeListOf<RrRadio>;
    for (const r of radios) {
      await r.updateComplete;
      expect(r.disabled).toBe(true);
    }
  });

  it('shows error text when errorText is set', async () => {
    const group = createGroup();
    group.errorText = 'Please select a size';
    await group.updateComplete;
    expect(group.shadowRoot!.querySelector('.error')?.textContent).toBe('Please select a size');
  });

  it('shows horizontal layout with orientation="horizontal"', async () => {
    const el = createElement(`
      <rr-radio-group label="Size" orientation="horizontal">
        <rr-radio value="sm">Small</rr-radio>
        <rr-radio value="md">Medium</rr-radio>
      </rr-radio-group>
    `) as RrRadioGroup;
    await el.updateComplete;
    expect(el.getAttribute('orientation')).toBe('horizontal');
  });

  it('has no a11y violations — basic group', async () => {
    createGroup('md');
    const group = document.querySelector('rr-radio-group') as RrRadioGroup;
    await group.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — disabled group', async () => {
    createElement(`
      <rr-radio-group label="Pick one" disabled>
        <rr-radio value="a">Alpha</rr-radio>
        <rr-radio value="b">Beta</rr-radio>
      </rr-radio-group>
    `);
    const group = document.querySelector('rr-radio-group') as RrRadioGroup;
    await group.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
