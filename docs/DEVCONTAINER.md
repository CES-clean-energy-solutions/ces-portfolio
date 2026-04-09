# CES Devcontainer Setup Guide

Company-wide reference for how we structure VS Code Dev Containers across CES projects. Follow this pattern for all new repositories.

---

## Why Dev Containers

Every developer gets an identical environment — same Node version, same CLI tools, same VS Code extensions — regardless of whether they run Windows, Mac, or Linux. No "works on my machine" debugging. Onboarding a new engineer means: install VS Code + Docker Desktop + the Dev Containers extension, clone the repo, and reopen in container.

---

## Our Setup: Docker Compose Mode

VS Code Dev Containers support three modes:

| Mode | `devcontainer.json` key | Use when |
|---|---|---|
| Single Dockerfile | `"build": { "dockerfile": "..." }` | Simple, no sidecars |
| **Docker Compose** | **`"dockerComposeFile": "..."`** | Per-developer config, sidecars (DB, Redis, etc.) |
| Pre-built image | `"image": "..."` | Fast startup, no customisation needed |

We use **Docker Compose mode** on all projects. The main reason: Compose reads a `.env` file natively, which lets each developer supply their own local paths and secrets without touching any committed file.

---

## Repository Structure

```
.devcontainer/
  Dockerfile          # container image definition
  docker-compose.yml  # volumes, env_file, keep-alive command
  devcontainer.json   # VS Code integration (extensions, settings, lifecycle hooks)
  .env                # GITIGNORED — per-developer variables (copy from .env.example)
  .env.example        # committed template, blank values
  post-start.sh       # runs inside container on every start
```

---

## `devcontainer.json` — VS Code Integration

This file wires VS Code to the compose service. It does **not** define mounts or secrets — those live in `docker-compose.yml`.

```json
{
  "name": "Project Name",
  "dockerComposeFile": "docker-compose.yml",
  "service": "devcontainer",
  "workspaceFolder": "/workspaces/${localWorkspaceFolderBasename}",
  "forwardPorts": [8080],
  "postCreateCommand": "pnpm install",
  "postStartCommand": "bash .devcontainer/post-start.sh ${containerWorkspaceFolder}",
  "remoteUser": "vscode",
  "updateRemoteUserUID": true,
  "customizations": {
    "vscode": {
      "extensions": [...],
      "settings": {...}
    }
  }
}
```

Key properties:

- `service` — which Compose service VS Code attaches to as the dev environment
- `workspaceFolder` — path inside the container where the repo is mounted (VS Code handles this mount automatically)
- `postCreateCommand` — runs once when the container is first created (install deps)
- `postStartCommand` — runs on every container start (sync config, set up symlinks)
- `remoteUser` — non-root user inside the container (always `vscode`)

---

## `docker-compose.yml` — Mounts and Environment

All bind mounts and environment configuration go here, not in `devcontainer.json`.

```yaml
services:
  devcontainer:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - /some/host/path:/container/path:cached
      - /mnt/c/Users/${WINDOWS_USER:?See .env.example}/Pictures/Screenshots:/screenshots:cached
    env_file:
      - /path/to/secrets.env
    command: sleep infinity
```

**Why `command: sleep infinity`:** With a plain Dockerfile, VS Code keeps the container alive itself. With Compose, a service exits when its process exits. `sleep infinity` keeps the container running so VS Code can attach.

---

## Per-Developer Configuration: `.env`

Docker Compose reads `.devcontainer/.env` automatically before resolving any variable in the compose YAML. This is where per-developer values go — things that differ by machine or user.

**`.devcontainer/.env.example`** (committed to git — blank values):
```env
# Copy this file to .devcontainer/.env and fill in your values.
# The .env file is gitignored — each developer maintains their own copy.

WINDOWS_USER=
```

**`.devcontainer/.env`** (gitignored — your local copy):
```env
WINDOWS_USER=your.name
```

Add `.devcontainer/.env` to `.gitignore`:
```
.devcontainer/.env
```

**Never commit `.env`.** Never put real values in `.env.example`.

---

## Required Variables: Fail Fast with `:?`

When a variable **must** be set, use the `${VAR:?message}` syntax. Compose aborts immediately with your message before anything starts — no container half-boots with broken mounts.

```yaml
volumes:
  - /mnt/c/Users/${WINDOWS_USER:?WINDOWS_USER is not set. Copy .devcontainer/.env.example to .devcontainer/.env and set your Windows username.}/Pictures/Screenshots:/screenshots:cached
```

Error output when missing:
```
service "devcontainer": error while interpolating volumes:
required variable WINDOWS_USER is missing a value:
WINDOWS_USER is not set. Copy .devcontainer/.env.example to .devcontainer/.env and set your Windows username.
```

### Variable substitution operators (all supported by Docker Compose)

| Syntax | Behaviour |
|---|---|
| `${VAR:-default}` | Use default if unset **or empty** |
| `${VAR-default}` | Use default only if strictly unset |
| `${VAR:?message}` | **Abort with message** if unset or empty |
| `${VAR?message}` | Abort with message only if strictly unset |

Prefer `:?` over `:-default` for paths — a wrong default mounts the wrong folder silently. Fail loudly instead.

---

## Windows / WSL Bind Mounts

On Windows, developers run Docker Desktop with the WSL 2 backend. Windows host paths are accessible from WSL at `/mnt/c/Users/<username>/...`.

Use `WINDOWS_USER` in `.devcontainer/.env` to avoid hardcoding usernames in committed files:

```yaml
# docker-compose.yml
- /mnt/c/Users/${WINDOWS_USER:?Set WINDOWS_USER in .devcontainer/.env}/Pictures/Screenshots:/screenshots:cached
```

```env
# .devcontainer/.env (gitignored)
WINDOWS_USER=m.jones
```

### Why not `${localEnv:WINDOWS_USER}` in `devcontainer.json`?

`devcontainer.json` supports `${localEnv:VAR}` substitution, but:

1. It has **no fallback or error syntax** — if the variable is missing, the path silently becomes malformed
2. The variable must exist in the **WSL shell environment** (`.bashrc`/`.zshrc`), not in any `.env` file — `runArgs --env-file` loads vars into the container, not into the JSON parsing stage

Docker Compose `.env` is resolved earlier and supports `:?` error syntax. Always use the Compose approach for mount paths.

---

## Lifecycle Hooks

| Hook | When it runs | Typical use |
|---|---|---|
| `initializeCommand` | On host, before container builds | Rarely needed |
| `postCreateCommand` | Inside container, once on first create | `pnpm install`, DB migrations |
| `postStartCommand` | Inside container, on every start | Sync config, create symlinks, source env |

**`post-start.sh` pattern** for syncing shared config into the container on every start:

```bash
#!/usr/bin/env bash
set -e

WORKSPACE="${1:?Error: containerWorkspaceFolder not provided}"

# Sync shared config from mounted volume into project
rsync -a --exclude='.git' /agentic-central/ .claude/

# Symlink mounted folders into workspace
ln -sfn /screenshots "${WORKSPACE}/.screenshots"

# Source secrets into shell
for rc in ~/.bashrc ~/.profile; do
    grep -q "source /secrets.env" "$rc" || \
        echo 'set -a; source /secrets.env 2>/dev/null || true; set +a' >> "$rc"
done
```

Pass `${containerWorkspaceFolder}` as the argument in `devcontainer.json`:
```json
"postStartCommand": "bash .devcontainer/post-start.sh ${containerWorkspaceFolder}"
```

---

## Agentic Central: Shared Claude Code Config

All CES projects share a Claude Code configuration via a persistent WSL mount at `/home/ubuntu/git/agentic-central`. This is bind-mounted into every devcontainer at `/agentic-central`.

`post-start.sh` copies it into `.claude/` and `~/.claude.json` on every container start, so Claude settings survive container rebuilds without being committed per-project.

```yaml
# docker-compose.yml
volumes:
  - /home/ubuntu/git/agentic-central:/agentic-central:cached
```

```bash
# post-start.sh
rsync -a --exclude='.git' /agentic-central/ .claude/
cp /agentic-central/claude.json ~/.claude.json
```

---

## Onboarding a New Developer

1. Install: **VS Code** + **Docker Desktop** (WSL 2 backend on Windows) + **Dev Containers extension** (`ms-vscode-remote.remote-containers`)
2. Clone the repository
3. Copy `.devcontainer/.env.example` → `.devcontainer/.env`
4. Fill in your values (e.g. `WINDOWS_USER=firstname.lastname`)
5. In VS Code: `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**
6. Wait for the build and `postCreateCommand` to finish
7. Done — run `pnpm dev` in the integrated terminal

---

## Common Issues

**Mount fails with "required variable is missing"**
→ You haven't created `.devcontainer/.env`. Copy from `.env.example` and fill in your values.

**Mount path not found**
→ `WINDOWS_USER` is set but wrong. Verify your actual Windows username at `C:\Users\` in Windows Explorer.

**Port not accessible on host**
→ Check `forwardPorts` in `devcontainer.json`. VS Code forwards automatically but only the listed ports.

**Container exits immediately**
→ `command: sleep infinity` is missing from the compose service. Without it, Compose exits when there's no foreground process.

**Claude settings reset after rebuild**
→ Check that `/agentic-central` is mounted and `post-start.sh` is running. The sync happens on every `postStartCommand`, not just create.
