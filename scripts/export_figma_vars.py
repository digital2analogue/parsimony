"""
Helper: saves the Figma variable export (pasted as JSON) to a file
for use with drift_audit.py. In a CI pipeline, this would be
automated via the Figma REST API or MCP tools.
"""
import json, sys

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python export_figma_vars.py <output.json>")
        sys.exit(1)
    # Read from stdin
    data = json.load(sys.stdin)
    with open(sys.argv[1], "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved {len(data)} collections to {sys.argv[1]}")
