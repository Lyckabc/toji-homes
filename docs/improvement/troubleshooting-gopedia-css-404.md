# Troubleshooting: gopedia.toji.homes CSS/JS 404 — SVG 크기 이상, 섹션 미표시

**발생일**: 2026-05-07  
**증상**: `gopedia.toji.homes` 배포 환경에서 SVG 아이콘 크기가 비정상적으로 크고, 섹션 구분선·배경색이 표시되지 않음. 로컬(`localhost:4323/gopedia-site/`)에서는 정상 표시.

---

## 증상 요약

| 환경 | 결과 |
|------|------|
| 로컬 dev (`npm run dev`) | 정상 |
| 로컬 빌드 (`npm run build`) | 정상 |
| 배포 (`gopedia.toji.homes`) | SVG 크기 비정상, 섹션 구분 없음 |

---

## 근본 원인 분석

### 원인 1 — CSS 클래스 미적용

**문제**: Astro 컴포넌트에 레퍼런스 HTML의 CSS 클래스(`.value-glyph`, `.scen-num`, `.ir-bar`, `.road-step` 등)가 적용되지 않아 크기·레이아웃 스타일이 없는 상태로 렌더링됨.

**수정**: 레퍼런스 CSS를 `GopediaLayout.astro`의 `<style is:global>`에 추가하고, 각 컴포넌트 요소에 클래스명 적용.

---

### 원인 2 — CSS Cascade 충돌 (Tailwind `@layer` vs non-layered CSS)

**문제**: Tailwind v4는 유틸리티 클래스를 `@layer utilities`로 생성한다. CSS cascade 규칙상:

```
@layer utilities  <  non-layered (일반) CSS
```

`GopediaLayout.astro`의 global CSS가 레이어 없이 선언되어, Tailwind 유틸리티(`text-[15px]`, `w-5 h-5`)가 CSS 클래스(`.brand { font-size: 22px }`, `.brand-mark { width: 28px }`)에 **항상 졌음**. 컴포넌트에서 Tailwind로 명시한 크기들이 무시됨.

**수정**: 컴포넌트 CSS 전체를 `@layer components`로 감쌈.

```css
/* Before — non-layered, always beats Tailwind */
.brand { font-size: 22px; }

/* After — @layer components < @layer utilities */
@layer components {
  .brand { font-size: 15px; }
}
```

**Cascade 우선순위**:
```
@layer base  <  @layer components  <  @layer utilities (Tailwind)
```

---

### 원인 3 — K8s ConfigMap이 nginx 이미지 설정을 덮어씀

**문제**: Dockerfile은 `nginx/default.conf`를 이미지에 복사하지만, K8s 배포에 `gopedia-site-nginx-conf` ConfigMap이 `/etc/nginx/conf.d/default.conf`에 마운트되어 있어 이미지 설정이 무시됨.

```
이미지 nginx config  →  무시됨 (ConfigMap이 덮어씀)
ConfigMap 내용       →  /_astro/ location 없음  →  CSS/JS 404
```

진단 방법:
```bash
# 실행 중인 pod의 실제 nginx 설정 확인
kubectl exec -n homepage <pod-name> -- cat /etc/nginx/conf.d/default.conf

# ConfigMap 목록 및 마운트 확인
kubectl get configmap -n homepage
kubectl get deployment gopedia-site -n homepage \
  -o jsonpath='{.spec.template.spec.volumes}'
```

**수정**: 파이프라인(`woodpecker.yml`)에 ConfigMap 동기화 스텝 추가.

```yaml
- kubectl create configmap gopedia-site-nginx-conf \
    --from-file=default.conf=nginx/gopedia-site.conf \
    -n homepage --dry-run=client -o yaml | kubectl apply -f -
```

---

### 원인 4 — nginx regex location이 prefix location보다 우선 (핵심)

**문제**: `/_astro/` prefix location을 추가했음에도 CSS가 여전히 404. nginx location 매칭 순서:

1. 모든 prefix location 중 가장 긴 것을 후보로 선정 (`/_astro/`)
2. **regex location을 순서대로 검사** — `~* \.(js|css|png|...)$`가 `/_astro/file.css`에 매칭됨
3. **regex 승리** → root가 default(`/usr/share/nginx/html/gopedia-site`)로 적용됨
4. `/usr/share/nginx/html/gopedia-site/_astro/file.css` 존재하지 않음 → **404**

```nginx
# 문제: regex ~* \.(css)$ 가 /_astro/*.css 를 가로챔
location /_astro/ {
    root /usr/share/nginx/html;   # 도달 불가
}
location ~* \.(js|css|...)$ {
    try_files $uri =404;          # 항상 여기서 처리 → 404
}
```

**수정**: `^~` 수식어 추가 — prefix가 매칭되면 regex 검사를 건너뜀.

```nginx
# 수정: ^~ 로 regex 검사 중단
location ^~ /_astro/ {
    root /usr/share/nginx/html;
    try_files $uri =404;
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

**nginx location 매칭 우선순위 정리**:

| 순서 | 유형 | 예시 | 특징 |
|------|------|------|------|
| 1 | Exact | `= /path` | 완전 일치, 최우선 |
| 2 | Prefix + `^~` | `^~ /_astro/` | 매칭 시 regex 검사 중단 |
| 3 | Regex | `~* \.css$` | 선언 순서대로 평가 |
| 4 | Prefix (일반) | `/_astro/` | regex 없을 때 사용 |

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `nginx/gopedia-site.conf` | 신규 생성 — `^~ /_astro/` location 포함 |
| `nginx/default.conf` | `/_astro/` → `^~ /_astro/` |
| `src/layouts/GopediaLayout.astro` | 레퍼런스 CSS 추가, `@layer components` 감싸기 |
| `src/components/gopedia/*.astro` | CSS 클래스명 적용 |
| `.woodpecker.yml` | ConfigMap 동기화 스텝 추가 |

---

## 재발 방지

1. **nginx에서 특정 경로를 다른 root로 서빙할 때는 항상 `^~` 사용** — 특히 정적 에셋 경로에 regex location이 존재하는 경우.
2. **K8s ConfigMap으로 nginx 설정을 관리하는 경우, 해당 파일을 repo에 명시적으로 관리**하고 파이프라인에서 동기화.
3. **Tailwind v4와 custom CSS를 함께 쓸 때는 custom CSS를 `@layer components`로 감싸기** — non-layered CSS는 Tailwind utilities를 항상 이김.
