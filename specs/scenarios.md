# Scenarios

## Scenario 1: Health Check

Given the project is built  
When the operator runs `npx . health`  
Then the CLI returns JSON with status, package metadata, and workspace info

## Scenario 2: Demo Job

Given `examples/job.input.json` exists  
When the operator runs `npx . run --input examples/job.input.json`  
Then a demo artifact is created under `artifacts/` and the result is returned as JSON

## Scenario 3: Structured Validation Error

Given invalid input is supplied to `run`  
When the operator executes the command  
Then the tool returns a failed JSON result with structured error details

## Scenario 4: MCP Boot

Given the project is built  
When the operator runs `npx . mcp`  
Then the MCP server starts over stdio and exposes the shared tool handlers
