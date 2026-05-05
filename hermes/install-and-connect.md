# Install And Connect

Use these commands on the machine where Hermes is already installed:

```bash
npm run hermes:install
npm run hermes:doctor
```

What happens:

- the project build is checked
- `dist/mcp/server.js` is prepared if missing
- the Hermes config is backed up before changes
- this tool's MCP server entry is added or refreshed
- the local `skills/` directory is registered

The repository does not store absolute paths. Runtime scripts write absolute paths only into the external Hermes config.
