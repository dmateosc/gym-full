FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S script -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY index.ts tsconfig.json ./

USER script

ENV NODE_ENV=production

# Pass date as CMD arg: docker run ... generate-routine 2025-01-27
# Defaults to today if no arg given
ENTRYPOINT ["npx", "ts-node", "index.ts"]
