---
name: yeoboya-finish-work
description: "Use ONLY when yeoboya-continue-work triggers this skill as the final stage. NEVER invoke directly. Verifies git log commit-pattern compliance, confirms all NOTION_STAGES are published, prints a closing report, sets progress.stages.finish-work.status=done. No Notion publish."
user-invocable: false
---

# yeoboya-finish-work

작업 종결 검증 + 보고.

## 1. 전제

- 모든 선행 stage가 `done` 또는 `published` (또는 `skipped` for update workType의 옵션 stage)
- `stages.finish-work.status === "todo"` 또는 재실행

## 2. git 검증

```
git log --grep='\[<작업번호>\]' --oneline
```

각 커밋에 대해 메시지 표준 패턴 검사:
- `[<작업번호>] [<phase>] ...` (write-code phase 커밋)
- `[<작업번호>] fix: ...` (fix-bug)
- `[<작업번호>] [qa-fix] ...` (fix-qa-bug)

위반 커밋이 있으면 보고에 ⚠ 마커.

## 3. Notion 발행 상태 검증

`WORKTYPE_STAGES[<workType>]`에서 `NOTION_STAGES`에 속하는 stage들이 모두 `published`인지 (또는 update workType의 옵션 stage는 `skipped`도 허용) 확인.

미발행 stage 있으면 보고에 ⚠.

## 4. 종결 보고 출력

```
[<작업번호>] <작업명> — <workType 한국어 라벨> 종결 보고

▸ 커밋: <N>개 ✓
▸ Notion 발행:
    ✓ 정책서 (notionPageId: ...)
    ✓ 도메인 명세서
    ↷ UI 흐름도 (skipped)
    ✓ 데이터 흐름도
    ✓ QA 시나리오
▸ 코드 작성 phase:
    ✓ data
    ✓ domain
    ✓ presentation
▸ 경고: <0 또는 ⚠ 항목>

작업이 종결되었습니다.
```

## 5. progress 업데이트

`progress.stages.finish-work.status = "done"`.

## 6. Self-validation

- [ ] §2 git 검증 결과가 보고에 포함
- [ ] §3 Notion 발행 상태가 보고에 포함
- [ ] ⚠ 항목이 있으면 보고에 명시적 표시
