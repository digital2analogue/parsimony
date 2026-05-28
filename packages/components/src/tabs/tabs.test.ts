import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './tab.js';
import './tab-list.js';
import type { RrTab } from './tab.js';
import type { RrTabList } from './tab-list.js';

function createElement(markup: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

function createTabList(value = 'a'): RrTabList {
  return createElement(`
    <rr-tab-list label="Sections" value="${value}">
      <rr-tab value="a">Tab A</rr-tab>
      <rr-tab value="b">Tab B</rr-tab>
      <rr-tab value="c">Tab C</rr-tab>
    </rr-tab-list>
  `) as RrTabList;
}

describe('rr-tab', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders a button with role="tab"', async () => {
    const el = createElement('<rr-tab value="x">Tab X</rr-tab>') as RrTab;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="tab"]')).toBeTruthy();
  });

  it('reflects value attribute', async () => {
    const el = createElement('<rr-tab value="test">Tab</rr-tab>') as RrTab;
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('test');
  });

  it('aria-selected is false by default', async () => {
    const el = createElement('<rr-tab value="x">Tab X</rr-tab>') as RrTab;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-selected')).toBe('false');
  });

  it('aria-selected is true when selected', async () => {
    const el = createElement('<rr-tab value="x">Tab X</rr-tab>') as RrTab;
    (el as RrTab).selected = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="tab"]')!.getAttribute('aria-selected')).toBe('true');
  });

  it('dispatches rr-tab-select on click', async () => {
    const el = createElement('<rr-tab value="x">Tab X</rr-tab>') as RrTab;
    await el.updateComplete;
    let detail: { value: string } | null = null;
    el.addEventListener('rr-tab-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    el.shadowRoot!.querySelector('button')!.click();
    expect(detail).toEqual({ value: 'x' });
  });

  it('does not dispatch when disabled', async () => {
    const el = createElement('<rr-tab value="x" disabled>Tab X</rr-tab>') as RrTab;
    await el.updateComplete;
    let fired = false;
    el.addEventListener('rr-tab-select', () => { fired = true; });
    el.shadowRoot!.querySelector('button')!.click();
    expect(fired).toBe(false);
  });
});

describe('rr-tab-list', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders slot inside role="tablist"', async () => {
    const el = createTabList();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="tablist"]')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('[role="tablist"] slot')).toBeTruthy();
  });

  it('sets aria-label from label prop', async () => {
    const el = createTabList();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Sections');
  });

  it('marks the matching tab as selected', async () => {
    const el = createTabList('b');
    await el.updateComplete;
    const tabs = el.querySelectorAll('rr-tab') as NodeListOf<RrTab>;
    for (const t of tabs) await t.updateComplete;
    expect((el.querySelector('rr-tab[value="b"]') as RrTab).selected).toBe(true);
    expect((el.querySelector('rr-tab[value="a"]') as RrTab).selected).toBe(false);
  });

  it('updates value and syncs tabs when a tab is clicked', async () => {
    const el = createTabList('a');
    await el.updateComplete;
    const tabB = el.querySelector('rr-tab[value="b"]') as RrTab;
    await tabB.updateComplete;
    tabB.shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;
    expect(el.value).toBe('b');
    expect(tabB.selected).toBe(true);
    expect((el.querySelector('rr-tab[value="a"]') as RrTab).selected).toBe(false);
  });

  it('dispatches change event when tab is selected', async () => {
    const el = createTabList('a');
    await el.updateComplete;
    let detail: unknown = null;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const tabC = el.querySelector('rr-tab[value="c"]') as RrTab;
    tabC.shadowRoot!.querySelector('button')!.click();
    expect(detail).toEqual({ value: 'c' });
  });

  it('reflects value attribute when changed', async () => {
    const el = createTabList('a');
    await el.updateComplete;
    el.value = 'c';
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('c');
    expect((el.querySelector('rr-tab[value="c"]') as RrTab).selected).toBe(true);
  });

  it('has no a11y violations', async () => {
    createTabList('a');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations — with disabled tab', async () => {
    createElement(`
      <rr-tab-list label="Actions" value="first">
        <rr-tab value="first">First</rr-tab>
        <rr-tab value="second" disabled>Second</rr-tab>
      </rr-tab-list>
    `);
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
