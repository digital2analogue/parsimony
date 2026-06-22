// Custom Elements Manifest analyzer config.
//
// Why this exists: `cem analyze` scans source for custom elements, but its
// default file set pulls in anything under the package — including the
// Storybook *.stories.ts files, which are not components and must not leak
// into custom-elements.json / design-system.json (doing so breaks the CI
// artifact-staleness gate). Pinning globs to src and excluding test + story
// files keeps the manifest deterministic and limited to real components.

export default {
  globs: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.stories.ts'],
  litelement: true,
};
