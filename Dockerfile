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
# nginx.conf은 K8s ConfigMap으로 런타임 마운트 (/etc/nginx/conf.d/default.conf)
# 이 이미지는 정적 파일만 포함
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx가 PID 1로 foreground 실행
CMD ["nginx", "-g", "daemon off;"]
