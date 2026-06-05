# @digital2analogue2/tokens

Built CSS custom properties for the River Romney design system. Install this
package instead of hand-copying the token block into each consumer repo — the
version you depend on is the version you get.

Ships one stylesheet per brand:

| Import | Brand |
|---|---|
| `@digital2analogue2/tokens/base.css` | Base dark / phosphor theme (`.com`, `.design`) |
| `@digital2analogue2/tokens/decision-engine.css` | Light enterprise inversion |
| `@digital2analogue2/tokens/dot-art.css` | Pure-black canvas (`.art`) |
| `@digital2analogue2/tokens/dot-blog.css` | Relaxed reading (`.blog`) |

## Install

Published to the **public npm registry** — no scope config or auth needed:

```bash
npm install @digital2analogue2/tokens
```

## Use

Import the brand stylesheet once at your app's entry point; every semantic
token (`--color-*`, `--font-*`, `--spacing-*`) is then available globally:

```ts
import "@digital2analogue2/tokens/base.css";
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

### Maintainer note — publishing (public npm)

Published to the public npm registry under the **`@digital2analogue2`** scope —
the maintainer's npm username, which is a free scope that doubles as a privacy
handle (no real name on the registry). Public npm keeps the scope independent of
the GitHub repo owner, so this repo stays under `digital2analogue` with no
transfer and the Vercel wiring untouched.

> Note: the unpublished `packages/components` and `packages/mcp` are still scoped
> `@riverromney`. If those ever publish, align the scopes (own `@riverromney` on
> npm, or move them under `@digital2analogue2`).

**One-time setup before the first publish:**

1. Sign in to [npmjs.com](https://www.npmjs.com) as `digital2analogue2` (your
   username is automatically the `@digital2analogue2` scope — no org needed).
2. Create an npm **Automation** access token and add it to this repo's Actions
   secrets as **`NPM_TOKEN`**.
3. Run the **Publish @digital2analogue2/tokens** workflow (Actions → Run
   workflow), or push a `tokens-v*` tag. The first publish creates the package.

Preview the exact tarball anytime with
`npm pack --workspace @digital2analogue2/tokens --dry-run`.

> The package ships `"license": "UNLICENSED"` — publicly visible (a portfolio
> artifact), but not licensed for third-party reuse. Change the license field if
> you want to grant reuse.
