"""Generate the use_figma JS script for setting variable descriptions."""
import json

desc_map = json.load(open("scripts/output/desc_map_filtered.json"))
js_data = json.dumps(desc_map, ensure_ascii=True, separators=(",", ":"))

script = (
    "const descMap = " + js_data + ";\n"
    "const vars = await figma.variables.getLocalVariablesAsync();\n"
    "let updated = 0, skipped = 0;\n"
    "for (const v of vars) {\n"
    "  const desc = descMap[v.name];\n"
    "  if (desc !== undefined) {\n"
    "    v.description = desc;\n"
    "    updated++;\n"
    "  } else {\n"
    "    skipped++;\n"
    "  }\n"
    "}\n"
    "return `Updated ${updated} descriptions, skipped ${skipped} vars`;"
)

print(f"Script length: {len(script)} chars")
with open("scripts/output/set_descriptions.js", "w", encoding="utf-8") as f:
    f.write(script)
print("OK")
