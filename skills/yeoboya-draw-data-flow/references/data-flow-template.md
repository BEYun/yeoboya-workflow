````markdown
# 데이터 흐름도 [작업번호]

> 정책 SOT: <정책서 link>
> 도메인 SOT: <도메인 명세서 link>
> UI 흐름도: <UI 흐름도 link>
> 통신 명세서 서브페이지: <통신 명세서 link>

## 역할 인벤토리

| 역할 | 주요 시나리오 |
|---|---|
| ... | ... |

## 엔터티 책임 매트릭스

| 엔터티 | 상태 주체 | 비고 |
|---|---|---|
| ... | ... | ... |

## (optional) 상태 모델 동기화 메모

> 데이터 흐름도가 도메인 명세서 §3와 다른 추상화를 도입했다면 대응표로 명시. 동일하면 "동일" 한 줄.

| 데이터 흐름도 상태 | 도메인 §3 대응 |
|---|---|

## <역할> 섹션

(각 역할 반복)

### <역할> 시퀀스 다이어그램

```mermaid
sequenceDiagram
    actor X as <역할>
    participant FE as <역할> 클라이언트
    participant BE as 서버
    participant DB as DB

    rect rgb(50, 60, 80)
        Note over X,BE: <단계명>
        X->>FE: [<역할>:Action:N] ...
        FE->>BE: ...
        BE->>DB: ...
        BE-->>FE: [<역할>:Event:N] ...
    end
```

### <역할> 액션·채널 매트릭스

| ID | 단계명 | 채널 | 메서드/이벤트명 |
|---|---|---|---|
| <역할>:Action:1 | ... | Socket / API | <cmd 또는 endpoint> |
| <역할>:Event:1 | ... | Socket | <cmd> |

## 수정사항

회의 결과 기록.
````
