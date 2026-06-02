# @riverromney/tokens

Built CSS custom properties for the River Romney design system. Install this
package instead of hand-copying the token block into each consumer repo — the
version you depend on is the version you get.

Ships one stylesheet per brand:

| Import | Brand |
|---|---|
| `@riverromney/tokens/base.css` | Base dark / phosphor theme (`.com`, `.design`) |
| `@riverromney/tokens/decision-engine.css` | Light enterprise inversion |
| `@riverromney/tokens/dot-art.css` | Pure-black canvas (`.art`) |
| `@riverromney/tokens/dot-blog.css` | Relaxed reading (`.blog`) |

## Install

Published to the **public npm registry** — no scope config or auth needed:

```bash
npm install @riverromney/tokens
```

## Use

Import the brand stylesheet once at your app's entry point; every semantic
token (`--color-*`, `--font-*`, `--spacing-*`) is then available globally:

```ts
import "@riverromney/tokens/base.css";
```

```css
.button {
  background: var(--color-background-action);
  color: var(--color-foreground-on-action);
  padding: var(--spacing-element);
}
```

## Versioning

The package version tracks the design system. A token **rename or removal** is a
breaking change → minor/major bump per semver. Consuming repos pin a version and
upgrade deliberately, which is the whole point: no more silent drift from a
copied CSS block.

---

### Maintainer note — publishing (public npm, `@riverromney` scope)

The scope stays `@riverromney` to match `@riverromney/components` and
`@riverromney/mcp`. Publishing to public npm keeps the scope independent of the
GitHub repo owner, so this repo stays under `digital2analogue` — no transfer, no
change to the Vercel wiring.

**One-time setup before the first publish:**

1. Own the **`@riverromney`** scope on [npmjs.com](https://www.npmjs.com) — create
   the free `riverromney` npm organization (public scoped packages are free).
2. Create an npm **Automation** access token and add it to this repo's Actions
   secrets as **`NPM_TOKEN`**.
3. Run the **Publish @riverromney/tokens** workflow (Actions tab → Run workflow),
   or push a `tokens-v*` tag.

That's it — the package, build, and workflow (`.github/workflows/publish.yml`)
are ready. Preview the exact tarball anytime with
`npm pack --workspace @riverromney/tokens --dry-run`.

> The package ships `"license": "UNLICENSED"` — publicly visible (a portfolio
> artifact), but not licensed for third-party reuse. Change the license field if
> you want to grant reuse.
