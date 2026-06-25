FROM oven/bun:latest

WORKDIR /app

# Copy manifests first to leverage layer caching
COPY package.json bun.lock bun.lockb* ./

RUN bun install

# src/ is expected to be mounted at runtime for hot reload
# The remaining source files are copied so the container is self-contained
# when no volume is mounted (e.g. CI builds)
COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
