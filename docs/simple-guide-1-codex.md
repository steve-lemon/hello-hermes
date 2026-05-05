# Codex 1단계 지침서 (간소화 버전)

## 목적

이 단계는 “완벽한 구현”이 아니라 아래 3가지만 확실히 만드는 것이다:

1. 프로젝트의 방향 (README 기반 정리)
2. 앞으로 개발할 항목 구조 (TODO + specs)
3. 최소 실행 가능한 골격 (CLI + MCP 기본 동작)

---

## 핵심 개념

- Codex = 개발자
- Hermes = 운영자
- Repo = 설계 + 코드 + 문서의 기준점

👉 이 단계에서는 “설계 뼈대 + 실행 최소 기능”만 만든다.

---

## 해야 할 일 (핵심만)

### 1. README 먼저 읽기

- 프로젝트 목적 파악
- 주요 기능 후보 파악
- 사용 흐름 파악

👉 그리고 아래 4개만 README에 추가

---

### 2. README에 추가할 내용 (간단하게)

#### 1) 프로젝트 요약

- 이 도구가 뭘 하는지 한 문단

#### 2) 개발 단계

```text
Phase 0: 초기 구조
Phase 1: 최소 실행 (CLI + MCP)
Phase 2: 실제 기능 구현
Phase 3: Hermes 운영
```

#### 3) TODO (간단 리스트)

예:

```text
- CLI 기본 명령 만들기
- MCP 연결
- demo job 구현
- 실제 기능 설계
```

#### 4) 검증 시나리오 (간단)

```text
- CLI 실행된다
- demo job 동작한다
- MCP에서 호출된다
- 에러가 구조적으로 나온다
```

---

### 3. specs 폴더 만들기

복잡하게 만들 필요 없음

```text
specs/
- overview.md
- features.md
- scenarios.md
```

#### overview.md

- 이 프로젝트가 뭘 하는지

#### features.md

- 앞으로 만들 기능 목록 (간단)

#### scenarios.md

- 검증 시나리오 (Given / When / Then 정도)

👉 상세 스펙은 나중에 Codex가 확장

---

### 4. 프로젝트 골격 만들기

최소 구조:

```text
src/
  cli.ts
  core/
  mcp/server.ts

skills/
hermes/
examples/
tests/
```

---

### 5. 최소 기능 구현

반드시 동작해야 하는 것:

```bash
npx . health
npx . run --input examples/job.input.json
npx . mcp
```

👉 내부는 demo 로직이면 충분

---

### 6. 중요한 규칙 (간단)

- 절대경로 금지
- 결과는 JSON
- 실패는 구조화된 에러
- Hermes는 실행만 함 (개발 X)

---

## 하지 말아야 할 것

❌ 모든 기능 다 구현하려고 하지 말 것  
❌ specs를 너무 상세하게 만들지 말 것  
❌ README를 과도하게 길게 만들지 말 것  

---

## 완료 기준

✔ CLI 실행됨  
✔ MCP 실행됨  
✔ README에 방향 + TODO 있음  
✔ specs 폴더 있음  

---

## 핵심 한 줄

👉 “지금은 설계 뼈대 + 실행 최소 기능만 만든다”
