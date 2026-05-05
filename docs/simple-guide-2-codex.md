# Codex 2단계 지침서 (간소화 버전)

## 목적

이 단계는 “Hermes에 붙여서 실제로 돌리는 것”이 목표다.

즉:

- 도구를 Hermes에 연결
- 업데이트 자동화
- 기본 운영 루프 확보

---

## 핵심 개념

- Codex = 도구 개발
- Hermes = 도구 실행 + 자동화
- GitHub = 코드 기준

Hermes는 “사용자 대신 일하는 실행 엔진”이다.

---

## 해야 할 일 (핵심만)

### 1. Hermes 연결 스크립트 추가

package.json에 추가:

```json
{
  "scripts": {
    "hermes:install": "tsx scripts/hermes-install.ts",
    "hermes:update": "tsx scripts/hermes-update.ts",
    "hermes:doctor": "tsx scripts/hermes-doctor.ts"
  }
}
```

기존 scripts는 삭제하지 않는다.

---

### 2. hermes:install 구현

해야 하는 것:

- 프로젝트 경로 확인
- dist/mcp/server.js 확인
- 없으면 build 실행
- ~/.hermes/config.yaml 읽기
- MCP server 등록
- skills 경로 등록
- 기존 설정 보존
- config 수정 전 백업 생성

중요:

- Hermes 자체는 설치하지 않는다.
- 절대경로는 이 installer에서만 runtime에 생성한다.
- 저장소 문서나 예시에는 절대경로를 남기지 않는다.

---

### 3. hermes:update 구현

해야 하는 것:

- npm run build 실행
- 현재 프로젝트 경로 기준으로 MCP server 경로 업데이트
- skills 경로 업데이트
- 기존 Hermes 설정 유지
- config 수정 전 백업 생성

주의:

- git pull은 여기서 자동으로 하지 않는다.
- 현재 로컬 파일 기준으로만 Hermes 연결을 갱신한다.

---

### 4. hermes:doctor 구현

확인할 것:

- package name 감지됨?
- dist/mcp/server.js 있음?
- skills 폴더 있음?
- ~/.hermes/config.yaml 있음?
- MCP server가 등록됨?
- skills 경로가 등록됨?
- node 실행 가능?
- git remote 있음?

출력은 간단히:

```text
[OK] ...
[WARN] ...
[FAIL] ...
```

---

### 5. update_repo MCP tool 추가

Hermes가 자동 업데이트 할 수 있게 만든다.

해야 하는 것:

- git status 확인
- working tree가 dirty면 기본 중단
- git pull
- npm install
- npm run build
- npm run hermes:update
- 마지막에 health_check 가능한 상태 유지

실패 시 structured error를 반환한다.

금지:

- git reset
- git clean
- git push
- git checkout
- rm -rf

허용:

- git status
- git remote -v
- git pull

---

### 6. Skill에 업데이트 절차 추가

skills 안의 SKILL.md에 아래 내용을 추가한다.

```md
## Update Procedure

When Steve asks to update this tool, or when scheduled maintenance requires it:

1. Run `update_repo`.
2. Run `health_check`.
3. If health_check succeeds, report the update result.
4. If update_repo fails, stop and report the failed step.
5. Do not run destructive git commands.
6. If the working tree is dirty, stop and notify Steve.
```

---

### 7. README에 Hermes 연동 섹션 추가

README.md에는 기존 내용을 유지하고 아래 내용을 추가한다.

```md
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
```
```

주의: README에 넣을 때 markdown code fence가 깨지지 않도록 조정한다.

---

## 중요한 규칙

- 절대경로 commit 금지
- git reset / clean / push / checkout 금지
- Hermes는 코드 수정 안 함
- Hermes는 도구를 실행하고 업데이트만 함
- 실패는 반드시 structured error로 반환
- 실패 시 Steve에게 보고할 수 있도록 메시지를 남김

---

## 최소 파일 구조

필요하면 아래 파일을 추가한다.

```text
scripts/
  hermes-install.ts
  hermes-update.ts
  hermes-doctor.ts
  utils/
    detectPackage.ts
    hermesConfig.ts
    paths.ts
    logger.ts

src/core/
  updateRepo.ts

hermes/
  install-and-connect.md
  github-update.md
```

---

## 완료 기준

다음이 가능해야 한다.

```bash
npm run hermes:install
npm run hermes:doctor
npm run hermes:update
```

Hermes에서 다음이 가능해야 한다.

```text
health_check
update_repo
```

---

## 검증

최소 검증:

```bash
npm run build
npm test
npm run hermes:doctor
```

가능하면 dry-run도 추가한다.

```bash
npm run hermes:install:dry
npm run hermes:update:dry
```

---

## 핵심 한 줄

Hermes가 이 도구를 안전하게 연결하고, 업데이트하고, 실행할 수 있게 만든다.
