import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // Unit tests only — tests/visual/ is a Playwright suite (run via
    // `npm run test:visual`); vitest collecting it crashes on
    // Playwright-only APIs.
    include: ['src/**/*.test.ts'],
  },
});
