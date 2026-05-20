# syntax=docker/dockerfile:1
# CACHE: RUN --mount=type=cache 로 의존성 재사용. --no-cache/--pull 로 빌드하지 말 것
# (둘 다 cache mount 를 폐기해 매 빌드 전부 재다운로드함).

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Astro inlines `import.meta.env.PUBLIC_*` at build time, so these values must
# be present *during* `npm run build`. The CI step fetches them from Vault and
# passes them via `--build-arg`; locally they default to empty (widget then
# degrades gracefully — `isGoquestConfigured()` returns false).
ARG PUBLIC_GOQUEST_KEY=
ARG PUBLIC_CS_WORKSPACE_ID=
ARG PUBLIC_CS_PROJECT_WEB=
ARG PUBLIC_GOPEDIA_KEY=
ENV PUBLIC_GOQUEST_KEY=$PUBLIC_GOQUEST_KEY \
    PUBLIC_CS_WORKSPACE_ID=$PUBLIC_CS_WORKSPACE_ID \
    PUBLIC_CS_PROJECT_WEB=$PUBLIC_CS_PROJECT_WEB \
    PUBLIC_GOPEDIA_KEY=$PUBLIC_GOPEDIA_KEY

# 의존성 먼저 복사 → 레이어 캐시 활용 (소스 변경 시 재설치 불필요)
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# 소스 복사 후 Astro 정적 빌드 (dist/ 생성)
COPY . .
RUN npm run build

# ── Serve stage ────────────────────────────────────────────────────────────────
# 로컬·기본 이미지: repo의 nginx/default.conf (디렉터리 URL용 try_files)
# K8s에서 /etc/nginx/conf.d/default.conf 를 ConfigMap으로 덮어쓰는 경우,
# 동일하게 `try_files $uri $uri/ $uri/index.html` 를 넣어야 /about 등이 동작합니다.
FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx가 PID 1로 foreground 실행
CMD ["nginx", "-g", "daemon off;"]
