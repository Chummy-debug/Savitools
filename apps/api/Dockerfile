# Stage 1: build the API from the complete workspace lockfile.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY apps/api apps/api
RUN npm run build --workspace=@savitools/api

# Stage 2: install only locked API production dependencies.
FROM node:20-alpine AS runner

RUN apk add --no-cache git

WORKDIR /app
ENV NODE_ENV=production API_PORT=3001 API_PREFIX=api

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --workspace=@savitools/api --include-workspace-root=false \
    && npm cache clean --force

COPY --from=builder /app/apps/api/dist apps/api/dist
# Nest does not copy these JSON specs into dist, but SdkgenService loads them
# relative to its compiled module at runtime.
COPY apps/api/src/modules/sdkgen/specs apps/api/dist/modules/sdkgen/specs
COPY apps/api/docker-healthcheck.mjs docker-healthcheck.mjs

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs
USER nestjs

WORKDIR /app/apps/api
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --start-period=90s --retries=3 \
  CMD ["node", "/app/docker-healthcheck.mjs"]

CMD ["node", "dist/main.js"]
