# TOJI site validation checklist

Run after changes to routes, i18n, SEO, or content.

## Routes (static build)

- [ ] `/` — English home (default)
- [ ] `/about/` — English about
- [ ] `/projects/gopedia/` — English gopedia
- [ ] `/projects/neunexus/` — English neunexus
- [ ] `/ko/` — Korean home
- [ ] `/ko/about/` — Korean about
- [ ] `/ko/projects/gopedia/` — Korean gopedia
- [ ] `/ko/projects/neunexus/` — Korean neunexus

Command: `npm run build` or `npm run verify` (expect 8 pages).

GitHub Actions: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs the same build on every push and pull request.

### Local: which command are you using?

| 방식 | `/about` 등 서브페이지 |
|------|-------------------------|
| `npm run dev` | 정상 (Vite 라우팅) |
| `npm run build && npm run preview` | 정상 |
| `docker run` (이 레포 이미지) | **이미지에 포함된** [`nginx/default.conf`](../nginx/default.conf)의 `try_files` 필요 — Dockerfile에 반영됨 |

이전에 Docker 기본 설정만 쓰면 `about/index.html`은 있어도 **`/about`(끝 슬래시 없음)이 404**가 될 수 있습니다.

## SEO (view page source or `dist/**/*.html`)

Per page, confirm:

- [ ] `<html lang="ko">` or `lang="en"`
- [ ] `<title>` and `<meta name="description">` match locale
- [ ] `<link rel="canonical">` absolute URL on `https://toji.homes`
- [ ] `<link rel="alternate" hreflang="ko|en|x-default">` present: Korean under `/ko/...`, English unprefixed, `x-default` → `/`

## i18n / language switcher

From each page:

- [ ] Header **한국어** | **English** toggles to the same logical page in the other locale
- [ ] Header **Projects** dropdown lists gopedia and neunexus; Git opens [github.com/tojiuni](https://github.com/tojiuni)
- [ ] Header nav: English uses `/`, `/about`, …; Korean uses `/ko/`, `/ko/about`, …

## CTA

- [ ] Home: primary button scrolls to **#services** (`서비스 탐색` / `Explore Services`)
- [ ] Home: secondary **Contact** / **문의** opens `mailto:lyckabc@toji.homes`
- [ ] About / project pages: contact button or link at bottom

## Branding

- [ ] Header shows `/toji_only_logo_rev4.png` + **TOJI** wordmark
- [ ] Dark mode: logo uses `dark:invert` and remains readable on `gray-950` background

## Navigation & links

- [ ] Internal: Home, About, gopedia, neunexus, Services (#services on home)
- [ ] External quick links (Git, Tasks, Monitoring) open in new tab with `rel="noopener noreferrer"`
- [ ] Neunexus / gopedia external URLs match reference (`*.toji.homes`, GitHub)

## Responsive

- [ ] Header wraps on narrow viewports without horizontal overflow
- [ ] Project cards and service grid stack on mobile
