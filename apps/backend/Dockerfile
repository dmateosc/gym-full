FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci --workspace=apps/backend

COPY apps/backend ./apps/backend
COPY tsconfig*.json ./

RUN npm run build --workspace=apps/backend

# ─── Production ──────────────────────────────────────────────────────────────

FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

RUN npm ci --omit=dev --workspace=apps/backend && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist

USER nestjs

EXPOSE 3001
ENV NODE_ENV=production PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "apps/backend/dist/main"]
