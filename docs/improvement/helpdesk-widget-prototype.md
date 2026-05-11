# Helpdesk Widget Prototype (toji-homes)

> 작성일: 2026-05-11
> 상위 문서: `geneso/universitas/helpdesk/architecture.md`
> 범위: toji-homes에 추가하는 **고객용 Help 위젯** + **티켓 상태 페이지** 설계.
> 백엔드는 goquest 단일 사용. 본 문서는 frontend(Astro) 스펙만 다룬다.

---

## 1. 목표

- 비로그인 고객이 모든 toji-homes 페이지에서 **3-step**(질문 → AI 답변 → 미해결 시 티켓)으로 응대받게 한다.
- 별도 백엔드 없음. goquest API를 client-side에서 직접 호출.
- 정적 사이트 제약을 지키되, 위젯 부분만 Astro **island**(client-side hydration).

---

## 2. UI 구성

### 2.1 Floating 위젯 (모든 페이지 공통)

```
┌─────────────────────────────┐
│ 모든 toji-homes 페이지      │
│                             │
│                             │
│                             │
│                       ┌──┐  │
│                       │ ?│  │  ← 우측 하단 floating 버튼
│                       └──┘  │
└─────────────────────────────┘

         ↓ 클릭 시 패널 확장

┌──────────────────────────────┐
│ ✕            도움이 필요하세요? │
├──────────────────────────────┤
│ [검색창: 무엇을 도와드릴까요?] │
│                              │
│ 💡 추천 답변 (RAG 결과)       │
│  • 질문 1 — 답변 요약 ...    │
│  • 질문 2 — 답변 요약 ...    │
│                              │
│ ─────────────────────────── │
│ 답을 찾지 못하셨나요?          │
│  [티켓 생성 →]                │
└──────────────────────────────┘
```

### 2.2 티켓 폼 (위젯 내부)

```
┌──────────────────────────────┐
│ ← 뒤로     문의하기           │
├──────────────────────────────┤
│ 카테고리 [▼ 일반 문의]        │
│ 이메일   [.................]  │
│ 제목     [.................]  │
│ 내용                          │
│ [.........................]   │
│ [.........................]   │
│                              │
│ □ 개인정보 처리 동의          │
│                              │
│  [제출]                       │
└──────────────────────────────┘

         ↓ 제출 후

┌──────────────────────────────┐
│ ✓ 티켓이 등록되었습니다       │
│ #TKT-2026-00451              │
│                              │
│ 상태 페이지 → /support/...   │
│ (이메일에도 링크 발송됨)      │
└──────────────────────────────┘
```

### 2.3 티켓 상태 페이지 — `/support/tickets/[id]`

```
┌──────────────────────────────┐
│ TOJI Helpdesk                │
├──────────────────────────────┤
│ #TKT-2026-00451              │
│ 상태: ⏳ 처리중              │
│ 생성: 2026-05-11 14:32       │
│                              │
│ ─────── 대화 ─────────────── │
│                              │
│ [고객] 2026-05-11 14:32      │
│ 로그인이 안 됩니다 ...        │
│                              │
│ [지원팀] 2026-05-11 14:35    │
│ 안녕하세요. 비밀번호 재설정.. │
│                              │
│ ─────────────────────────── │
│ [답글 작성]                  │
│ [.........................]   │
│ [전송]                        │
└──────────────────────────────┘
```

---

## 3. 라우팅 / 페이지 구조

`src/pages/`에 추가:

```
src/pages/
  support/
    index.astro              # 헬프데스크 랜딩 (FAQ 모음)
    tickets/
      [id].astro             # 티켓 상태 페이지 (SSR + client island)
      new.astro              # 위젯 외부 진입(전체 페이지) 폼
    auth/
      callback.astro         # ZITADEL OIDC 콜백 (세션 페이지일 때만)
      magic-link.astro       # ?token=... 받아 세션 발급
```

`src/layouts/`:

```
SupportLayout.astro          # support 페이지 공용 레이아웃
```

`src/components/support/` (신규):

```
HelpWidget.astro             # 모든 페이지에 mount되는 floating launcher
HelpWidget.tsx               # 패널 본체 (React island)
RagSuggestions.tsx           # gopedia 검색 결과 카드
TicketForm.tsx               # 폼 + 제출
TicketThread.tsx             # 상태 페이지 대화 뷰
ReplyBox.tsx                 # 답글 입력
```

> 위젯은 React island로 작성. 단순 표시 부분(랜딩, 정적 FAQ)은 그대로 Astro.

---

## 4. 기능별 흐름

### 4.1 RAG 검색 (위젯 → gopedia)

```
HelpWidget.tsx
  → debounce(300ms) → POST {GOPEDIA_BASE}/api/v1/search
       headers: { "X-API-Key": $PUBLIC_GOPEDIA_KEY }
       body:    { query, top_k: 3, score_threshold: 0.6 }
  → 결과 score >= 0.75: "이 답이 맞나요?" 카드 + "해결되었어요"/"아니에요" 버튼
  → score < 0.75: 곧바로 티켓 폼 노출 옵션 강조
```

> public RAG endpoint가 노출되므로 서버단 rate limit + key당 daily quota 필요. (gopedia 측 작업)

### 4.2 티켓 생성 (위젯 → goquest)

```
TicketForm.tsx → POST {GOQUEST_BASE}/api/v1/workspaces/{CS_WID}/projects/{CS_PID}/tickets
   headers: { "X-API-Key": $PUBLIC_GOQUEST_KEY,
              "Content-Type": "application/json" }
   body: {
     title, description,
     type: "request",
     priority: "normal",
     channel: "web",
     requester_email: <고객 입력>,
     metadata: { user_agent, page_url, locale }
   }
← 201 { id, public_token }
   → localStorage에 "last_ticket_token"으로 저장 (UX용)
   → 페이지 이동: /support/tickets/{id}?token={public_token}
```

### 4.3 티켓 상태 페이지 인증

`/support/tickets/[id]?token=<magic>` 진입 시 우선순위:
1. `?token=` 있으면 → goquest `/api/v1/auth/magic-exchange`로 단기 access token 교환 → cookie/sessionStorage에 저장.
2. ZITADEL 세션이 있으면 → JWT 사용.
3. 둘 다 없으면 → 이메일 입력 후 magic-link 재발송 화면.

### 4.4 실시간 업데이트 (SSE)

```
TicketThread.tsx
  → new EventSource(`{GOQUEST_BASE}/api/v1/events?filter=ticket:{id}`,
                    { withCredentials: true })
  → 이벤트:
     - ticket.updated         → 상태/필드 갱신
     - ticket.comment.added   → 새 댓글 prepend (is_internal=false만 도착)
     - ticket.completed       → "해결됨" 배너
```

> 서버 측에서 `is_internal=true` 댓글은 magic-link/고객 토큰 컨텍스트에선 **절대 송출하지 않는다** (정책 문서 §5.1 참조).

### 4.5 답글 작성

```
ReplyBox.tsx → POST /tickets/{id}/comments
   body: { body, is_internal: false }
```

- 첨부파일은 1차 prototype에서 제외 (Phase 2).

---

## 5. 환경 변수

`astro.config.mjs` + `.env`:

```env
PUBLIC_GOQUEST_BASE=https://goquest.toji.homes/api/v1
PUBLIC_GOQUEST_KEY=gqk_<customer-support-public-key>
PUBLIC_GOPEDIA_BASE=https://gopedia.toji.homes/api/v1
PUBLIC_GOPEDIA_KEY=<gopedia-public-search-key>
PUBLIC_CS_WORKSPACE_ID=<uuid customer-support>
PUBLIC_CS_PROJECT_WEB=<uuid web-inquiries project>
PUBLIC_ZITADEL_ISSUER=https://auth.toji.homes
PUBLIC_ZITADEL_CLIENT_ID=<spa client>
```

> Astro의 `PUBLIC_` prefix는 클라이언트에 노출됨. **반드시 권한이 제한된 public key**여야 한다 (정책 §6.1).

---

## 6. CORS / 보안

- goquest, gopedia 서버에 `https://toji.homes`, `https://gopedia.toji.homes` origin allow-list 추가 (운영팀).
- 위젯 panel 열릴 때만 API 호출. 페이지 로드 시 fetch 금지 (트래킹 회피).
- CSP `connect-src`: goquest/gopedia 도메인만 허용.
- Magic link 토큰은 **URL fragment**(`#token=`)가 아닌 query로 보내되, 페이지 로드 후 즉시 history.replaceState로 제거.
- localStorage에 토큰 저장 시 만료시간(`exp`) 함께. 만료 전후 자동 cleanup.

---

## 7. 다국어

- 기존 `pages/ko/`, `pages/en/` 구조 유지. 위젯 텍스트는 `src/i18n/support.{ko,en}.json`.
- 위젯이 `document.documentElement.lang`을 읽어 언어 결정.
- 티켓 본문은 `metadata.locale`로 전달 → staff UI에서 표시.

---

## 8. 구현 단계

| 단계 | 항목 | 결과물 |
|------|------|--------|
| **P0** | 위젯 launcher + 티켓 폼만 (RAG 미연결) | 모든 페이지에 floating 버튼, 티켓 생성 가능 |
| **P1** | 티켓 상태 페이지 + magic-link 인증 | `/support/tickets/:id` 동작 |
| **P2** | gopedia RAG 연결 + 답변 카드 | 자동응답 1차 흐름 완성 |
| **P3** | SSE 실시간 + 답글 작성 | 양방향 대화 |
| **P4** | ZITADEL self-signup + 내 티켓 목록 | 회원 고객 UX |
| **P5** | 첨부파일, 한국어/영어 i18n 보강, FAQ 랜딩 | GA |

---

## 9. 신규/수정 파일 목록

### 신규
```
src/pages/support/index.astro
src/pages/support/tickets/[id].astro
src/pages/support/tickets/new.astro
src/pages/support/auth/magic-link.astro
src/pages/support/auth/callback.astro
src/layouts/SupportLayout.astro
src/components/support/HelpWidget.astro
src/components/support/HelpWidget.tsx
src/components/support/RagSuggestions.tsx
src/components/support/TicketForm.tsx
src/components/support/TicketThread.tsx
src/components/support/ReplyBox.tsx
src/lib/support/goquest-client.ts        # fetch 래퍼 + 타입
src/lib/support/gopedia-client.ts
src/lib/support/auth.ts                  # magic-link, ZITADEL 핸들러
src/i18n/support.ko.json
src/i18n/support.en.json
```

### 수정
```
src/layouts/BaseLayout.astro             # HelpWidget mount
astro.config.mjs                         # @astrojs/react integration 추가 (없으면)
package.json                             # react, react-dom deps
.env.example                             # PUBLIC_* 변수
```

---

## 10. 의존하는 backend 변경사항

> 본 위젯이 동작하려면 goquest backend에 아래 항목이 선행되어야 한다.
> 상세는 `goquest/docs/helpdesk-backend-todo.md` 참조.

- public API Key의 capability scope 제한 (`ticket.create`만)
- `requester_email`, `channel`, `metadata` 필드 추가
- magic-link 토큰 발급/검증 엔드포인트
- ticket comment에 `is_internal` 필드
- SSE `?filter=ticket:<id>` 단일 티켓 구독 지원
- CORS allow-list (toji.homes, gopedia.toji.homes)

---

## 11. 의존하는 정책 문서

- 워크스페이스 ID, project ID, role/visibility 규칙: `geneso/universitas/helpdesk/policy-workspace-visibility.md`
