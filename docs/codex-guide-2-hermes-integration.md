# Codex 최종 지침서 2: Hermes 연동 설치/업데이트/검증 자동화

## 목적

이 지침서는 이미 TypeScript + npx + MCP + Hermes Skill 구조가 잡힌 저장소에, Hermes가 설치된 컴퓨터에서 사용할 수 있는 연동 자동화 스크립트를 추가하기 위한 작업 지침서다.

최종 목표는 다음과 같다.

- 이 저장소를 Hermes가 설치된 컴퓨터에 clone한다.
- `npm run hermes:install`로 Hermes config에 MCP 서버와 Skill 경로를 자동 등록한다.
- `npm run hermes:update`로 이후 clone 경로나 빌드 결과 변경을 반영한다.
- `npm run hermes:doctor`로 연동 상태를 점검한다.
- 기존 `~/.hermes/config.yaml`은 안전하게 백업하고, 파괴적으로 덮어쓰지 않는다.

---

## Codex에게 줄 작업 지시

너는 이미 TypeScript + npx + MCP + Hermes Skill 구조가 잡힌 저장소에 “Hermes 연동 설치/업데이트/검증 자동화”를 추가한다.

## 상황

- Hermes Agent 자체는 이미 설치되어 있다.
- 이 저장소는 GitHub에 있고, Hermes가 설치된 컴퓨터에 clone될 예정이다.
- 사용자는 이 저장소를 Hermes에 안전하게 연결하고 싶다.
- 최초 연결은 install, 이후 변경 반영은 update, 상태 점검은 doctor로 수행한다.
- 기존 ~/.hermes/config.yaml은 절대 파괴적으로 덮어쓰면 안 된다.

## 최종 목표

아래 명령이 동작해야 한다.

```bash
npm run hermes:install
npm run hermes:update
npm run hermes:doctor
```

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

hermes/
├── config.fragment.yaml
├── install-and-connect.md
└── operating-loop.md
```

이미 존재하는 파일은 삭제하지 말고 필요한 부분만 보강한다.

---

## 필수 동작

### 1. package/project id 감지

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

skills:
  external_dirs:
    - "<absolute-project-path>/skills"
```

주의:

- Hermes 자체를 설치하지 않는다.
- npm install을 자동으로 실행하지 않는다. 필요하면 안내만 한다.
- git pull을 자동으로 실행하지 않는다.
- 기존 사용자 설정을 보존한다.

---

## 3. hermes:update

다음을 수행한다.

1. git pull은 자동으로 실행하지 않는다.
2. 현재 로컬 파일 기준으로만 반영한다.
3. npm run build 실행
4. ~/.hermes/config.yaml 백업 생성
5. mcp_servers.<safe_project_id>를 현재 경로 기준으로 갱신한다.
6. skills.external_dirs에 현재 skills 경로가 없으면 추가한다.
7. 기존 다른 설정은 보존한다.
8. 업데이트 결과를 요약 출력한다.

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
- node 실행 가능 여부
- artifacts 디렉터리 쓰기 가능 여부
- incidents 디렉터리 쓰기 가능 여부
- 가능하면 npx . health 또는 node dist/cli.js health를 실행해서 health 결과 확인

출력 예:

```text
Hermes Integration Doctor

[OK] package name: my-hermes-tool
[OK] project path: /Users/steve/agent-workspace/my-hermes-tool
[OK] build output: dist/mcp/server.js
[OK] Hermes config: /Users/steve/.hermes/config.yaml
[OK] MCP server registered: my_hermes_tool
[OK] skills path registered
[OK] artifacts writable
[OK] incidents writable
[WARN] Hermes restart may be required
```

주의:

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

## 7. README 업데이트

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

- Adds this repo's MCP server to ~/.hermes/config.yaml
- Adds this repo's skills directory to Hermes external skill dirs
- Creates artifacts and incidents directories
- Backs up config.yaml before modifying it
- Does not install Hermes itself
- Does not overwrite unrelated Hermes settings

### After install

Restart Hermes or reload its config if needed.

Then ask Hermes:

“Use this tool's skill and run health_check.”
```

주의: 위 섹션을 README에 넣을 때 중첩된 markdown code fence가 깨지지 않도록 적절히 처리한다.

---

## 8. hermes/install-and-connect.md 작성

다음을 포함한다.

- 전제: Hermes는 이미 설치되어 있음
- 이 repo를 clone한 뒤 설치하는 방법
- install/update/doctor 차이
- config에 들어가는 MCP server 예시
- skills.external_dirs 설명
- Hermes 재시작 필요 가능성
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

## 9. hermes/config.fragment.yaml 작성

실제 값 대신 placeholder를 포함한다.

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

skills:
  external_dirs:
    - "<absolute-project-path>/skills"
```

---

## 10. hermes/operating-loop.md 작성

다음을 포함한다.

- Steve/Codex/Hermes 역할 분리
- 개발 머신 흐름
- Hermes 머신 흐름
- 최초 설치
- 업데이트
- Doctor 점검
- 장애 발생 시 incident 작성 방식
- Codex에게 넘길 수정 지침 작성 방식

운영 루프 예:

```text
1. Steve creates or updates tool requirements.
2. Codex implements the tool locally.
3. Tests and CLI checks pass.
4. Steve pushes to GitHub.
5. Hermes machine pulls the repo.
6. npm run hermes:update runs.
7. Hermes uses MCP tools through the registered skill.
8. Failures are captured as incidents.
9. Steve gives incident context back to Codex for fixes.
```

---

## 11. 의존성

필요하면 package.json에 다음 의존성을 추가한다.

dependencies:

- yaml

devDependencies:

- tsx

기존에 있으면 중복 추가하지 않는다.

---

## 12. 검증 명령

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

---

## 완료 보고

마지막에 다음을 요약한다.

1. 추가한 scripts
2. 추가한 파일
3. Hermes config에 반영되는 내용
4. 최초 설치 명령
5. 업데이트 명령
6. doctor 결과
7. 남은 TODO 또는 주의사항

지금부터 이 저장소에 Hermes 연동 설치/업데이트/검증 자동화를 구현해라.
