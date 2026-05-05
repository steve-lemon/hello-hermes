# Codex 최종 지침서 1: 저장소 초기화

## 목적

이 지침서는 빈 GitHub 저장소를 로컬에 클론한 뒤, Codex가 TypeScript + npx + MCP + Hermes Skill 기반 도구 프로젝트를 초기화하도록 하기 위한 최종 작업 지침서다.

이 저장소는 나중에 Hermes Agent에 연결되어, Hermes가 도구를 직접 개발하지 않고 MCP를 통해 운영할 수 있어야 한다.

---

## 핵심 목표

- TypeScript 기반 프로젝트
- npx 실행 가능한 CLI
- 같은 core logic을 공유하는 CLI + MCP 서버
- Hermes가 사용할 Skill 문서
- artifact / incident 운영 구조
- 테스트, CI, 문서 포함
- 기존 README.md를 먼저 읽고, 프로젝트 계획을 README.md에 반영
- 저장소 내부에는 절대경로를 절대 남기지 않음

---

## Codex에게 줄 작업 지시

너는 이 빈 GitHub 저장소에 TypeScript + npx + MCP + Hermes Skill 기반의 “Hermes 운영 루프용 도구 프로젝트”를 구축한다.

## 상황

- 사용자는 GitHub 저장소를 이미 만들었다.
- 저장소에는 초기 README.md가 있을 수 있다.
- README.md에는 프로젝트 이름, 목적, 기본 요구사항, 초기 아이디어가 정리되어 있을 수 있다.
- 너는 README.md를 먼저 읽고, 그 내용을 기준으로 프로젝트 구조와 초기 구현 계획을 수립해야 한다.
- README.md는 삭제하거나 덮어쓰지 않는다.
- 기존 README.md 내용을 보존하고, 필요한 섹션을 추가하거나 보강한다.

---

## 역할 분리

- Steve: 도구의 요구사항 정의, 운영 판단, 최종 승인
- Codex: 도구 개발, 개선, 유지보수
- GitHub: 소스 관리, 변경 이력, 배포 기준점
- Hermes: 장기 실행 운영자
- MCP: Hermes가 이 도구를 호출하는 실행 인터페이스
- Skill: Hermes에게 이 도구를 언제, 어떻게, 어떤 안전 규칙으로 쓸지 알려주는 운영 매뉴얼

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

- README.md, TOOL_SPEC.md, AGENTS.md, hermes/*.md, hermes/*.yaml에는 실제 로컬 절대경로를 쓰지 않는다.
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
2. 추출한 내용을 기준으로 초기 구현 계획을 작성한다.
3. 기존 README.md는 삭제하지 않는다.
4. 기존 내용을 보존한다.
5. 아래 섹션을 README.md 뒤쪽에 추가하거나 기존 섹션을 보강한다.

추가할 README 섹션:

```md
## Implementation Plan

### Project Summary

README의 기존 내용을 바탕으로 해석한 프로젝트 목적을 요약한다.

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

이번 초기화 단계에서 구현하는 범위와 아직 구현하지 않는 범위를 구분한다.

### Next Steps

향후 실제 브라우저 자동화, 외부 API 연동, 인증 처리, 스케줄 작업 등을 확장하는 계획을 적는다.
```

README.md가 없으면 새로 만든다.

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
- files에 dist, README, TOOL_SPEC, skills, hermes 포함
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
4. 초기 구현 계획
5. 설치
6. 로컬 개발
7. npx 실행
8. CLI 사용법
9. MCP 서버 실행법
10. Hermes config 연결 방법
11. Hermes Skill 등록법
12. Cron 운영 루프
13. Artifact/Incident 운영 방식
14. Codex로 유지보수하는 방식
15. Path Handling

TOOL_SPEC.md에 포함:

- input contract
- output contract
- error contract
- retry policy
- stop-and-notify policy
- artifact policy
- path policy

AGENTS.md에 포함:

- Codex가 향후 작업할 때 지켜야 할 규칙
- core 로직과 CLI/MCP 분리 원칙
- output schema를 깨지 말 것
- 에러 코드를 임의로 바꾸지 말 것
- 새 기능 추가 시 테스트와 TOOL_SPEC 업데이트 필수
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

---

## 마지막 보고

작업이 끝나면 다음을 요약한다.

1. 기존 README에서 읽은 요구사항 요약
2. 결정된 package name
3. 생성된 주요 파일
4. README에 추가/수정한 섹션
5. 실행한 검증 명령과 결과
6. Hermes에 연결하는 방법
7. 다음 TODO
8. 실제 브라우저 자동화 도구를 붙이려면 어느 파일부터 수정하면 되는지

---

## 작업 순서

1. README.md가 있으면 먼저 읽는다.
2. README.md의 요구사항을 요약한다.
3. 현재 git remote 또는 폴더명으로 package name을 결정한다.
4. 초기 구현 계획을 수립한다.
5. README.md에 Implementation Plan과 Path Handling을 추가한다.
6. 저장소 구조를 만든다.
7. TypeScript/npm/tsup/vitest/eslint 환경을 구성한다.
8. core types/errors/validation을 구현한다.
9. healthCheck/runJob/inspectResult를 구현한다.
10. CLI를 구현한다.
11. MCP server를 구현한다.
12. examples를 작성한다.
13. tests를 작성한다.
14. Hermes skill/config/cron 문서를 작성한다.
15. README/TOOL_SPEC/AGENTS/CHANGELOG를 작성한다.
16. 저장소 문서에 절대경로가 없는지 확인한다.
17. npm install 후 전체 검증 명령을 실행한다.
18. 실패하면 수정하고 다시 검증한다.
19. 최종 요약을 출력한다.

지금부터 이 저장소에서 위 요구사항을 구현해라.
