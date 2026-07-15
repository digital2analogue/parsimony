import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Manifest-driven: one screenshot per story in the built Storybook, so a
// token or component-CSS change that shifts ANY story's rendering fails
// here instead of in a consumer repo. No hand-maintained story list —
// new stories are covered the moment they exist.
type StoryEntry = { id: string; type: string };

// cwd-relative, not import.meta.url — Playwright always runs from the
// package dir (config location), and URL-scheme tricks break under other
// collectors that might load this file.
const indexPath = resolve('storybook-static/index.json');
let entries: StoryEntry[] = [];
try {
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  entries = (Object.values(index.entries) as StoryEntry[]).filter(e => e.type === 'story');
} catch {
  throw new Error(
    'storybook-static/index.json not found — run `npm run build-storybook` before the visual suite.'
  );
}

for (const story of entries) {
  test(`story ${story.id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForSelector('#storybook-root > *');
    // Web-font swap is the classic flake — and neither document.fonts.ready
    // nor fonts.check() guards it: ready resolves even when a font FAILS to
    // load, and check() returns true when no matching @font-face is
    // registered at all. Demand a genuinely loaded brand face; fail loudly
    // if the runner can't fetch it rather than baking fallback baselines.
    await page.waitForFunction(
      async () => {
        const faces = [...document.fonts].filter(
          f => f.family.replace(/['"]/g, '') === 'Space Grotesk'
        );
        if (faces.length === 0) return false; // stylesheet not loaded (yet)
        await Promise.all(faces.map(f => f.load().catch(() => null)));
        // every, not some: Google serves each weight as its own @font-face,
        // and a missing 500 face falls back to serif while 300 "loaded".
        return faces.every(f => f.status === 'loaded');
      },
      undefined,
      { timeout: 15_000 }
    );
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story.id}.png`);
  });
}
