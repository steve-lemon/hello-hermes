# Hello Hermes

Like Hello World, Open Browser search of `hello hermes`, then report the search result.

Detected package name: `hello-hermes`

## Project Purpose

This repository is the starting point for a Hermes operating loop tool project. The current initialization phase builds the shared TypeScript foundation that lets Codex develop the tool, Hermes operate it, and GitHub track its evolution.

## Existing Requirements Summary

Based on the original README, the first user-facing scenario is a minimal "Hello Hermes" flow: run a simple task, inspect the output, and report the result. This initialization keeps that lightweight purpose while setting up the CLI, MCP server, skill instructions, artifacts, incidents, and tests needed for a long-lived operations tool.

## Implementation Plan

### Project Summary

The repository starts with a simple Hermes-oriented proof of concept and is now being expanded into a reusable operations tool. The initial delivery emphasizes reliable contracts, shared logic, structured outputs, and documentation that helps Hermes operate safely.

### Initial Architecture

- CLI
- Core logic
- MCP server
- Hermes Skill
- Artifacts
- Incidents
- Tests
- CI

### Development Loop

1. Develop the tool locally with Codex.
2. Validate with CLI and tests.
3. Expose the same logic through MCP.
4. Register the skill for Hermes.
5. Let Hermes operate the tool for recurring or bulk tasks.
6. Report failures through structured incidents.
7. Use Codex to improve the tool.

### Current Scope

Included in this initialization:

- shared TypeScript core functions for health checks, demo runs, and artifact inspection
- CLI commands for `health`, `run`, `inspect`, and `mcp`
- stdio MCP tools that reuse the same core logic
- Hermes skill and configuration examples
- structured output, error, artifact, and incident documentation
- test coverage for core flows and path safety rules

Not included yet:

- real browser automation
- login handling
- CAPTCHA solving
- payment flows
- destructive bulk operations
- scheduled installers that write machine-specific Hermes config

### Next Steps

The next expansion stage can attach real browser automation, external APIs, authentication-aware flows, scheduler-driven job triggers, and richer incident reporting. When that happens, keep the same shared core contract and extend the MCP tools rather than creating a separate code path.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev -- health
npm run test
npm run build
```

## NPX Usage

Local package:

```bash
npx . health
npx . run --input examples/job.input.json
npx . run --json '{"jobType":"demo","targets":["https://example.com"],"options":{}}'
npx . inspect --job-id demo-job
npx . mcp
```

Published package:

```bash
npx hello-hermes health
npx hello-hermes run --input examples/job.input.json
npx hello-hermes mcp
```

## CLI Usage

- `health`: return runtime information in JSON
- `run`: validate input and run the demo job
- `inspect`: read a saved artifact by job ID
- `mcp`: start the stdio MCP server

## MCP Server

Build the project, then start the MCP server:

```bash
node dist/mcp/server.js
```

Available tools:

- `health_check`
- `run_job`
- `inspect_result`

## Hermes Config Integration

Use [hermes/config.example.yaml](hermes/config.example.yaml) as the documentation-friendly example. Keep `<PROJECT_ROOT>` and `<TOOL_WORKSPACE>` placeholders in committed files. A runtime installer may later replace those placeholders in a private Hermes configuration outside this repository.

## Hermes Skill Registration

Register `./skills` as an external Hermes skill directory and use [skills/hermes-npx-tool/SKILL.md](skills/hermes-npx-tool/SKILL.md) for the operating instructions.

## Cron Operating Loop

See [hermes/cron.example.md](hermes/cron.example.md) for a recurring prompt example and [hermes/operating-loop.md](hermes/operating-loop.md) for the operator workflow.

## Artifact And Incident Operations

- Job outputs are saved to `artifacts/<jobId>.json`.
- Incidents should use the markdown template documented in `hermes/operating-loop.md`.
- Hermes should verify results with `inspect_result` or the saved artifact before reporting success.

## Codex Maintenance Model

Codex is responsible for implementing changes, keeping the shared contracts intact, updating tests, and expanding the tool safely when Hermes uncovers repeatable operational needs.

## Path Handling

This repository does not store absolute local paths.

- Use relative paths inside the repository.
- Use `<PROJECT_ROOT>` in documentation examples.
- Runtime installers may resolve absolute paths when updating external Hermes config.
- Do not commit `/Users/...`, `/home/...`, or `C:\Users\...` paths.
