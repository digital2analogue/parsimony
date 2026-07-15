import { defineConfig, devices } from '@playwright/test';

// Visual regression over the built Storybook. Screenshots are compared
// against committed baselines in tests/visual/__screenshots__/ (linux
// baselines — generated ON the CI runner, never locally; font
// rasterization differs across machines). After an intentional visual
// change, run the "Update visual baselines" workflow from the Actions tab.
//
// Requires storybook-static/ to exist: `npm run build-storybook` first
// (the root `npm run test:visual` chains it; CI builds it earlier in the
// verify job).
export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
    baseURL: 'http://localhost:6100',
    // Small viewport: shots capture #storybook-root, which spans the
    // viewport — keep the canvas (and the committed PNGs) compact.
    viewport: { width: 800, height: 480 },
    // The components honor prefers-reduced-motion (spinner/skeleton/progress
    // freeze), which combined with animations: 'disabled' keeps shots stable.
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npx http-server storybook-static -p 6100 -s',
    url: 'http://localhost:6100/iframe.html',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
