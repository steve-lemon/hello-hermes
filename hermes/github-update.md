# GitHub Update

Hermes can refresh this tool through the `update_repo` MCP tool.

The update flow is:

1. check `git status --short`
2. stop if the working tree is dirty, unless explicitly allowed
3. run `git pull`
4. run `npm install`
5. run `npm run build`
6. run `npm run hermes:update`
7. keep the tool in a `health_check`-ready state

Forbidden commands:

- `git reset`
- `git clean`
- `git push`
- `git checkout`
- `rm -rf`
