// story-ui configuration — https://github.com/southleft/story-ui
//
// story-ui is the AI bridge between this design system and Storybook: it turns
// a natural-language prompt into a .stories.ts file built from the real rr-*
// web components. It reads ./story-ui-considerations.md (generated from
// design-system.json + ai/rules.md by `npm run build:considerations`) so the
// AI knows the components, their props, and the non-negotiable token rules.
//
// This package is ESM, so the config is written as ESM (`export default`).
// Run the server with `npm run story-ui` from this workspace.

export default {
  componentFramework: 'web-components',

  // Barrel import: `import '@riverromney/components'` registers every <rr-*>
  // custom element as a side effect. The package exports map only exposes the
  // barrel, so per-component deep imports must NOT be used.
  importPath: '@riverromney/components',
  importStyle: 'barrel',

  // Generated stories land here, kept apart from the hand-authored baseline
  // stories so they are easy to review (and regenerate) in isolation.
  generatedStoriesPath: './src/stories/generated/',
  storyPrefix: 'Generated/',
  defaultAuthor: 'Story UI AI',

  llmProvider: 'claude',

  importExamples: [
    "import '@riverromney/components'; // registers <rr-badge>, <rr-button>, <rr-input>, …",
  ],
};
