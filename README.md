# Battery Optimizer

A web-based calculator for optimizing the construction of solid state batteries. Engineers and researchers enter powder component parameters and receive calculated outputs - primarily specific capacity (mAh/g), utilization, and mass loading - to guide material selection decisions.

## Status

Early development - proof of concept phase.

## How it works

- **Frontend:** React + Vite single-page app
- **Calculation engine:** C code compiled to WebAssembly (WASM) via Emscripten, running entirely client-side
- **Deployment:** GitLab Pages

The app is structured as a shell that calls into a WASM module. The calculation logic (ported from FORTRAN to C by the project POC) is compiled separately and loaded at runtime.

## Repository structure

```
battery-optimizer/
  wiki/          # Project wiki (submodule)
```

More structure will be added as the project is scaffolded.

## Development requirements

- Node.js 18+
- Docker (used for the Emscripten WASM build - no native emsdk install needed)

## Documentation

See the [project wiki](https://gitlab.larc.nasa.gov/blee31/battery-optimizer/-/wikis/home) for the full initial plan.
