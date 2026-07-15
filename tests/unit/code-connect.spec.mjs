// Fixture-based tests for scripts/code-connect.mjs — the Code Connect ↔
// component parity parsers used by validate.mjs section 4.
//
// Synthetic fixtures only (per the repo rule from 2026-07-02: tests that
// assert live repo data invert when someone fixes the data). The "ghost"
// fixture reproduces the exact drift class the 2026-07-15 inspection found.

import { describe, it, expect } from "vitest";
import {
  extractEnumEmissions,
  extractUnionLiterals,
  findUnmappedEmissions,
} from "../../scripts/code-connect.mjs";

const FIGMA_SRC = `
figma.connect('https://figma.com/design/x?node-id=1-2', {
  props: {
    variant: figma.enum('Variant', {
      primary:   'primary',
      secondary: 'secondary',
      ghost:     'ghost',
    }),
    size: figma.enum('Size', {
      sm: 'small',
      md: 'medium',
      lg: 'large',
    }),
    disabled: figma.enum('State', {
      disabled: true,
    }),
  },
});
`;

const COMPONENT_WITHOUT_GHOST = `
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
class X {
  @property() type: 'button' | 'submit' | 'reset' = 'button';
}
`;

const COMPONENT_WITH_GHOST = COMPONENT_WITHOUT_GHOST.replace(
  "'danger'",
  "'danger' | 'ghost'",
);

describe("extractEnumEmissions", () => {
  it("collects every string value across all figma.enum blocks", () => {
    const emissions = extractEnumEmissions(FIGMA_SRC);
    expect(emissions).toContainEqual({ prop: "Variant", value: "ghost" });
    expect(emissions).toContainEqual({ prop: "Size", value: "small" });
    expect(emissions).toHaveLength(6);
  });

  it("ignores non-string mappings like disabled: true", () => {
    const values = extractEnumEmissions(FIGMA_SRC).map((e) => e.value);
    expect(values).not.toContain("true");
    expect(values).not.toContain(true);
  });

  it("returns empty for source with no enum mappings", () => {
    expect(extractEnumEmissions("const x = 1;")).toEqual([]);
  });
});

describe("extractUnionLiterals", () => {
  it("collects literals from exported type aliases", () => {
    const unions = extractUnionLiterals(COMPONENT_WITHOUT_GHOST);
    expect(unions.has("primary")).toBe(true);
    expect(unions.has("danger")).toBe(true);
  });

  it("collects literals from inline prop annotations", () => {
    const unions = extractUnionLiterals(COMPONENT_WITHOUT_GHOST);
    expect(unions.has("submit")).toBe(true);
    expect(unions.has("reset")).toBe(true);
  });

  it("does not collect lone (non-union) string literals", () => {
    const unions = extractUnionLiterals(`const name = 'rr-button';`);
    expect(unions.has("rr-button")).toBe(false);
  });
});

describe("findUnmappedEmissions", () => {
  it("flags the ghost drift: figma emits a variant the component lacks", () => {
    const offending = findUnmappedEmissions(FIGMA_SRC, COMPONENT_WITHOUT_GHOST);
    expect(offending).toEqual([{ prop: "Variant", value: "ghost" }]);
  });

  it("passes once the component implements the emitted variant", () => {
    expect(findUnmappedEmissions(FIGMA_SRC, COMPONENT_WITH_GHOST)).toEqual([]);
  });
});
