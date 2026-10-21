# syntax=docker/dockerfile:1

FROM node:24-slim AS base
RUN npm install --global pnpm@12.14.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build
# only for testing over plain http, e.g. `--build-arg BUILD_ORIGIN=http://localhost:3000`
ARG BUILD_ORIGIN
RUN pnpm install --frozen-lockfile
COPY . .
# env vars are validated while the build analyses the app, the real secret is only needed at runtime
RUN BETTER_AUTH_SECRET=build-placeholder-build-placeholder pnpm build

FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod

FROM node:24-slim
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/data/schrottkarte.db
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
COPY package.json ./
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:3000/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "build"]
