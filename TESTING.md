# Testing Guide — Parsimony

This guide explains how to run unit and visual regression tests for the Parsimony design system.

## Quick Start

```bash
# Install dependencies
npm install

# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:ui

# Run visual regression tests
npm run test:visual
```

## Unit Testing (Vitest)

Unit tests validate token structure, build processes, and utility functions.

**Framework:** Vitest (modern, fast, ESM-first)  
**Test files:** `tests/unit/**/*.spec.ts`  
**Environment:** Node.js (Parsimony is not a browser component library)

### Example unit test

```typescript
// tests/unit/tokens.spec.ts
import { describe, it, expect } from 'vitest'

describe('Token Structure', () => {
  it('validates color token format', () => {
    const token = {
      name: 'primary',
      value: '#000000',
      type: 'color',
    }
    
    expect(token).toHaveProperty('name')
    expect(token).toHaveProperty('value')
    expect(token).toHaveProperty('type')
    expect(token.value).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
```

### Run unit tests

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (re-runs on file changes)
npm run test:unit:ui

# Run a specific test file
npm run test:unit tests/unit/tokens.spec.ts

# Run tests matching a pattern
npm run test:unit -- --grep "token"
```

## Visual Regression Testing (Playwright)

Visual regression tests ensure that the design system's rendered output (design tokens applied to HTML) matches expectations across browsers.

**Framework:** Playwright (open-source, powerful)  
**Test files:** `tests/visual/**/*.spec.ts`

### Example visual test

This is useful if Parsimony has a Storybook or component showcase:

```typescript
// tests/visual/tokens.spec.ts
import { test, expect } from '@playwright/test'

test('color tokens render correctly', async ({ page }) => {
  // Visit a showcase page that displays all tokens
  await page.goto('file://.../token-showcase.html')
  
  // Snapshot the full page or a specific section
  await expect(page).toHaveScreenshot('color-tokens.png')
})
```

### Run visual tests

```bash
# Run all visual regression tests
npm run test:visual

# Run in headed mode (see browser)
npx playwright test --headed

# Update baselines after intentional changes
npm run test:visual -- --update-snapshots

# Debug
npx playwright test --debug
```

## CI/CD Integration

Both test suites run in CI environments:
- Unit tests run on every commit
- Visual tests run to validate rendering across browsers
- Reports generated in `test-results/`

## Best Practices for Parsimony

- **Test token values** — Validate hex, spacing, sizing rules
- **Test token consumption** — Verify CSS variables resolve correctly
- **Snapshot token renders** — If you have a showcase, visual tests catch drift
- **Update baselines carefully** — Token changes should be intentional
- **Run before publish** — All tests must pass before npm publish

## Troubleshooting

**"Tests not found"** — Ensure test files are in `tests/` directory with `.spec.ts` extension

**Visual test errors** — Playwright needs a file:// URL or HTTP server if testing HTML files

**Monorepo workspace tests** — Run per-workspace with:
```bash
npm run test --workspaces
```
