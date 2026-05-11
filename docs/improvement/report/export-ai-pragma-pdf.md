# ai-pragma PDF 내보내기

`dist/`를 잠시 로컬로 띄운 뒤 Playwright로 페이지를 연 다음, 헤더·푸터를 숨기고 본문만 A4 PDF로 저장합니다.

## 사전 준비

- `npm run build`로 `dist/` 생성
- Playwright 브라우저 바이너리 설치: `npx playwright install chromium` (최초 1회)

## 기본 실행

```bash
npm run build
npm run pdf:ai-pragma
```

- 기본 출력: `data/ai-pragma-content.pdf` (`data/`는 `.gitignore` 대상)
- 기본값: 한글 페이지, 라이트 테마, 스케일 `0.9`

## 직접 실행 (옵션)

```bash
node scripts/export-ai-pragma-pdf.mjs [옵션]
```

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--locale=ko` \| `en` | 경로: `/ko/projects/ai-pragma/` 또는 `/projects/ai-pragma/` | `ko` |
| `--theme=light` \| `dark` | `html`의 `dark` 클래스와 동일 | `light` |
| `--scale=` 숫자 | PDF 렌더 스케일 (`0.1`–`2`) | `0.9` |
| `--out=` 경로 | 출력 파일 | `data/ai-pragma-content.pdf` |

도움말: `node scripts/export-ai-pragma-pdf.mjs --help`

### 예시

```bash
node scripts/export-ai-pragma-pdf.mjs --locale=en --theme=dark --scale=1
node scripts/export-ai-pragma-pdf.mjs --out=./data/ai-pragma-ko-light.pdf
```
