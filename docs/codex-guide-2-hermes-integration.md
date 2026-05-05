# Codex 최종 지침서 2: Hermes 연동 + GitHub 업데이트 자동화

## 목적

이 지침서는 이미 TypeScript + npx + MCP + Hermes Skill 구조가 잡힌 저장소에, Hermes가 설치된 컴퓨터에서 사용할 수 있는 연동 자동화와 GitHub 업데이트 자동화 구조를 추가하기 위한 최종 작업 지침서다.

최종 목표는 다음과 같다.

- 이 저장소를 Hermes가 설치된 컴퓨터에 clone한다.
- `npm run hermes:install`로 Hermes config에 MCP 서버와 Skill 경로를 자동 등록한다.
- `npm run hermes:update`로 이후 clone 경로나 빌드 결과 변경을 반영한다.
- `npm run hermes:doctor`로 연동 상태를 점검한다.
- Hermes가 MCP tool을 통해 repo pull + install + build + update까지 수행할 수 있게 한다.
- 기존 `~/.hermes/config.yaml`은 안전하게 백업하고, 파괴적으로 덮어쓰지 않는다.
- 저장소 내부에는 절대경로를 commit하지 않는다.
- 실제 Hermes config에는 runtime에 계산된 절대경로만 기록한다.

---

## Codex에게 줄 작업 지시

너는 이미 TypeScript + npx + MCP + Hermes Skill 구조가 잡힌 저장소에 “Hermes 연동 설치/업데이트/검증 자동화”와 “GitHub pull 기반 자동 업데이트 MCP tool”을 추가한다.

## 상황

- Hermes Agent 자체는 이미 설치되어 있다.
- 이 저장소는 GitHub에 있고, Hermes가 설치된 컴퓨터에 clone될 예정이다.
- 사용자는 이 저장소를 Hermes에 안전하게 연결하고 싶다.
- 최초 연결은 install, 이후 변경 반영은 update, 상태 점검은 doctor로 수행한다.
- Hermes가 필요 시 이 repo를 git pull하고, npm install/build/update를 실행할 수 있어야 한다.
- 기존 ~/.hermes/config.yaml은 절대 파괴적으로 덮어쓰면 안 된다.
- 저장소에는 로컬 절대경로를 남기면 안 된다.

---

## 최종 목표

아래 명령이 동작해야 한다.

```bash
npm run hermes:install
npm run hermes:update
npm run hermes:doctor
```

MCP tool로 다음도 가능해야 한다.

```text
update_repo
```

update_repo는 Hermes가 호출하는 도구이며 다음을 수행한다.

1. git pull
2. npm install
3. npm run build
4. npm run hermes:update
5. health_check로 검증 가능한 상태 유지
6. 결과를 구조화된 JSON으로 반환

---

## 추가 scripts

package.json scripts에 다음을 추가한다.

```json
{
  "hermes:install": "tsx scripts/hermes-install.ts",
  "hermes:update": "tsx scripts/hermes-update.ts",
  "hermes:doctor": "tsx scripts/hermes-doctor.ts",
  "hermes:install:dry": "tsx scripts/hermes-install.ts --dry-run",
  "hermes:update:dry": "tsx scripts/hermes-update.ts --dry-run"
}
```

기존 scripts는 삭제하지 않는다.

---

## 추가 파일 구조

다음 파일을 추가한다.

```text
scripts/
├── hermes-install.ts
├── hermes-update.ts
├── hermes-doctor.ts
└── utils/
    ├── detectPackage.ts
    ├── hermesConfig.ts
    ├── paths.ts
    └── logger.ts

src/
└── core/
    └── updateRepo.ts

hermes/
├── config.fragment.yaml
├── install-and-connect.md
├── github-update.md
└── operating-loop.md
```

이미 존재하는 파일은 삭제하지 말고 필요한 부분만 보강한다.

---

## 절대경로 정책

### 저장소 내부

저장소 내부에는 실제 절대경로를 쓰지 않는다.

금지:

```text
/Users/...
/home/...
C:\Users\...
```

허용:

```text
<PROJECT_ROOT>/dist/mcp/server.js
<PROJECT_ROOT>/skills
<TOOL_WORKSPACE>
./skills
dist/mcp/server.js
```

### Hermes config

실제 `~/.hermes/config.yaml`에는 MCP 서버 실행을 위해 절대경로가 필요할 수 있다.

따라서 installer/update 스크립트가 runtime에만 다음 값을 계산해서 외부 config에 기록한다.

- `<absolute-project-path>/dist/mcp/server.js`
- `<absolute-project-path>/skills`

이 절대경로는 repository에 commit하지 않는다.

---

## 1. package/project id 감지

다음 순서로 package/project id를 감지한다.

1. package.json의 name을 우선 사용한다.
2. 없으면 git remote origin의 repo 이름을 사용한다.
3. 그것도 없으면 현재 폴더명을 사용한다.

Hermes config key로 쓸 safe_project_id를 만든다.

예:

```text
my-hermes-tool -> my_hermes_tool
@steve/my-hermes-tool -> steve_my_hermes_tool
```

safe_project_id 규칙:

- 소문자
- 영문/숫자/언더스코어만 사용
- 하이픈과 슬래시는 언더스코어로 변환
- 연속 언더스코어는 하나로 축소
- 앞뒤 언더스코어 제거

---

## 2. hermes:install

다음을 수행한다.

1. 현재 프로젝트 절대경로 확인
2. package name 확인
3. safe_project_id 생성
4. dist/mcp/server.js 존재 확인
5. 없으면 npm run build 실행
6. ~/.hermes 디렉터리 확인
7. ~/.hermes/config.yaml 확인
8. config.yaml이 없으면 최소 config를 생성한다
9. config.yaml 수정 전 반드시 백업 생성

백업 예:

```text
~/.hermes/config.yaml.backup-YYYYMMDD-HHmmss
```

10. 기존 config를 YAML로 파싱한다
11. mcp_servers.<safe_project_id>를 추가 또는 갱신한다
12. skills.external_dirs에 <absolute-project-path>/skills를 추가한다
13. 중복 경로는 추가하지 않는다
14. 기존 다른 mcp_servers, skills 설정은 보존한다
15. TOOL_WORKSPACE 기본값은 <home>/agent-workspace로 설정한다
16. artifacts, incidents 디렉터리가 없으면 생성한다
17. 설치 결과를 요약 출력한다

반영할 MCP config 형태:

```yaml
mcp_servers:
  <safe_project_id>:
    command: "node"
    args:
      - "<absolute-project-path>/dist/mcp/server.js"
    env:
      TOOL_WORKSPACE: "<home>/agent-workspace"
    tools:
      include:
        - health_check
        - run_job
        - inspect_result
        - update_repo

skills:
  external_dirs:
    - "<absolute-project-path>/skills"
```

주의:

- Hermes 자체를 설치하지 않는다.
- npm install을 자동으로 실행하지 않는다. 필요하면 안내만 한다.
- git pull을 자동으로 실행하지 않는다.
- 기존 사용자 설정을 보존한다.
- 저장소 내부 문서에는 위 실제 절대경로를 기록하지 않는다.

---

## 3. hermes:update

다음을 수행한다.

1. git pull은 자동으로 실행하지 않는다.
2. 현재 로컬 파일 기준으로만 반영한다.
3. npm run build 실행
4. ~/.hermes/config.yaml 백업 생성
5. mcp_servers.<safe_project_id>를 현재 경로 기준으로 갱신한다.
6. skills.external_dirs에 현재 skills 경로가 없으면 추가한다.
7. tools.include에 update_repo가 없으면 추가한다.
8. 기존 다른 설정은 보존한다.
9. 업데이트 결과를 요약 출력한다.

업데이트는 최초 설치 이후 다음 상황에서 사용한다.

- repo를 다른 위치에 clone했다.
- dist/mcp/server.js가 새로 빌드됐다.
- skill 문서가 변경됐다.
- MCP tool 목록이 변경됐다.
- config가 이전 경로를 가리키고 있다.

---

## 4. hermes:doctor

다음을 점검한다.

- package name 감지 성공 여부
- 현재 프로젝트 경로
- dist/mcp/server.js 존재 여부
- skills 디렉터리 존재 여부
- skills 안에 SKILL.md 존재 여부
- ~/.hermes/config.yaml 존재 여부
- mcp_servers.<safe_project_id> 등록 여부
- 등록된 command/args가 현재 프로젝트를 가리키는지
- skills.external_dirs에 현재 skills 경로가 있는지
- tools.include에 health_check, run_job, inspect_result, update_repo가 있는지
- node 실행 가능 여부
- git 실행 가능 여부
- git remote origin 존재 여부
- 현재 branch
- working tree dirty 여부
- artifacts 디렉터리 쓰기 가능 여부
- incidents 디렉터리 쓰기 가능 여부
- 가능하면 npx . health 또는 node dist/cli.js health를 실행해서 health 결과 확인

출력 예:

```text
Hermes Integration Doctor

[OK] package name: my-hermes-tool
[OK] project path: <PROJECT_ROOT>
[OK] build output: dist/mcp/server.js
[OK] Hermes config: ~/.hermes/config.yaml
[OK] MCP server registered: my_hermes_tool
[OK] skills path registered
[OK] update_repo tool included
[OK] git remote origin found
[OK] artifacts writable
[OK] incidents writable
[WARN] working tree has uncommitted changes
[WARN] Hermes restart may be required
```

주의:

- 사용자-facing 출력에서 절대경로는 가능하면 `<PROJECT_ROOT>`로 마스킹한다.
- 실제 ~/.hermes/config.yaml이 없을 수 있다.
- 그 경우 메시지를 명확하게 출력한다.
- doctor는 CI 환경에서 실패하지 않도록 설계한다.
- 치명적 문제와 권장 조치를 구분한다.

---

## 5. dry-run

--dry-run 옵션이 있으면 파일을 쓰지 않는다.

대신 아래를 출력한다.

- 감지된 package name
- safe_project_id
- 수정 대상 config 경로
- 추가/갱신될 MCP server block
- 추가될 skills path
- 생성될 디렉터리
- 생성될 백업 경로

명령:

```bash
npm run hermes:install:dry
npm run hermes:update:dry
```

dry-run 출력에서도 실제 절대경로는 기본적으로 마스킹한다.
필요하면 --verbose 옵션에서만 실제 경로를 표시한다.

---

## 6. config 수정 안전장치

반드시 지킬 것:

- ~/.hermes/config.yaml 전체를 덮어쓰지 않는다.
- YAML 파싱/쓰기에는 yaml 패키지를 사용한다.
- 기존 주석은 보존하지 못해도 괜찮지만, 기존 값은 보존해야 한다.
- 수정 전 백업은 필수다.
- 실패 시 어떤 파일을 건드렸는지, 백업 위치가 어디인지 명확히 출력한다.
- 같은 safe_project_id가 있으면 이 프로젝트 항목으로 갱신한다.
- 다른 프로젝트 항목은 절대 변경하지 않는다.
- skills.external_dirs 전체를 초기화하지 않는다.
- 기존 mcp_servers 전체를 초기화하지 않는다.

---

## 7. GitHub 자동 업데이트 MCP tool

Hermes가 저장소 업데이트를 수행할 수 있도록 MCP tool `update_repo`를 추가한다.

### src/core/updateRepo.ts 추가

요구사항:

- git pull 실행
- npm install 실행
- npm run build 실행
- npm run hermes:update 실행
- 각 단계 결과를 구조화해서 반환
- 실패 단계, exit code, stdout/stderr 일부를 반환
- destructive command 금지
- force reset, clean, checkout, push 실행 금지
- working tree가 dirty일 경우 기본적으로 중단하고 Steve에게 보고하도록 반환
- 옵션으로 allowDirty가 true일 때만 계속 진행 가능하게 설계할 수 있으나, 기본값은 false

입력 예:

```json
{
  "allowDirty": false,
  "runInstall": true,
  "runBuild": true,
  "runHermesUpdate": true
}
```

출력 예:

```json
{
  "status": "ok | failed",
  "steps": [
    {
      "name": "git status",
      "status": "ok"
    },
    {
      "name": "git pull",
      "status": "ok"
    },
    {
      "name": "npm install",
      "status": "ok"
    },
    {
      "name": "npm run build",
      "status": "ok"
    },
    {
      "name": "npm run hermes:update",
      "status": "ok"
    }
  ],
  "summary": "Repository updated and Hermes config refreshed.",
  "errors": []
}
```

실패 예:

```json
{
  "status": "failed",
  "steps": [
    {
      "name": "git status",
      "status": "failed",
      "message": "Working tree has uncommitted changes."
    }
  ],
  "summary": "Update stopped before git pull.",
  "errors": [
    {
      "code": "WORKING_TREE_DIRTY",
      "message": "Commit or stash local changes before updating.",
      "retryable": false
    }
  ]
}
```

---

## 8. MCP server에 update_repo 등록

src/mcp/server.ts에 MCP tool을 추가한다.

Tool name:

```text
update_repo
```

설명:

```text
Pull latest GitHub changes, install dependencies, rebuild the project, and refresh Hermes integration for this tool.
```

주의:

- update_repo는 destructive action이 아니어야 한다.
- git pull만 허용한다.
- git reset, git clean, git push는 금지한다.
- 실패 시 structured error를 반환한다.
- Hermes가 update_repo를 호출한 뒤 반드시 health_check를 실행하도록 Skill에 적는다.

---

## 9. Hermes Skill 업데이트

skills/hermes-npx-tool/SKILL.md에 다음 내용을 추가한다.

```md
## Repository Update Procedure

Use this only when Steve asks to update this tool or when scheduled maintenance requires pulling the latest GitHub version.

Steps:

1. Run `update_repo`.
2. If it succeeds, run `health_check`.
3. If health_check succeeds, report the updated version/status.
4. If update_repo fails, stop and report the failed step.
5. Do not retry destructive commands.
6. Do not run git reset, git clean, git push, or checkout.
7. If the working tree is dirty, stop and notify Steve.

## Scheduled Update Policy

For scheduled updates:

1. Prefer low-traffic hours.
2. Run update_repo.
3. Run health_check.
4. Run a small demo job.
5. If any step fails, create an incident report.
6. Do not continue with production-scale jobs after a failed update.
```

---

## 10. Cron 자동 업데이트 예시

hermes/cron.example.md 또는 hermes/github-update.md에 다음 예시를 추가한다.

```text
매일 새벽 3시에 이 도구의 skill을 사용해서 정기 업데이트를 수행해라.

절차:

1. update_repo 실행
2. health_check 실행
3. demo job 1회 실행
4. 결과 확인
5. 실패 시 incident 작성 후 Steve에게 보고
6. 성공 시 간단히 업데이트 요약만 남김

주의:

- working tree가 dirty이면 중단
- git reset, git clean, git push 금지
- 업데이트 실패 후 대량 작업 실행 금지
```

---

## 11. README 업데이트

사용자가 이미 만든 README.md를 삭제하지 마라.

기존 내용을 보존하고, 아래 섹션을 뒤에 추가한다.

```md
## Hermes Integration

### First install on Hermes machine

```bash
git clone <repo-url>
cd <repo-name>
npm install
npm run build
npm run hermes:install
npm run hermes:doctor
```

### Update after git pull

```bash
cd <repo-name>
git pull
npm install
npm run hermes:update
npm run hermes:doctor
```

### Dry run

```bash
npm run hermes:install:dry
npm run hermes:update:dry
```

### What the installer changes

- Adds this repo's MCP server to `~/.hermes/config.yaml`
- Adds this repo's skills directory to Hermes external skill dirs
- Creates artifacts and incidents directories
- Backs up config.yaml before modifying it
- Does not install Hermes itself
- Does not overwrite unrelated Hermes settings

### Path Handling

This repository does not store absolute local paths.

- Use relative paths inside the repository.
- Use `<PROJECT_ROOT>` in documentation examples.
- Runtime installers may resolve absolute paths when updating external Hermes config.
- Do not commit `/Users/...`, `/home/...`, or `C:\Users\...` paths.

### After install

Restart Hermes or reload its config if needed.

Then ask Hermes:

“Use this tool's skill and run health_check.”
```

주의: 위 섹션을 README에 넣을 때 중첩된 markdown code fence가 깨지지 않도록 적절히 처리한다.

---

## 12. hermes/install-and-connect.md 작성

다음을 포함한다.

- 전제: Hermes는 이미 설치되어 있음
- 이 repo를 clone한 뒤 설치하는 방법
- install/update/doctor 차이
- config에 들어가는 MCP server 예시
- skills.external_dirs 설명
- Hermes 재시작 필요 가능성
- 경로 정책
- 문제 해결

문제 해결 항목:

- dist/mcp/server.js 없음
- node command 못 찾음
- config.yaml 파싱 실패
- MCP tool 안 보임
- skill 안 보임
- 경로가 이전 clone 위치를 가리킴
- TOOL_WORKSPACE 권한 문제
- artifacts/incidents 디렉터리 쓰기 실패

---

## 13. hermes/config.fragment.yaml 작성

실제 값 대신 placeholder를 포함한다.

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

skills:
  external_dirs:
    - "<PROJECT_ROOT>/skills"
```

---

## 14. hermes/operating-loop.md 작성

다음을 포함한다.

- Steve/Codex/Hermes 역할 분리
- 개발 머신 흐름
- Hermes 머신 흐름
- 최초 설치
- 업데이트
- Doctor 점검
- GitHub pull 기반 자동 업데이트
- 장애 발생 시 incident 작성 방식
- Codex에게 넘길 수정 지침 작성 방식

운영 루프 예:

```text
1. Steve creates or updates tool requirements.
2. Codex implements the tool locally.
3. Tests and CLI checks pass.
4. Steve pushes to GitHub.
5. Hermes machine pulls the repo manually or via update_repo.
6. npm run hermes:update refreshes local Hermes integration.
7. Hermes uses MCP tools through the registered skill.
8. Failures are captured as incidents.
9. Steve gives incident context back to Codex for fixes.
```

---

## 15. hermes/github-update.md 작성

다음을 포함한다.

- update_repo tool의 목적
- 언제 사용하면 되는지
- 언제 사용하면 안 되는지
- dirty working tree 정책
- 허용되는 git 명령
- 금지되는 git 명령
- update 후 health_check / demo job 검증 절차
- 실패 시 incident 작성 규칙

금지 명령:

```text
git reset
git clean
git push
git checkout
rm -rf
```

허용 명령:

```text
git status
git remote -v
git pull
```

---

## 16. 의존성

필요하면 package.json에 다음 의존성을 추가한다.

dependencies:

- yaml

devDependencies:

- tsx

기존에 있으면 중복 추가하지 않는다.

---

## 17. 테스트

기존 테스트 외에 다음 테스트를 추가한다.

1. updateRepo가 dirty working tree에서 중단하는지 테스트 가능하게 설계
2. updateRepo가 command allowlist를 지키는지 확인
3. 문서와 yaml 예시에 실제 절대경로가 포함되지 않았는지 검사
4. hermes config merge 로직이 기존 mcp_servers를 보존하는지 확인
5. skills.external_dirs 중복 추가를 방지하는지 확인

---

## 18. 검증 명령

작업 완료 전 아래를 실행한다.

```bash
npm install
npm run build
npm test
npm run hermes:install:dry
npm run hermes:doctor
```

주의:

- hermes:doctor는 실제 ~/.hermes/config.yaml이 없을 수 있으므로, 그 경우 FAIL이 아니라 명확한 WARN/FAIL 메시지를 내고 종료 코드는 상황에 맞게 처리한다.
- CI 환경에서는 ~/.hermes가 없을 수 있으므로 doctor가 CI를 깨지 않게 설계한다.
- install/update는 실제 사용자 환경에서 실행하는 명령이므로 CI에서 실행하지 않아도 된다.
- update_repo는 실제 git pull을 수행하므로 테스트에서는 dry-run/mock 방식으로 검증한다.

---

## 완료 보고

마지막에 다음을 요약한다.

1. 추가한 scripts
2. 추가한 파일
3. Hermes config에 반영되는 내용
4. 최초 설치 명령
5. 업데이트 명령
6. GitHub 자동 업데이트 MCP tool 사용법
7. doctor 결과
8. 저장소 내 절대경로 검사 결과
9. 남은 TODO 또는 주의사항

지금부터 이 저장소에 Hermes 연동 설치/업데이트/검증 자동화와 GitHub pull 기반 자동 업데이트 구조를 구현해라.
