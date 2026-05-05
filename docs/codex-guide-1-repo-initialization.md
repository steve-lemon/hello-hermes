# Codex 최종 지침서 1: 저장소 초기화 + 상위 요구사항/스펙 설계

## 목적

이 지침서는 빈 GitHub 저장소를 로컬에 클론한 뒤, Codex가 TypeScript + npx + MCP + Hermes Skill 기반 도구 프로젝트를 초기화하도록 하기 위한 최종 작업 지침서다.

이 1단계의 핵심은 단순히 코드 골격을 만드는 것이 아니다.

사용자가 이미 작성한 README.md를 읽고, 프로젝트의 상위 요구사항을 정리한 뒤, 향후 실제 개발할 항목을 단계별 TODO와 specs 문서로 남겨야 한다.

상세 구현은 이후 별도의 Codex 실행에서 진행한다.  
따라서 이 단계에서는 전체 설계와 구현 방향이 흔들리지 않도록 “탑다운 요구사항 정리 + 검증 가능한 시나리오 + 초기 실행 가능한 골격”을 준비하는 것이 목표다.

---

## 핵심 목표

- 기존 README.md를 먼저 읽고 프로젝트 의도를 파악한다.
- README.md에 상위 설계안, 단계별 개발 계획, TODO, 검증 시나리오를 추가한다.
- specs 폴더를 만들고 항목별 상위 스펙 문서를 준비한다.
- TypeScript 기반 프로젝트 골격을 만든다.
- npx 실행 가능한 CLI를 준비한다.
- 같은 core logic을 공유하는 CLI + MCP 서버 구조를 만든다.
- Hermes가 사용할 Skill 문서를 준비한다.
- artifact / incident 운영 구조를 준비한다.
- 테스트, CI, 문서 기반을 포함한다.
- 저장소 내부에는 절대경로를 절대 남기지 않는다.

---

## Codex에게 줄 작업 지시

너는 이 빈 GitHub 저장소에 TypeScript + npx + MCP + Hermes Skill 기반의 “Hermes 운영 루프용 도구 프로젝트”를 구축한다.

단, 이 단계의 주된 목적은 실제 모든 기능을 구현하는 것이 아니라, README 기반 상위 요구사항 정리, 단계별 개발 계획, specs 문서 구조, 검증 시나리오, 그리고 최소 실행 가능한 프로젝트 골격을 준비하는 것이다.

## 상황

- 사용자는 GitHub 저장소를 이미 만들었다.
- 저장소에는 초기 README.md가 있을 수 있다.
- README.md에는 프로젝트 이름, 목적, 기본 요구사항, 초기 아이디어가 정리되어 있을 수 있다.
- 너는 README.md를 먼저 읽고, 그 내용을 기준으로 프로젝트 구조와 초기 구현 계획을 수립해야 한다.
- README.md는 삭제하거나 덮어쓰지 않는다.
- 기존 README.md 내용을 보존하고, 필요한 섹션을 추가하거나 보강한다.
- 상세 기능 구현은 이후 별도의 Codex 실행에서 진행될 수 있으므로, 향후 구현 항목과 검증 시나리오를 반드시 남긴다.

---

## 역할 분리

- Steve: 도구의 요구사항 정의, 운영 판단, 최종 승인
- Codex: 도구 개발, 개선, 유지보수
- GitHub: 소스 관리, 변경 이력, 배포 기준점
- Hermes: 장기 실행 운영자
- MCP: Hermes가 이 도구를 호출하는 실행 인터페이스
- Skill: Hermes에게 이 도구를 언제, 어떻게, 어떤 안전 규칙으로 쓸지 알려주는 운영 매뉴얼
- specs 폴더: 향후 개발할 기능의 요구사항과 검증 기준을 관리하는 설계 기준점

---

## 중요 원칙

1. 모든 코드는 TypeScript로 작성한다.
2. npx 실행이 가능해야 한다.
3. CLI와 MCP는 같은 core 로직을 공유해야 한다.
4. Hermes는 도구의 운영자이지 개발자가 아니다.
5. Codex는 도구의 개발자/유지보수자다.
6. 모든 작업 결과는 JSON 계약을 따른다.
7. 모든 실패는 구조화된 에러로 반환한다.
8. 로그인, CAPTCHA, 결제, 삭제, 인증 실패, 대량 변경 전에는 반드시 중단하고 사용자에게 보고하는 정책을 문서화한다.
9. package name은 사용자에게 묻지 말고 자동 결정한다.
10. 기존 README.md를 반드시 먼저 읽고, 해당 요구사항을 프로젝트 계획에 반영한다.
11. 저장소 내부 문서와 예시에는 절대경로를 절대 사용하지 않는다.
12. 향후 개발할 기능은 README TODO와 specs 문서에 남긴다.
13. 요구사항은 탑다운으로 정리한다.
14. 각 상위 요구사항에는 검증 가능한 시나리오를 연결한다.
15. 상세 구현은 이 단계에서 억지로 완성하지 않고, 이후 작업을 위한 명확한 기준을 남긴다.

---

## 절대경로 정책

### 핵심 원칙

저장소에는 절대경로를 절대 포함하지 않는다.

금지 예:

```text
/Users/steve/...
/home/someone/...
C:\Users\someone\...
```

허용 예:

```text
./skills
dist/mcp/server.js
<PROJECT_ROOT>/skills
<PROJECT_ROOT>/dist/mcp/server.js
```

### 규칙

- README.md, TOOL_SPEC.md, AGENTS.md, hermes/*.md, hermes/*.yaml, specs/*.md에는 실제 로컬 절대경로를 쓰지 않는다.
- 문서와 예제 설정에서는 `<PROJECT_ROOT>` placeholder를 사용한다.
- 실제 절대경로는 Hermes 연동 설치 스크립트가 runtime에만 계산한다.
- GitHub에 commit되는 파일에는 사용자 홈 디렉터리, 로컬 clone 경로, 개인 머신 경로가 들어가면 안 된다.

README.md에는 다음 섹션을 추가한다.

```md
## Path Handling

This repository does not store absolute local paths.

- Use relative paths inside the repository.
- Use `<PROJECT_ROOT>` in documentation examples.
- Runtime installers may resolve absolute paths when updating external Hermes config.
- Do not commit `/Users/...`, `/home/...`, or `C:\Users\...` paths.
```

AGENTS.md에는 다음 규칙을 추가한다.

```md
## Path Rules

- Never commit absolute paths into the repository.
- Use relative paths or `<PROJECT_ROOT>` placeholders.
- Only installer scripts may resolve absolute paths at runtime.
- Never hardcode `/Users/...`, `/home/...`, or `C:\Users\...`.
```

---

## README.md 처리 규칙

작업 시작 시 반드시 README.md를 확인한다.

README.md가 있으면 다음을 수행한다.

1. README.md에서 프로젝트 이름, 목적, 요구사항, 제약조건, 예상 사용 흐름을 추출한다.
2. 추출한 내용을 기준으로 상위 요구사항을 정리한다.
3. 상위 요구사항을 단계별 개발 계획으로 나눈다.
4. 각 단계별 TODO를 작성한다.
5. 검증 가능한 시나리오를 작성한다.
6. specs 폴더에 항목별 스펙 문서 초안을 만든다.
7. 기존 README.md는 삭제하지 않는다.
8. 기존 내용을 보존한다.
9. 아래 섹션을 README.md 뒤쪽에 추가하거나 기존 섹션을 보강한다.

README.md가 없으면 새로 만든다.

---

## README.md에 반드시 추가할 섹션

README.md에는 다음 섹션을 반드시 포함한다.

```md
## Detected Project Metadata

- Detected package name:
- Source of package name:
- Primary purpose:
- Initial README assumptions:

## Requirements Overview

### Product Goal

이 도구가 최종적으로 해결하려는 문제를 한 문단으로 정리한다.

### Users / Operators

- Steve
- Codex
- Hermes Agent

### Operating Model

- Codex develops and maintains the tool.
- GitHub stores source and history.
- Hermes operates the tool through MCP.
- Failures are reported as structured incidents.

## Top-Level Requirements

상위 요구사항을 ID 기반으로 정리한다.

예:

| ID | Requirement | Priority | Status | Spec |
|---|---|---:|---|---|
| R-001 | Provide npx CLI entrypoint | High | Planned | specs/001-cli.md |
| R-002 | Expose MCP tools for Hermes | High | Planned | specs/002-mcp.md |
| R-003 | Store structured artifacts | High | Planned | specs/003-artifacts.md |
| R-004 | Report structured incidents | High | Planned | specs/004-incidents.md |
| R-005 | Support safe periodic operation by Hermes | Medium | Planned | specs/005-hermes-ops.md |

## Phased Development Plan

### Phase 0: Repository Bootstrap

Goal:
- Prepare TypeScript/npx/MCP project skeleton.
- Preserve README requirements.
- Create specs and validation scenarios.

Deliverables:
- package.json
- src skeleton
- specs folder
- README updates
- initial tests

### Phase 1: Minimal Executable Demo

Goal:
- Make CLI and MCP health/demo commands work.

Deliverables:
- npx . health
- npx . run --input examples/job.input.json
- MCP health_check
- MCP run_job

### Phase 2: Real Tool Implementation

Goal:
- Implement the actual project-specific tool behavior from README requirements.

Deliverables:
- Feature-specific modules
- Real input validation
- Real artifact outputs
- Scenario tests

### Phase 3: Hermes Operation Loop

Goal:
- Let Hermes run recurring/bulk jobs safely.

Deliverables:
- Skill usage policy
- Cron prompt examples
- Incident reporting
- Stop-and-notify policy

### Phase 4: Maintenance and Improvement Loop

Goal:
- Use incidents and run results to guide future Codex improvements.

Deliverables:
- AGENTS.md maintenance rules
- specs updates
- regression tests
- changelog discipline

## Development TODO

TODO는 단계별로 작성한다.

예:

### Phase 0 TODO

- [ ] Read initial README and summarize requirements.
- [ ] Create TypeScript project skeleton.
- [ ] Create specs folder.
- [ ] Create validation scenarios.
- [ ] Add path handling policy.

### Phase 1 TODO

- [ ] Implement CLI health command.
- [ ] Implement CLI demo run command.
- [ ] Implement MCP health_check.
- [ ] Implement MCP run_job.
- [ ] Add tests for demo flow.

### Phase 2 TODO

- [ ] Convert README requirements into detailed specs.
- [ ] Implement real feature modules.
- [ ] Add scenario-based tests.
- [ ] Define artifact schema for real outputs.

### Phase 3 TODO

- [ ] Finalize Hermes Skill.
- [ ] Add recurring operation scenarios.
- [ ] Add incident reporting workflow.
- [ ] Validate stop-and-notify cases.

### Phase 4 TODO

- [ ] Review incidents.
- [ ] Update specs.
- [ ] Add regression tests.
- [ ] Improve tool behavior with Codex.

## Validation Scenarios

상위 요구사항별 검증 가능한 시나리오를 작성한다.

예:

### VS-001: Local CLI health check

Given the repository is installed locally  
When the user runs `npx . health`  
Then the command returns package metadata and status ok.

### VS-002: Demo job through CLI

Given `examples/job.input.json` exists  
When the user runs `npx . run --input examples/job.input.json`  
Then an artifact is created and the result status is ok.

### VS-003: Hermes MCP health check

Given Hermes has registered this repository as an MCP server  
When Hermes calls `health_check`  
Then the tool returns status ok and package metadata.

### VS-004: Invalid input handling

Given invalid input is provided  
When CLI or MCP run_job is called  
Then the tool returns a structured VALIDATION_ERROR.

### VS-005: Stop-and-notify policy

Given a job requires authentication, CAPTCHA, destructive action, or payment  
When the tool detects that condition  
Then it stops and returns a structured error that tells Hermes to notify Steve.

## Specs Index

- specs/000-overview.md
- specs/001-cli.md
- specs/002-mcp.md
- specs/003-artifacts.md
- specs/004-incidents.md
- specs/005-hermes-operations.md
- specs/006-validation-scenarios.md
- specs/007-future-features.md

## Current Scope

이번 초기화 단계에서 구현하는 범위:

- TypeScript project skeleton
- npx CLI skeleton
- MCP server skeleton
- demo job
- basic validation
- specs scaffolding
- README planning sections
- path safety policy

이번 단계에서 구현하지 않는 범위:

- 실제 브라우저 자동화
- 실제 외부 서비스 연동
- 실제 계정 인증 처리
- 실제 대량 운영 로직
- 실제 비즈니스 로직 완성

## Next Steps

다음 Codex 실행에서 진행할 수 있는 작업을 구체적으로 적는다.

예:

1. Expand specs/007-future-features.md into detailed implementation specs.
2. Implement the first real tool feature from specs.
3. Add scenario tests for that feature.
4. Update Hermes Skill with feature-specific operating instructions.
```

---

## specs 폴더 요구사항

1단계에서 반드시 specs 폴더를 만든다.

```text
specs/
├── 000-overview.md
├── 001-cli.md
├── 002-mcp.md
├── 003-artifacts.md
├── 004-incidents.md
├── 005-hermes-operations.md
├── 006-validation-scenarios.md
└── 007-future-features.md
```

각 파일은 상세 구현까지 강제하지 않고, 상위 요구사항과 향후 상세화 기준을 담는다.

---

## specs/000-overview.md

포함 내용:

```md
# Overview Spec

## Purpose

이 저장소가 해결하려는 문제.

## Operating Model

- Codex develops.
- GitHub stores.
- Hermes operates.
- Incidents improve future development.

## Requirement Sources

- Initial README.md
- User-provided requirements
- Hermes operation model

## Requirement Hierarchy

- Product goal
- Top-level requirements
- Feature specs
- Validation scenarios
- Implementation tasks

## Non-Goals

이번 단계에서 하지 않는 것.
```

---

## specs/001-cli.md

포함 내용:

```md
# CLI Spec

## Purpose

로컬 개발자와 Codex가 도구를 직접 실행하고 검증하기 위한 CLI.

## Required Commands

- npx . health
- npx . run --input examples/job.input.json
- npx . run --json '{...}'
- npx . inspect --job-id <jobId>
- npx . mcp

## Future Commands

초기 README 요구사항을 기반으로 향후 필요해 보이는 명령을 TODO로 남긴다.

## Validation Scenarios

CLI와 관련된 검증 시나리오를 연결한다.
```

---

## specs/002-mcp.md

포함 내용:

```md
# MCP Spec

## Purpose

Hermes가 이 도구를 호출하기 위한 MCP interface.

## Required Tools

- health_check
- run_job
- inspect_result

## Future Tools

초기 README 요구사항을 기반으로 향후 Hermes가 호출해야 할 도구를 TODO로 남긴다.

## Safety

- No destructive action by default.
- Stop on auth/CAPTCHA/payment/destructive actions.

## Validation Scenarios

MCP 관련 검증 시나리오.
```

---

## specs/003-artifacts.md

포함 내용:

```md
# Artifacts Spec

## Purpose

작업 결과를 재검증 가능하게 남긴다.

## Initial Artifact Types

- JSON run result
- logs placeholder
- future screenshots placeholder
- future reports placeholder

## Path Policy

Artifacts must be referenced by relative path in repository-facing outputs.

## Future Artifact Types

초기 README 요구사항을 기반으로 향후 필요 산출물을 TODO로 남긴다.
```

---

## specs/004-incidents.md

포함 내용:

```md
# Incidents Spec

## Purpose

Hermes 운영 중 문제가 생겼을 때 Steve와 Codex가 개선에 사용할 수 있는 구조화된 실패 보고서를 남긴다.

## Incident Triggers

- AUTH_REQUIRED
- CAPTCHA_BLOCKED
- RATE_LIMITED
- SELECTOR_CHANGED
- DESTRUCTIVE_ACTION_BLOCKED
- VALIDATION_ERROR
- UNKNOWN_ERROR
- success rate below threshold

## Incident Template

incident markdown template.

## Future Incident Automation

GitHub issue 생성, 알림 연동 등은 TODO로 남긴다.
```

---

## specs/005-hermes-operations.md

포함 내용:

```md
# Hermes Operations Spec

## Purpose

Hermes가 이 도구를 안전하게 장기 운영하기 위한 정책.

## Operating Rules

- Always run health_check first.
- Use run_job for work.
- Use inspect_result for verification.
- Stop and notify Steve on blocked states.

## Recurring Jobs

초기 README 요구사항을 기반으로 주기/대량 작업 후보를 TODO로 남긴다.

## Maintenance Loop

Incident -> Codex fix -> test -> GitHub push -> Hermes update.
```

---

## specs/006-validation-scenarios.md

포함 내용:

```md
# Validation Scenarios

## Scenario Format

Each scenario must include:

- ID
- Requirement
- Given
- When
- Then
- Verification method
- Related spec
- Status

## Initial Scenarios

VS-001 through VS-005를 README와 맞춰 작성한다.

## Future Scenarios

초기 README 요구사항에서 도출된 실제 기능 시나리오를 TODO로 남긴다.
```

---

## specs/007-future-features.md

초기 README에서 실제 개발해야 할 기능 후보를 뽑아 정리한다.

포함 내용:

```md
# Future Features

## Source

초기 README에서 도출된 기능 후보.

## Feature Backlog

| ID | Feature | Why it matters | Priority | Depends on | Validation scenario |
|---|---|---|---:|---|---|

## Phase Mapping

각 기능을 Phase 1, 2, 3, 4 중 어디에서 개발할지 배치한다.

## Open Questions

상세 구현 전 Steve에게 확인해야 할 질문을 정리한다.

## Deferred Decisions

지금 결정하지 않고 나중에 결정할 사항을 정리한다.
```

---

## 상위 요구사항 정리 방식

README의 내용이 모호하더라도 다음 기준으로 추론해 정리한다.

### Product Requirement

사용자가 궁극적으로 원하는 결과.

### Operational Requirement

Hermes가 반복/대량/주기 작업으로 수행해야 하는 일.

### Developer Requirement

Codex가 유지보수하기 쉽게 필요한 구조.

### Safety Requirement

자동화가 멈춰야 하는 조건.

### Observability Requirement

결과, 로그, artifact, incident를 남기는 방식.

### Integration Requirement

MCP, GitHub, Hermes Skill, future update flow.

각 요구사항에는 ID를 붙인다.

예:

```text
PR-001 Product goal
OR-001 Recurring operation
DR-001 TypeScript structure
SR-001 Stop on destructive action
OB-001 Artifact output
IR-001 MCP interface
```

---

## 검증 시나리오 작성 방식

각 시나리오는 반드시 검증 가능해야 한다.

형식:

```md
### VS-001: Scenario name

- Requirement: R-001
- Given:
- When:
- Then:
- Verification:
- Related files:
- Status: Planned
```

금지:

- “잘 동작해야 한다”
- “적절히 처리한다”
- “문제가 없어야 한다”

허용:

- “명령이 exit code 0으로 종료된다”
- “결과 JSON의 status가 ok다”
- “artifacts/<jobId>.json이 생성된다”
- “VALIDATION_ERROR가 반환된다”
- “incident markdown이 생성된다”

---

## package name 자동 결정 규칙

package name을 사용자에게 묻지 마라.

다음 순서로 자동 결정한다.

1. package.json이 이미 있고 name이 있으면 그 값을 우선 사용한다.
2. git remote origin URL이 있으면 저장소 이름을 사용한다.
3. git remote origin이 없으면 현재 작업 폴더 이름을 사용한다.

예:

```text
git@github.com:steve/my-hermes-tool.git -> my-hermes-tool
https://github.com/steve/my-hermes-tool.git -> my-hermes-tool
```

정규화 규칙:

- 소문자 사용
- 공백은 하이픈으로 변환
- 허용되지 않는 문자는 제거 또는 하이픈 처리
- 연속 하이픈은 하나로 축소
- 앞뒤 하이픈 제거
- 사용자가 별도 지시하지 않는 한 scoped package는 사용하지 않는다

package.json name, README, Hermes config 예시, npx 예제는 모두 이 package name을 사용한다.

README 상단 또는 적절한 위치에 다음을 표시한다.

```md
Detected package name: <package-name>
```

---

## 프로젝트 구조

다음 구조를 만든다.

```text
.
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── eslint.config.js
├── README.md
├── TOOL_SPEC.md
├── AGENTS.md
├── CHANGELOG.md
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── specs/
│   ├── 000-overview.md
│   ├── 001-cli.md
│   ├── 002-mcp.md
│   ├── 003-artifacts.md
│   ├── 004-incidents.md
│   ├── 005-hermes-operations.md
│   ├── 006-validation-scenarios.md
│   └── 007-future-features.md
├── src/
│   ├── cli.ts
│   ├── core/
│   │   ├── runJob.ts
│   │   ├── healthCheck.ts
│   │   ├── inspectResult.ts
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   └── validation.ts
│   └── mcp/
│       └── server.ts
├── skills/
│   └── hermes-npx-tool/
│       └── SKILL.md
├── hermes/
│   ├── config.example.yaml
│   ├── config.fragment.yaml
│   ├── cron.example.md
│   └── operating-loop.md
├── examples/
│   ├── job.input.json
│   ├── job.invalid.json
│   └── expected.output.json
├── artifacts/
│   └── .gitkeep
├── incidents/
│   └── .gitkeep
└── tests/
    ├── healthCheck.test.ts
    ├── runJob.test.ts
    └── validation.test.ts
```

---

## CLI 요구사항

다음 명령이 동작해야 한다.

```bash
npx . health
npx . run --input examples/job.input.json
npx . run --json '{"jobType":"demo","targets":["https://example.com"],"options":{}}'
npx . inspect --job-id demo-job
npx . mcp
```

package가 publish된 후에는 다음도 가능해야 한다.

```bash
npx <detected-package-name> health
npx <detected-package-name> run --input examples/job.input.json
npx <detected-package-name> mcp
```

---

## Core 입력 스키마

```json
{
  "jobType": "demo",
  "targets": ["https://example.com"],
  "options": {}
}
```

## Core 출력 스키마

```json
{
  "jobId": "string",
  "status": "ok | partial | failed",
  "summary": "string",
  "startedAt": "ISO datetime",
  "finishedAt": "ISO datetime",
  "counts": {
    "total": 0,
    "success": 0,
    "failed": 0
  },
  "artifacts": [],
  "errors": []
}
```

## Error 스키마

```json
{
  "code": "AUTH_REQUIRED | CAPTCHA_BLOCKED | RATE_LIMITED | SELECTOR_CHANGED | VALIDATION_ERROR | DESTRUCTIVE_ACTION_BLOCKED | UNKNOWN_ERROR",
  "message": "string",
  "retryable": true,
  "details": {}
}
```

---

## Demo job 동작

- 실제 브라우저 자동화는 아직 구현하지 않는다.
- demo job은 targets 배열을 순회하며 성공 결과를 만든다.
- 결과 JSON을 artifacts/<jobId>.json에 저장한다.
- artifact 경로는 출력에서 상대경로로 표시한다.
- 실패 케이스 검증을 위해 invalid input은 VALIDATION_ERROR를 반환한다.

---

## MCP 서버 요구사항

@modelcontextprotocol/sdk를 사용해서 stdio MCP server를 구현한다.

MCP tools:

### 1. health_check

반환 정보:

- Node version
- cwd
- package name
- package version
- timestamp
- TOOL_WORKSPACE env

주의:

- cwd나 TOOL_WORKSPACE를 사용자-facing 문서에 기록할 때는 실제 절대경로 대신 `<PROJECT_ROOT>` 또는 `<TOOL_WORKSPACE>`로 마스킹한다.

### 2. run_job

- core/runJob.ts 호출
- input schema 검증
- 결과 JSON 반환
- artifacts에 저장

### 3. inspect_result

- jobId를 받아 artifacts/<jobId>.json이 있으면 읽어서 반환
- 없으면 구조화된 not found 결과 반환

---

## Hermes config 예시

hermes/config.example.yaml을 작성한다.

문서용 예시는 절대경로를 쓰지 않는다.

```yaml
mcp_servers:
  steve_npx_tool:
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

skills:
  external_dirs:
    - "<PROJECT_ROOT>/skills"
```

주의:

- `<PROJECT_ROOT>`는 문서용 placeholder다.
- 실제 Hermes config에는 2단계 installer가 runtime에 절대경로를 계산해서 기록한다.
- 이 저장소에는 실제 절대경로를 commit하지 않는다.

---

## Hermes Skill 요구사항

skills/hermes-npx-tool/SKILL.md를 작성한다.

반드시 포함:

- 언제 이 skill을 사용하는지
- Hermes는 먼저 MCP health_check를 실행해야 한다
- 실제 작업은 MCP run_job을 사용해야 한다
- 결과는 inspect_result 또는 artifact 파일로 검증해야 한다
- status, counts, errors를 확인해야 한다
- 다음 상황에서는 즉시 중단하고 Steve에게 보고해야 한다:
  - AUTH_REQUIRED
  - CAPTCHA_BLOCKED
  - RATE_LIMITED가 반복됨
  - SELECTOR_CHANGED
  - DESTRUCTIVE_ACTION_BLOCKED
  - 결제/삭제/대량 변경/권한 변경 작업
  - output schema 불일치
  - 성공률 80% 미만

보고 포맷:

- 작업명
- jobId
- 성공/실패 수
- 실패 원인
- artifact 경로
- 재시도 여부
- Codex에게 맡길 수정 제안

---

## Cron 예시

hermes/cron.example.md에 Hermes에게 시킬 수 있는 주기 작업 프롬프트를 작성한다.

예시:

```text
매일 오전 9시에 hermes-npx-tool skill을 사용해서 demo job을 실행해라.
먼저 health_check를 실행하고, 이상이 없으면 run_job을 실행해라.
결과 artifact를 확인하고 성공률이 80% 미만이면 Steve에게 보고해라.
실패가 있으면 incidents 폴더에 incident markdown을 작성해라.
도구 수정이 필요하면 Codex에게 줄 수 있는 수정 지침 초안을 함께 작성해라.
```

---

## Incident 파일 요구사항

문제 발생 시 아래 형식으로 incidents/<date>-<jobId>.md를 만들 수 있도록 문서화한다.

```md
# Incident

- Job:
- Job ID:
- Tool:
- Tool version:
- Started at:
- Finished at:
- Status:
- Success count:
- Failure count:
- Error code:
- Error message:
- Retryable:
- Artifact:
- Suspected cause:
- Suggested Codex fix:
- Recommended next action:
```

---

## 테스트

vitest를 사용한다.

최소 테스트:

1. healthCheck가 ok 정보를 반환한다.
2. runJob이 demo 입력에 대해 status ok를 반환한다.
3. runJob이 artifact 파일을 생성한다.
4. 잘못된 입력은 VALIDATION_ERROR를 반환한다.
5. inspectResult가 존재하는 jobId 결과를 읽는다.
6. inspectResult가 없는 jobId에 대해 not found를 반환한다.
7. 저장소 문서와 yaml 예시에 실제 절대경로가 포함되지 않았는지 검사한다.
8. specs/006-validation-scenarios.md에 README의 핵심 요구사항에 대응되는 검증 시나리오가 존재하는지 확인한다.

---

## package.json scripts

package.json에 최소 다음 scripts를 포함한다.

```json
{
  "scripts": {
    "build": "tsup src/cli.ts src/mcp/server.ts --format esm --dts --clean",
    "dev": "tsx src/cli.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint .",
    "prepublishOnly": "npm run build"
  }
}
```

package.json 설정:

- type: "module"
- bin 등록
- files에 dist, README, TOOL_SPEC, skills, hermes, specs 포함
- engines.node는 >=20 권장

---

## CI

.github/workflows/ci.yml을 작성한다.

실행 명령:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

---

## 문서 요구사항

README.md에 포함:

1. 이 프로젝트의 목적
2. Detected package name
3. 기존 README에서 읽은 요구사항 요약
4. 상위 요구사항 목록
5. 단계별 개발 계획
6. 개발 TODO
7. 검증 시나리오
8. Specs Index
9. 설치
10. 로컬 개발
11. npx 실행
12. CLI 사용법
13. MCP 서버 실행법
14. Hermes config 연결 방법
15. Hermes Skill 등록법
16. Cron 운영 루프
17. Artifact/Incident 운영 방식
18. Codex로 유지보수하는 방식
19. Path Handling

TOOL_SPEC.md에 포함:

- input contract
- output contract
- error contract
- retry policy
- stop-and-notify policy
- artifact policy
- path policy
- relation to specs folder

AGENTS.md에 포함:

- Codex가 향후 작업할 때 지켜야 할 규칙
- core 로직과 CLI/MCP 분리 원칙
- output schema를 깨지 말 것
- 에러 코드를 임의로 바꾸지 말 것
- 새 기능 추가 시 테스트와 TOOL_SPEC 업데이트 필수
- 새 기능 추가 시 관련 specs 문서 업데이트 필수
- 새 기능 추가 시 validation scenario 업데이트 필수
- destructive action은 기본 차단
- Hermes는 운영자라는 전제 유지
- 절대경로 commit 금지

---

## 완료 조건

다음 명령이 성공해야 한다.

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npx . health
npx . run --input examples/job.input.json
npx . inspect --job-id <실제 생성된 jobId>
npx . mcp
```

문서 완료 조건:

- README.md에 상위 요구사항, 단계별 개발 계획, TODO, 검증 시나리오, Specs Index가 있다.
- specs 폴더가 있고 000~007 문서가 있다.
- specs/007-future-features.md에 실제 README에서 도출한 향후 기능 후보가 있다.
- specs/006-validation-scenarios.md에 검증 가능한 시나리오가 있다.
- 저장소 내부 파일에 실제 로컬 절대경로가 없다.

---

## 마지막 보고

작업이 끝나면 다음을 요약한다.

1. 기존 README에서 읽은 요구사항 요약
2. 도출한 상위 요구사항
3. 단계별 개발 계획
4. 생성한 TODO
5. 생성한 specs 문서 목록
6. 검증 시나리오 목록
7. 결정된 package name
8. 생성된 주요 파일
9. README에 추가/수정한 섹션
10. 실행한 검증 명령과 결과
11. Hermes에 연결하는 방법
12. 다음 TODO
13. 실제 기능 구현을 시작하려면 어느 specs 문서부터 상세화해야 하는지

---

## 작업 순서

1. README.md가 있으면 먼저 읽는다.
2. README.md의 요구사항을 요약한다.
3. 상위 요구사항을 ID 기반으로 정리한다.
4. 단계별 개발 계획을 수립한다.
5. 향후 개발 TODO를 Phase별로 작성한다.
6. 검증 가능한 시나리오를 작성한다.
7. specs 폴더와 000~007 문서를 만든다.
8. specs/007-future-features.md에 README에서 도출한 향후 개발 항목을 정리한다.
9. 현재 git remote 또는 폴더명으로 package name을 결정한다.
10. README.md에 Implementation Plan, Top-Level Requirements, Development TODO, Validation Scenarios, Specs Index, Path Handling을 추가한다.
11. 저장소 구조를 만든다.
12. TypeScript/npm/tsup/vitest/eslint 환경을 구성한다.
13. core types/errors/validation을 구현한다.
14. healthCheck/runJob/inspectResult를 구현한다.
15. CLI를 구현한다.
16. MCP server를 구현한다.
17. examples를 작성한다.
18. tests를 작성한다.
19. Hermes skill/config/cron 문서를 작성한다.
20. README/TOOL_SPEC/AGENTS/CHANGELOG를 작성한다.
21. 저장소 문서에 절대경로가 없는지 확인한다.
22. npm install 후 전체 검증 명령을 실행한다.
23. 실패하면 수정하고 다시 검증한다.
24. 최종 요약을 출력한다.

지금부터 이 저장소에서 위 요구사항을 구현해라.
