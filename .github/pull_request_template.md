<!-- One concern per PR, aim for under ~200 changed lines. Split mechanical
     changes (regenerated artifacts) from logic where you can. -->

## What & why

<!-- A few sentences: the change, and the reason it exists. Link the issue. -->

## Checklist (from CONTRIBUTING.md — CI enforces most of these)

- [ ] Rebased on current `main` (`git fetch origin && git rebase origin/main`)
- [ ] `npm run validate` passes
- [ ] Ran the tests CI runs: `npm test --workspaces --if-present` **and** `npm run test:unit -- --run`
- [ ] Tokens changed → `npm run build:all` ran and `build/` output is committed
- [ ] Component/metadata changed → `npm run build:meta` + `npm run docs:components` ran and regenerated artifacts (`design-system.json`, CEM, MDX) are committed
- [ ] Stories added/changed → visual baselines regenerated **on the CI runner** (dispatch "Update visual baselines" on this branch after your final push — its bot commit leaves the CI run in "action required"; re-run it from the Actions tab)
- [ ] Decisions that would surprise a later reader are recorded in `docs/decisions.md`

## Verification

<!-- What you ran and what it showed. Test counts, screenshots for visual work. -->
