---
name: yeoboya-write-domain
description: "Use ONLY when yeoboya-continue-work triggers this skill for workType=feature/update after write-policy. NEVER invoke directly. Fetches the 정책서 from Notion, walks the user through domain object/rule/actor/event modeling, runs self-validation, then calls yeoboya-publish-notion with title='도메인 명세서'."
user-invocable: false
---

# yeoboya-write-domain

도메인 명세서 작성.

## 1. 전제

- `stages.write-policy.status` ∈ {`done`, `published`} (없으면 안내 후 종료 — continue-work에 복귀)
- `stages.write-domain.status === "todo"` 또는 재실행

## 2. 입력 fetch

1. 정책서 fetch (progress.stages.write-policy.notionPageId → notion-fetch)

## 3. 작성 절차 (도메인 명세서)

본문 구조 — Notion 페이지 마크다운:

```
# 도메인 명세서

## 1. 액터 (Actors)
- 사용자 역할별로 정의

## 2. 도메인 객체 (Entities / Value Objects)
| 객체 | 속성 | 비고 |
|---|---|---|

## 3. 도메인 규칙 (Rules)
- 비즈니스 제약, 불변 조건

## 4. 도메인 이벤트 (Events)
- 시스템에서 발화되는 이벤트와 발화 조건

## 5. 의존성 (External Systems)
- 외부 시스템과의 경계
```

## 4. Self-validation (publish 직전)

- [ ] §1 액터 최소 1개
- [ ] §2 도메인 객체 표에 최소 1개 행
- [ ] §3 도메인 규칙이 정책서 §3 정책 결정과 모순 없음 (사용자 확인)
- [ ] §4 도메인 이벤트가 §3 규칙과 연동
- [ ] §5 의존성은 명시되거나 "내부 완결"

## 5. publish

```
yeoboya-publish-notion 호출:
  task: <progress.task>
  mode: "dispatch"
  stage: "write-domain"
  title: "도메인 명세서"
  markdown: <본문>
```

## 6. 종료 안내

```
도메인 명세서 작성 완료. 다음 권장 단계: UI 흐름도.
새 세션에서 /yeoboya-continue-work을 호출하세요.
```
