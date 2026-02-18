#!/usr/bin/env bash
set -e

export COREPACK_ENABLE_STRICT=0
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKSPACE="${1:?Error: containerWorkspaceFolder not provided as argument}"

echo "CES Portfolio - Post-Start Setup"
echo "=================================="

if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 4200 already in use inside container"
fi

echo "Creating .claude symlink..."
ln -sfn /agentic-central "${WORKSPACE}/.claude"

mkdir -p ~/.claude
cp /agentic-central/claude.json ~/.claude.json 2>/dev/null || true
cp /agentic-central/claude.home.settings.json ~/.claude/settings.json 2>/dev/null || true

echo "Setting up environment..."
for rc in ~/.bashrc ~/.profile; do
    grep -q "source /agentic-central/.env" "$rc" 2>/dev/null || \
        echo 'set -a; source /agentic-central/.env 2>/dev/null || true; set +a' >> "$rc"
    grep -q "CLAUDE_TRUST_PROMPT" "$rc" 2>/dev/null || \
        echo 'export CLAUDE_TRUST_PROMPT=true' >> "$rc"
done

echo "Mount screenshot folder"
if [ -n "${WORKSPACE}" ]; then
    ln -sfn /screenshots "${WORKSPACE}/.screenshots"
else
    echo "WARNING: WORKSPACE not set, skipping .screenshots symlink"
fi

# echo ""
# echo "Post-start setup complete."
# echo "  1. Run: pnpm dev"
# echo "  2. Open: http://localhost:4200"