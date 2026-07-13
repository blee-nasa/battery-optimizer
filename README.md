# Battery Optimizer

A web-based calculator for optimizing the construction of solid state batteries. Engineers and researchers enter powder component parameters and receive calculated outputs - primarily specific capacity (mAh/g), utilization, and mass loading - to guide material selection decisions.

## Status

Early development - proof of concept phase.

## How it works

- **Frontend:** React + Vite single-page app
- **Calculation engine:** C code compiled to WebAssembly (WASM) via Emscripten, running entirely client-side
- **Deployment:** Fly.io ([cathcal.fly.dev](https://cathcal.fly.dev)) via GitHub Actions

The app is structured as a shell that calls into a WASM module. The calculation logic (ported from FORTRAN to C by the project POC) is compiled separately and loaded at runtime.

## Repository structure

Bun monorepo; the web app lives in `apps/web`.

```
battery-optimizer/
  .github/workflows/     # deploy.yml: version bump + Fly.io deploy on push to main
  apps/web/              # React frontend (Vite)
    src/                 # React source
    wasm/                # C source and build script for WASM module
    public/              # Static assets; compiled WASM output lands here
  Dockerfile             # Production image (Bun build -> nginx static serve)
  Dockerfile.dev         # Dev-server image used by compose.yaml
  fly.toml               # Fly.io app config (cathcal)
  package.json           # Root: workspaces, convenience scripts, canonical version
```

The version is tracked **only** in the root `package.json`; `apps/web/package.json` has no version field.

## Development requirements

- [Bun](https://bun.sh)
- Docker (used for the Emscripten WASM build - no native emsdk install needed)

## Local development

All convenience scripts run from the repo root:

```sh
bun install
bun run dev            # Vite dev server on http://localhost:47293
bun run test           # vitest (watch mode)
bun run test:coverage  # vitest run with coverage
bun run lint
bun run build          # production build -> apps/web/dist
bun run wasm:build     # rebuild the WASM module (requires Docker)
```

Or run the dev server in Docker:

```sh
docker compose up --build
```

## Deployment

Merging a PR into `main` triggers `.github/workflows/deploy.yml`:

1. **bump** - patch-bumps the root `package.json` version and pushes the commit to `main` (`[skip ci]`)
2. **deploy** - deploys the bumped commit to Fly.io (`cathcal.fly.dev`) using the root `Dockerfile`

`main` is PR-merge-only (direct pushes are blocked by a ruleset; the CI bump commit bypasses it via the `github-actions` app). Requires the `FLY_API_TOKEN` repo secret - see issue #10.

## Documentation

See the [project wiki](https://gitlab.larc.nasa.gov/blee31/battery-optimizer/-/wikis/home) for the full initial plan.
