// Code Connect ↔ component parity — parsing helpers.
//
// The 2026-07-15 ds-inspection found button.figma.ts emitting
// variant="ghost" while button.ts had no ghost variant: Code Connect
// happily generates code that doesn't exist, and nothing failed. These
// helpers let validate.mjs assert that every string value a *.figma.ts
// enum mapping can emit appears in a literal union of the paired
// component source, so that class of drift fails a PR instead of an
// inspection.
//
// Kept separate from validate.mjs so the parsers can be unit-tested
// against synthetic fixtures (tests/unit/code-connect.spec.ts).

/**
 * Extract every string value a `figma.enum('Prop', { key: 'value' })`
 * mapping can emit. Non-string values (e.g. `disabled: true`) are
 * ignored — they map to boolean props, not literal unions.
 *
 * @param {string} figmaSrc  Source text of a *.figma.ts file
 * @returns {{ prop: string, value: string }[]}
 */
export function extractEnumEmissions(figmaSrc) {
  const emissions = [];
  const enumRe = /figma\.enum\(\s*['"]([^'"]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g;
  let m;
  while ((m = enumRe.exec(figmaSrc))) {
    const prop = m[1];
    const valRe = /:\s*['"]([^'"]+)['"]/g;
    let v;
    while ((v = valRe.exec(m[2]))) emissions.push({ prop, value: v[1] });
  }
  return emissions;
}

/**
 * Collect every string literal that participates in a literal union
 * (`'a' | 'b' | …`) in a component source — covers both exported type
 * aliases (`export type ButtonVariant = 'primary' | …`) and inline
 * prop annotations (`type: 'button' | 'submit' | 'reset'`).
 *
 * @param {string} componentSrc  Source text of the component *.ts file
 * @returns {Set<string>}
 */
export function extractUnionLiterals(componentSrc) {
  const literals = new Set();
  const unionRe = /(['"])(?:(?!\1).)+\1(?:\s*\|\s*(['"])(?:(?!\2).)+\2)+/g;
  let m;
  while ((m = unionRe.exec(componentSrc))) {
    const litRe = /['"]((?:[^'"\\]|\\.)+)['"]/g;
    let l;
    while ((l = litRe.exec(m[0]))) literals.add(l[1]);
  }
  return literals;
}

/**
 * Check one figma.ts / component.ts pair. Returns the emissions whose
 * value appears in no literal union of the component source.
 *
 * @param {string} figmaSrc
 * @param {string} componentSrc
 * @returns {{ prop: string, value: string }[]}  offending emissions
 */
export function findUnmappedEmissions(figmaSrc, componentSrc) {
  const unions = extractUnionLiterals(componentSrc);
  return extractEnumEmissions(figmaSrc).filter(
    ({ value }) => !unions.has(value),
  );
}
