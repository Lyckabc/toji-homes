# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 먼저 복사 → 레이어 캐시 활용 (소스 변경 시 재설치 불필요)
COPY package*.json ./
RUN npm ci

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
