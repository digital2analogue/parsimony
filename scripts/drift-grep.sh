#!/usr/bin/env bash
# drift-grep.sh — scan a consumer repo for design system violations.
#
# Usage: ./scripts/drift-grep.sh /path/to/consumer-repo
#
# Checks:
#   1. Hex color literals in CSS/TS/HTML (Hard Rule 1)
#   2. --primitive-* token references in UI code (Hard Rule 9)
#   3. Hardcoded font-size values (Hard Rule 8)
#
# Exit code: 0 = clean, 1 = violations found

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-consumer-repo>"
  exit 2
fi

TARGET="$1"
FOUND=0

echo "Scanning: $TARGET"
echo "---"

# Rule 1: Hex color literals
hex=$(grep -rn --include='*.css' --include='*.tsx' --include='*.jsx' --include='*.html' --include='*.ts' \
  -E '#[0-9A-Fa-f]{3,8}\b' "$TARGET" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=build \
  --exclude-dir=dist --exclude='*.tokens.json' --exclude='variables.css' \
  --exclude='decision-engine.css' --exclude='dot-art.css' --exclude='dot-blog.css' \
  || true)
if [ -n "$hex" ]; then
  echo "FAIL  Hard Rule 1: No hardcoded colors — use var(--color-*)"
  echo "$hex"
  echo ""
  FOUND=1
fi

# Rule 9: Primitive token references
primitives=$(grep -rn --include='*.css' --include='*.tsx' --include='*.jsx' --include='*.html' --include='*.ts' \
  -E '\-\-primitive-' "$TARGET" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=build --exclude-dir=dist \
  --exclude='*.tokens.json' \
  || true)
if [ -n "$primitives" ]; then
  echo "FAIL  Hard Rule 9: Never use --primitive-* in UI code"
  echo "$primitives"
  echo ""
  FOUND=1
fi

# Rule 8: Hardcoded font-size
fontsizes=$(grep -rn --include='*.css' --include='*.tsx' --include='*.jsx' \
  -E 'font-size:\s*[0-9]' "$TARGET" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude --exclude-dir=build --exclude-dir=dist \
  || true)
if [ -n "$fontsizes" ]; then
  echo "FAIL  Hard Rule 8: No hardcoded font sizes — use var(--font-size-*)"
  echo "$fontsizes"
  echo ""
  FOUND=1
fi

if [ $FOUND -eq 0 ]; then
  echo "PASS  No drift violations found."
fi

exit $FOUND
