---
name: yeoboya-review-code
description: "Use ONLY when yeoboya-continue-work triggers this skill after write-code (feature/update) or after fix-bug (bugfix). NEVER invoke directly. Collects task-related diff via `git log --grep='[<task>]'`, dispatches code-reviewer subagent for findings, lets user decide fix-or-pass per finding. Output: review markdown + (optional) Notion page. status=done after user closes findings; Notion publish is optional."
user-invocable: false
---

# yeoboya-review-code

작업번호 관련 diff의 코드 리뷰.

## 1. 전제

- `stages.write-code.status === "done"` (feature/update) 또는 `stages.fix-bug.status === "done"` (bugfix)
- `stages.review-code.status === "todo"` 또는 재실행

## 2. diff 수집

```
git log --grep='\[<작업번호>\]' --oneline
git diff <첫 커밋>^..<마지막 커밋>
```

수집된 diff 요약을 사용자에게 노출 (그라운딩).

## 3. subagent 호출

`agents/code-reviewer.md` subagent에게 위임. 응답으로 리뷰 산출물 (마크다운) 수신.

## 4. 사용자 결정 게이트

리뷰 산출물의 각 발견 사항마다:
- **수정** → 작은 수정 직접 적용 후 커밋. 큰 수정이면 "변경점 phase 재실행 권장" 안내 후 continue-work 복귀
- **수용** → 리뷰 산출물에 "수용" 표시
- **반박** → 사용자가 이유 작성, 산출물에 "반박" 표시

## 5. Self-validation (publish 옵션이면)

- [ ] 리뷰 산출물에 모든 발견 사항이 표 형태로 정리
- [ ] 각 발견 사항에 결정 (수정/수용/반박) 라벨

## 6. publish (옵션)

리뷰 산출물을 Notion으로 발행하려면:
```
yeoboya-publish-notion 호출:
  task: <progress.task>
  mode: "dispatch"
  stage: "review-code"
  title: "코드 리뷰 — <작업번호>"
  markdown: <리뷰 산출물>
```
단, `review-code`는 `NOTION_STAGES`에 없음 — 발행해도 hook이 자동 `published` 전이하지 않음. publish 후 `status="done"` 수동 갱신.

## 7. 종료 안내

`progress.stages.review-code.status = "done"` 업데이트 후:

```
코드 리뷰 완료. 다음 권장 단계: QA 시나리오.
새 세션에서 /yeoboya-continue-work을 호출하세요.
```
