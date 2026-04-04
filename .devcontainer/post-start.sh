#!/usr/bin/env bash
set -e

# =============================================================================
# Agentic Central — Shared Claude Code Config
# =============================================================================
#
# /home/ubuntu/git/agentic-central (WSL) is bind-mounted at /agentic-central.
# On every start, copy its contents into .claude/ (project-level Claude config).
# No symlink mount on .claude — flaky with Claude Code.
#
# This script:
#   1. Copies /agentic-central/* → .claude/
#   2. Sources .env into ~/.bashrc & ~/.profile
# =============================================================================

export COREPACK_ENABLE_STRICT=0
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKSPACE="${1:?Error: containerWorkspaceFolder not provided as argument}"

echo "CES Portfolio - Post-Start Setup"
echo "=================================="

if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 4200 already in use inside container"
fi

echo "Copyig /agentic-central → .claude/ ..."
mkdir -p .claude ~/.claude
rsync -a --exclude='.git' /agentic-central/ .claude/
cp /agentic-central/settings.json ~/.claude/settings.json

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