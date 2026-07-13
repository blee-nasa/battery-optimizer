# Production image: build the web app with Bun, serve the static output with nginx
FROM oven/bun:1 AS build
WORKDIR /app

# Manifests first for layer caching
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
RUN bun install --frozen-lockfile

COPY . .
RUN bun run --cwd apps/web build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
