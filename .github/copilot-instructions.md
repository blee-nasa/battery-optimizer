# Battery Optimizer - Project Guidelines

## What This Project Is

A web-based calculator for optimizing solid state battery construction. Engineers and researchers input powder component parameters; the app returns calculated outputs (specific capacity, utilization, mass loading).

## Architecture

- **Frontend:** React + Vite (single-page app)
- **Calculation engine:** C code compiled to WebAssembly (WASM) via Emscripten
- **Build environment:** Docker using `emscripten/emsdk` image - no native emsdk install
- **Deployment:** Fly.io static hosting (nginx, no backend) at cathcal.fly.dev, deployed by GitHub Actions on push to `main`

The frontend is a shell that loads and calls a WASM module. The WASM module is authored separately by the project POC (porting FORTRAN calculation logic to C). The interface contract between the shell and the WASM module is a key design artifact.

## Repository Structure

Bun monorepo; the web app lives in `apps/web`. The version is tracked only in the root `package.json`.

```
battery-optimizer/
  .github/               # Copilot instructions, deploy workflow
  wiki/                  # Project wiki (git submodule)
  apps/web/              # React frontend (Vite)
    src/                 # React source
    wasm/                # C source and build scripts for WASM module
    public/              # Static assets; compiled WASM output lands here
  Dockerfile             # Production image (Bun build -> nginx)
  Dockerfile.dev         # Dev image used by compose.yaml
  fly.toml               # Fly.io config (app: cathcal)
  package.json           # Workspaces, convenience scripts, canonical version
```

## Build and Development

WASM build (via Docker):
```sh
docker run --rm -v $(pwd)/wasm:/src emscripten/emsdk emcc calculator.c -o /src/out/calculator.js -s EXPORTED_FUNCTIONS="['_calculate']" -s MODULARIZE=1
```

Frontend dev server (from the repo root):
```sh
bun install
bun run dev
```

## Key Domain Concepts

- **Powder components** - the building blocks users define; each has: name, electronic conductivity (S/cm), Li-ion conductivity (S/cm), grain size, molecular weight (g/mol), density (g/cm3), reduction potential (V vs Li/Li+)
- **Specific capacity** (mAh/g) - primary output; theoretical formula: `C = (n * F) / (M * 3.6)`
- **Utilization** (%) - fraction of theoretical capacity achieved
- **Mass loading** (g) - active material mass

## Conventions

- Do not add a backend server. All computation runs client-side via WASM.
- WASM build must go through Docker - do not assume emsdk is installed on the host.
- The WASM module interface (exported function signatures) is the contract with the POC - changes require coordination.
- See the [project wiki](https://gitlab.larc.nasa.gov/blee31/battery-optimizer/-/wikis/home) for the full plan and open questions.
