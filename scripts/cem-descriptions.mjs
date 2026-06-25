/**
 * cem-descriptions.mjs — single source for component prop descriptions.
 *
 * Prop descriptions are authored exactly once, in the per-property JSDoc above
 * each `@property`. `cem analyze` captures that text into the Custom Elements
 * Manifest; `*.meta.json` no longer carries a `description`. These helpers
 * resolve a prop's description from the CEM so the merged `design-system.json`
 * (read by the MCP) and Storybook autodocs (read from the CEM) can never drift.
 *
 * Shared by `build-design-system-json.mjs` and the MCP tests — the logic lives
 * in one place, never re-implemented (same convention as rules/tokens/reasoning).
 */

/**
 * Build `{ tagName: { key: description } }` from a Custom Elements Manifest.
 * Each prop is reachable by its attribute name (`helper-text`), its field name
 * (`helperText`), or a property-only member name with no reflected attribute.
 */
export function buildCemDescriptionMap(customElements) {
  const byTag = {};
  for (const mod of customElements?.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (!decl.tagName) continue;
      const map = (byTag[decl.tagName] ??= {});
      for (const attr of decl.attributes ?? []) {
        if (!attr.description) continue;
        map[attr.name] = attr.description;
        if (attr.fieldName) map[attr.fieldName] = attr.description;
      }
      for (const member of decl.members ?? []) {
        if (member.kind === 'field' && member.description && member.privacy !== 'private') {
          map[member.name] ??= member.description;
        }
      }
    }
  }
  return byTag;
}

/**
 * Set `description` on every prop of every component from the CEM (in place).
 * Returns the list of `"<tag>.<prop>"` keys that resolved no description —
 * a non-empty result means a `@property` is missing its `/** … *​/` doc comment,
 * which callers should treat as a hard error.
 */
export function injectPropDescriptions(components, customElements) {
  const byTag = buildCemDescriptionMap(customElements);
  const missing = [];
  for (const component of components) {
    for (const prop of component.props ?? []) {
      const desc = byTag[component.name]?.[prop.name];
      if (desc == null) {
        missing.push(`${component.name}.${prop.name}`);
        continue;
      }
      prop.description = desc;
    }
  }
  return missing;
}
