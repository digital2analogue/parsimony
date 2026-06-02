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

This package is published to **GitHub Packages**, so consumers need a one-line
`.npmrc` telling npm where the `@riverromney` scope lives:

```ini
# .npmrc
@riverromney:registry=https://npm.pkg.github.com
```

Then:

```bash
npm install @riverromney/tokens
```

(Installing from GitHub Packages requires authenticating npm with a GitHub
token that has `read:packages`.)

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

### Maintainer note — publishing (Option A: GitHub Packages, `@riverromney` scope)

The scope stays `@riverromney` to match `@riverromney/components` and
`@riverromney/mcp`. GitHub Packages routes a package by the account matching its
scope, so `@riverromney/*` belongs to a `riverromney` GitHub org. This repo
stays under `digital2analogue` (to keep the Vercel integration untouched).

**One-time setup before the first publish:**

1. Create a free GitHub organization named **`riverromney`**.
2. Create a Personal Access Token with the **`write:packages`** scope on that
   org, and add it to this repo's Actions secrets as **`PACKAGES_TOKEN`**.
3. Run the **Publish @riverromney/tokens** workflow (Actions tab → Run workflow),
   or push a `tokens-v*` tag.

That's it — the package, build, and workflow (`.github/workflows/publish.yml`)
are ready. Preview the exact tarball anytime with
`npm pack --workspace @riverromney/tokens --dry-run`.

> Alternative: transfer this repo into the `riverromney` org instead of using a
> PAT — then the workflow's default `GITHUB_TOKEN` is sufficient. Heavier (it
> moves the repo URL and re-points the Vercel integration), so the PAT path
> above is the lighter default.
