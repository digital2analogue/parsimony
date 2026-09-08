import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Sanity checks on the token source files themselves. scripts/validate.mjs
// does deep schema validation; these tests are a fast, always-on guard that
// the token tree stays parseable and structurally sound so a bad merge
// can't silently break every downstream consumer.

const tokensRoot = resolve(__dirname, '../../tokens')

function jsonFilesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.json'))
    .map((f) => join(dir, f))
}

type TokenNode = { value?: unknown; $value?: unknown } & Record<string, unknown>

function collectLeaves(node: TokenNode, path: string[] = []): Array<{ path: string; value: unknown }> {
  if ('value' in node || '$value' in node) {
    return [{ path: path.join('.'), value: node.value ?? node.$value }]
  }
  return Object.entries(node)
    .filter(([, v]) => typeof v === 'object' && v !== null)
    .flatMap(([key, v]) => collectLeaves(v as TokenNode, [...path, key]))
}

describe('token source tree', () => {
  const files = jsonFilesUnder(tokensRoot)

  it('has the expected top-level groups (two tiers + brands — no component tier, #114)', () => {
    const groups = readdirSync(tokensRoot)
    expect(groups).toEqual(expect.arrayContaining(['primitives', 'semantic', 'brands']))
    expect(groups).not.toContain('components')
  })

  it('contains token files', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('every token file parses as JSON', () => {
    for (const file of files) {
      expect(() => JSON.parse(readFileSync(file, 'utf8')), file).not.toThrow()
    }
  })

  it('no token has an empty value', () => {
    for (const file of files) {
      const leaves = collectLeaves(JSON.parse(readFileSync(file, 'utf8')))
      for (const leaf of leaves) {
        expect(leaf.value, `${file} → ${leaf.path}`).not.toBe('')
        expect(leaf.value, `${file} → ${leaf.path}`).not.toBeNull()
        expect(leaf.value, `${file} → ${leaf.path}`).not.toBeUndefined()
      }
    }
  })
})

describe('semantic layer', () => {
  // Brands are partial overlays — the semantic layer is what guarantees
  // every consumer gets the core roles regardless of brand.
  it('defines the core semantic roles', () => {
    const leaves = jsonFilesUnder(join(tokensRoot, 'semantic')).flatMap((file) =>
      collectLeaves(JSON.parse(readFileSync(file, 'utf8')))
    )
    const paths = new Set(leaves.map((l) => l.path))
    for (const role of [
      'color.background.default',
      'color.foreground.default',
      'color.border.default',
      'radius.default',
    ]) {
      expect(paths.has(role), `semantic layer missing ${role}`).toBe(true)
    }
  })
})

describe('brand token files', () => {
  // Brand files override deltas only, so no specific token is required —
  // but an empty/unparseable brand file means a broken brand build.
  it('each brand defines at least one token', () => {
    for (const file of jsonFilesUnder(join(tokensRoot, 'brands'))) {
      const leaves = collectLeaves(JSON.parse(readFileSync(file, 'utf8')))
      expect(leaves.length, `${file} defines no tokens`).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Disabled text must stay visible on every surface it can be drawn on (#239).
//
// color.foreground.disabled was {primitive.color.green.900} — the SAME value
// as color.background.alt. On the canvas that read as deeply receded, which
// was the intent. On a card, menu or listbox it was 1:1 against its own
// surface and the text simply was not there: the shipped
// `components-menu--danger-and-disabled` baseline rendered a hole where
// "Delete" should be.
//
// Nothing caught it because WCAG 1.4.3 exempts disabled text, so the contrast
// gate marks the pair exempt and moves on. The exemption declines to set a
// floor; it does not license 1:1. This is that floor.
//
// Deliberately loose: disabled SHOULD be faint, and the point is only that it
// remains perceptible. The failure this guards against is collision, not
// dimness — anything at or below ~1.3:1 is a token pointing at its own
// background, which is a bug in every theme.
describe('disabled text vs. the surfaces it renders on (#239)', () => {
  const FLOOR = 1.5

  // Every role a component can paint disabled text onto. Roles a given brand
  // does not define are skipped, so this stays correct as brands diverge.
  const SURFACES = ['default', 'alt', 'elevated', 'hover'] as const
  // decision-engine is NOT in this list, and not because it passes: its
  // foreground.disabled (gray.200 #D8DCE0) measures 1.29:1 on its own
  // background.default and 1.20:1 on background.alt — the same defect in a
  // light theme. It is excluded rather than fixed here because DE's gray ramp
  // has no rung that works: gray.300 is 1.64:1 (barely perceptible) and the
  // next step, gray.500, is 4.85:1 (body-text weight, far too loud for
  // disabled). Closing it needs a new primitive, which is a brand decision.
  // Tracked separately; add 'decision-engine' here as part of that fix.
  const BRANDS = [null, 'dot-art', 'dot-blog'] as const

  it.each(BRANDS)('holds for brand %s', async (brand) => {
    const { loadTokens, resolveToken } = await import('../../scripts/tokens.mjs')
    const { contrastRatio } = await import('../../scripts/assembly.mjs')
    const store = await loadTokens()

    const opts = brand ? { brand } : {}
    const fg = resolveToken(store, 'color.foreground.disabled', opts)
    expect(fg?.value, 'color.foreground.disabled must resolve').toBeTruthy()

    const checked: string[] = []
    for (const surface of SURFACES) {
      const bg = resolveToken(store, `color.background.${surface}`, opts)
      if (!bg?.value) continue
      const ratio = contrastRatio(fg.value, bg.value)
      expect(
        ratio,
        `foreground.disabled (${fg.value}) on background.${surface} (${bg.value}) ` +
          `is ${ratio.toFixed(2)}:1 — disabled text is invisible against this surface`,
      ).toBeGreaterThan(FLOOR)
      checked.push(surface)
    }

    // Guard the guard: if resolution silently returned nothing for every
    // surface, the loop above would pass by never running.
    expect(checked.length, 'no surfaces were actually checked').toBeGreaterThan(0)
  })
})
