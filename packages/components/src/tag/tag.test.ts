import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import './tag.js';
import type { RrTag } from './tag.js';

function createElement(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild as HTMLElement;
  document.body.appendChild(el);
  return el;
}

describe('rr-tag', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with default variant', async () => {
    const el = createElement('<rr-tag>Design Systems</rr-tag>') as RrTag;
    await el.updateComplete;
    expect(el.variant).toBe('default');
    expect(el.getAttribute('variant')).toBe('default');
    expect(el.shadowRoot!.querySelector('slot')).toBeTruthy();
  });

  it('reflects variant attribute to property', async () => {
    const el = createElement('<rr-tag variant="subtle">Skill</rr-tag>') as RrTag;
    await el.updateComplete;
    expect(el.variant).toBe('subtle');
  });

  it('reflects variant property to attribute', async () => {
    const el = createElement('<rr-tag>Test</rr-tag>') as RrTag;
    await el.updateComplete;
    el.variant = 'subtle';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('subtle');
  });

  it('renders slotted content', async () => {
    const el = createElement('<rr-tag>Figma</rr-tag>') as RrTag;
    await el.updateComplete;
    expect(el.textContent).toBe('Figma');
  });

  const variants = ['default', 'subtle'] as const;

  for (const variant of variants) {
    it(`has no a11y violations for variant="${variant}"`, async () => {
      const el = createElement(
        `<rr-tag variant="${variant}">${variant}</rr-tag>`
      ) as RrTag;
      await el.updateComplete;
      const results = await axe(document.body, {
        rules: {
          // The tag is an inline label, not a page landmark.
          // The region rule tests page structure, not component correctness.
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  }
});
