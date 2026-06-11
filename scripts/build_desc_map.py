"""Build figma_name -> description map from DTCG token JSON files and output as JSON."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from drift_audit import dtcg_path_to_figma_name
from pathlib import Path

def walk_descriptions(node, path, out, source_file):
    if not isinstance(node, dict):
        return
    if "$value" in node:
        desc = node.get("$description", "")
        if desc:
            out[".".join(path)] = {"desc": desc, "src": source_file}
        return
    for key, child in node.items():
        if key.startswith("$"):
            continue
        walk_descriptions(child, path + [key], out, source_file)

tokens_dir = Path("./tokens")
SKIP_DIRS = ("brands", "components")

raw_descs = {}
for json_file in sorted(tokens_dir.rglob("*.tokens.json")):
    rel = str(json_file.relative_to(tokens_dir)).replace("\\", "/")
    if any(rel.startswith(d) for d in SKIP_DIRS):
        continue
    with open(json_file, encoding="utf-8") as f:
        data = json.load(f)
    walk_descriptions(data, [], raw_descs, rel)

desc_map = {}
for dtcg_path, info in raw_descs.items():
    figma_name = dtcg_path_to_figma_name(dtcg_path)
    if figma_name:
        desc_map[figma_name] = info["desc"]

print(f"{len(desc_map)} variables have descriptions", file=sys.stderr)
json.dump(desc_map, sys.stdout, indent=None)
