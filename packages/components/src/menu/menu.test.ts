import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './menu.js';
import './menu-item.js';
import type { RrMenu } from './menu.js';
import type { RrMenuItem } from './menu-item.js';

function mount(): RrMenu {
  const tpl = document.createElement('template');
  tpl.innerHTML = `
    <rr-menu label="Row actions">
      <button slot="trigger">Actions</button>
      <rr-menu-item value="edit">Edit</rr-menu-item>
      <rr-menu-item value="duplicate">Duplicate</rr-menu-item>
      <rr-menu-item value="archive" disabled>Archive</rr-menu-item>
      <rr-menu-item value="delete" danger>Delete</rr-menu-item>
    </rr-menu>
  `.trim();
  const el = tpl.content.firstElementChild as RrMenu;
  document.body.appendChild(el);
  return el;
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));

function key(target: Element, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
}

describe('rr-menu', () => {
  let menu: RrMenu;
  let trigger: HTMLButtonElement;
  let items: RrMenuItem[];

  beforeEach(async () => {
    document.body.innerHTML = '';
    menu = mount();
    await menu.updateComplete;
    trigger = menu.querySelector('button')!;
    items = [...menu.querySelectorAll('rr-menu-item')] as RrMenuItem[];
    await Promise.all(items.map((i) => i.updateComplete));
  });

  it('starts closed with the popup hidden', () => {
    expect(menu.open).toBe(false);
    const popup = menu.shadowRoot!.querySelector('.menu')!;
    expect(popup.hasAttribute('hidden')).toBe(true);
  });

  it('wires ARIA onto the slotted trigger', () => {
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('items carry role=menuitem; disabled items get aria-disabled', () => {
    expect(items[0].getAttribute('role')).toBe('menuitem');
    expect(items[2].getAttribute('aria-disabled')).toBe('true');
    expect(items[0].hasAttribute('aria-disabled')).toBe(false);
  });

  it('trigger click toggles the menu and aria-expanded', async () => {
    trigger.click();
    await menu.updateComplete;
    expect(menu.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await menu.updateComplete;
    expect(menu.open).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('fires rr-menu-toggle on open and close', async () => {
    const seen: boolean[] = [];
    menu.addEventListener('rr-menu-toggle', (e) =>
      seen.push((e as CustomEvent).detail.open)
    );
    trigger.click();
    await menu.updateComplete;
    trigger.click();
    await menu.updateComplete;
    expect(seen).toEqual([true, false]);
  });

  it('ArrowDown on the trigger opens and focuses the first enabled item', async () => {
    trigger.focus();
    key(trigger, 'ArrowDown');
    await menu.updateComplete;
    await nextFrame();
    expect(menu.open).toBe(true);
    expect(document.activeElement).toBe(items[0]);
  });

  it('ArrowUp on the trigger opens and focuses the last enabled item', async () => {
    trigger.focus();
    key(trigger, 'ArrowUp');
    await menu.updateComplete;
    await nextFrame();
    expect(document.activeElement).toBe(items[3]); // danger item; archive is disabled
  });

  it('arrow keys move through enabled items, skipping disabled and wrapping', async () => {
    menu.show('first');
    await menu.updateComplete;
    await nextFrame();
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'ArrowDown');
    expect(document.activeElement).toBe(items[1]);
    key(items[1], 'ArrowDown'); // skips disabled archive
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'ArrowDown'); // wraps
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'ArrowUp'); // wraps backward
    expect(document.activeElement).toBe(items[3]);
  });

  it('Home and End jump to the first and last enabled item', async () => {
    menu.show('first');
    await menu.updateComplete;
    await nextFrame();
    key(items[0], 'End');
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'Home');
    expect(document.activeElement).toBe(items[0]);
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    menu.show('first');
    await menu.updateComplete;
    await nextFrame();
    key(items[0], 'Escape');
    await menu.updateComplete;
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('selecting an item fires rr-menu-select, closes, and refocuses the trigger', async () => {
    menu.show('first');
    await menu.updateComplete;
    let value = '';
    menu.addEventListener('rr-menu-select', (e) => (value = (e as CustomEvent).detail.value));
    items[1].click();
    await menu.updateComplete;
    expect(value).toBe('duplicate');
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('Enter activates the focused item', async () => {
    menu.show('first');
    await menu.updateComplete;
    await nextFrame();
    let value = '';
    menu.addEventListener('rr-menu-select', (e) => (value = (e as CustomEvent).detail.value));
    key(items[0], 'Enter');
    await menu.updateComplete;
    expect(value).toBe('edit');
    expect(menu.open).toBe(false);
  });

  it('disabled items do not select', async () => {
    menu.show();
    await menu.updateComplete;
    let fired = 0;
    menu.addEventListener('rr-menu-select', () => fired++);
    items[2].click();
    await menu.updateComplete;
    expect(fired).toBe(0);
    expect(menu.open).toBe(true);
  });

  it('pointerdown outside closes the menu', async () => {
    menu.show();
    await menu.updateComplete;
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await menu.updateComplete;
    expect(menu.open).toBe(false);
  });

  it('pointerdown inside does not close the menu', async () => {
    menu.show();
    await menu.updateComplete;
    items[0].dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await menu.updateComplete;
    expect(menu.open).toBe(true);
  });

  it('Tab closes the menu without stealing focus back', async () => {
    menu.show('first');
    await menu.updateComplete;
    await nextFrame();
    key(items[0], 'Tab');
    await menu.updateComplete;
    expect(menu.open).toBe(false);
    expect(document.activeElement).not.toBe(trigger);
  });

  it('has no a11y violations while open', async () => {
    menu.show();
    await menu.updateComplete;
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations while closed', async () => {
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
