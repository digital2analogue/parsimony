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

### Maintainer note — publishing

Publishing targets GitHub Packages (`publishConfig.registry`). GitHub Packages
associates a package with the **owner of the repository** in the `repository`
field (`digital2analogue`). Because the package scope (`@riverromney`) differs
from that owner login, the first publish needs one of:

- a GitHub organization named **`riverromney`** that owns (or is granted access
  to) this package, **or**
- publishing under the owner scope instead (`@digital2analogue/tokens`).

Until that's decided, `npm run build` produces the package contents locally and
`npm pack --dry-run` shows exactly what would ship — the plumbing is ready; only
the account/scope decision is outstanding. The publish workflow lives at
`.github/workflows/publish.yml` and runs on demand (never automatically).
