# Install And Connect

## Assumption

Hermes is already installed on the target machine. This repository only installs and refreshes this tool's MCP and skill integration.

## First-Time Setup

```bash
git clone <repo-url>
cd <repo-name>
npm install
npm run build
npm run hermes:install
npm run hermes:doctor
```

## Install vs Update vs Doctor

- `npm run hermes:install`: creates or updates the Hermes config entry for this repository and adds the skills directory.
- `npm run hermes:update`: refreshes the existing Hermes config entry after a build, repo move, or tool list change.
- `npm run hermes:doctor`: checks whether the current checkout and Hermes config still point to the same working installation.

## MCP Server Example

```yaml
mcp_servers:
  <safe_project_id>:
    command: "node"
    args:
      - "<PROJECT_ROOT>/dist/mcp/server.js"
    env:
      TOOL_WORKSPACE: "<TOOL_WORKSPACE>"
    tools:
      include:
        - health_check
        - run_job
        - inspect_result
        - update_repo
```

## Skills External Dirs

Hermes must be able to see this repository's `skills` directory. The installer adds `<PROJECT_ROOT>/skills` to `skills.external_dirs` in the external Hermes config at runtime.

## Hermes Restart

After install or update, Hermes may need a restart or config reload before the new MCP tools and skills appear.

## Path Policy

- Committed repository files use relative paths or placeholders only.
- Runtime installers may resolve absolute paths only when editing the external Hermes config.
- Do not commit machine-specific project paths back into the repository.

## Troubleshooting

- `dist/mcp/server.js` missing:
  Run `npm run build` and rerun `npm run hermes:update`.
- `node` command not found:
  Install Node.js and confirm `node --version` works in the shell Hermes uses.
- `config.yaml` parse failure:
  Restore the latest backup and fix malformed YAML before rerunning install or update.
- MCP tool missing:
  Run `npm run hermes:update`, then restart Hermes or reload its config.
- Skill missing:
  Confirm the skills directory is registered and `skills/hermes-npx-tool/SKILL.md` exists.
- Path points to an older clone location:
  Run `npm run hermes:update` from the current clone root.
- `TOOL_WORKSPACE` permission problem:
  Point Hermes to a writable workspace or adjust directory permissions.
- `artifacts` or `incidents` not writable:
  Fix filesystem permissions and rerun `npm run hermes:doctor`.
