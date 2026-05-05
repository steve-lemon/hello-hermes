# hello-hermes

`hello-hermes`는 Codex가 개발하고 Hermes가 운영하는 도구를 위한 최소 실행 골격이다. 이 저장소는 지금 단계에서 완성형 제품을 만드는 것이 아니라, README 기반 방향 정리, 앞으로 구현할 항목의 뼈대, 그리고 CLI와 MCP가 같은 코어 로직을 공유하는 데모 실행 구조를 제공하는 데 초점을 둔다.

## Project Summary

이 프로젝트는 Hermes 운영 루프에서 호출할 수 있는 TypeScript 도구의 기준점을 만든다. 현재는 `health`, `run`, `inspect`, `mcp` 흐름만 제공하며, 모든 결과를 JSON으로 반환하고 실패를 구조화된 에러 객체로 다루는 최소 계약을 먼저 고정한다.

## Detected Project Metadata

- Detected package name: `hello-hermes`
- Source of package name: repository folder name, formalized in `package.json`
- Primary purpose: Hermes가 호출할 CLI + MCP 공용 실행 골격 제공
- Initial README assumptions: 기존 README가 없어서 현재 저장소 목적과 가이드 문서를 기준으로 초기 메타데이터를 정리함

## Development Phases

```text
Phase 0: 초기 구조
Phase 1: 최소 실행 (CLI + MCP)
Phase 2: 실제 기능 구현
Phase 3: Hermes 운영
```

## Requirements Overview

- Codex는 이 저장소의 개발자이며 구조와 기능을 확장한다.
- Hermes는 이 도구의 운영자이며 CLI/MCP를 통해 실행만 담당한다.
- Repo는 설계, 코드, 예시, 테스트의 기준점이다.
- 현재 단계에서는 최소 실행 구조와 후속 개발 기준을 남기는 것이 목표다.

## Top-Level Requirements

| ID | Requirement | Priority | Status | Spec |
| --- | --- | --- | --- | --- |
| R-001 | Provide an `npx` CLI entrypoint | High | In Progress | `specs/overview.md` |
| R-002 | Expose shared demo behavior through MCP | High | In Progress | `specs/features.md` |
| R-003 | Return JSON for success and failure paths | High | In Progress | `specs/scenarios.md` |
| R-004 | Keep Hermes in operator-only role | Medium | Planned | `specs/features.md` |

## TODO

- CLI 기본 명령 만들기
- MCP 연결
- demo job 구현
- 실제 기능 설계
- artifact/incident 운영 규칙 확장

## Validation Scenarios

- CLI 실행된다
- demo job 동작한다
- MCP에서 호출된다
- 에러가 구조적으로 나온다

## Minimal Commands

```bash
npx . health
npx . run --input examples/job.input.json
npx . mcp
```

## Path Handling

This repository does not store absolute local paths.

- Use relative paths inside the repository.
- Use `<PROJECT_ROOT>` in documentation examples.
- Runtime installers may resolve absolute paths when updating external Hermes config.
- Do not commit `/Users/...`, `/home/...`, or `C:\Users\...` paths.

## Project Layout

```text
src/
  cli.ts
  core/
  mcp/server.ts

specs/
skills/
hermes/
examples/
tests/
```

## Current Scope

지금은 설계 뼈대 + 실행 최소 기능만 만든다. 실제 도메인 기능, 운영 자동화, Hermes 설치 스크립트, 고급 시나리오는 다음 단계에서 확장한다.

## Hermes Integration

### First install

```bash
npm run hermes:install
npm run hermes:doctor
```

### Update local Hermes integration

```bash
npm run hermes:update
npm run hermes:doctor
```

### Automatic repo update through Hermes

Hermes can call the `update_repo` MCP tool to:

1. pull latest GitHub changes
2. install dependencies
3. rebuild the project
4. refresh Hermes integration

### Safety

- The repository does not store absolute local paths.
- Runtime installer scripts may write absolute paths only to external Hermes config.
- Destructive git commands are not allowed.
