#!/usr/bin/env bash
set -euo pipefail

# Build the WASM module using Docker (no native emsdk required).
# Output lands in public/ so Vite serves it alongside the React app.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$PROJECT_ROOT/public"

# Pin the toolchain: an unpinned `emscripten/emsdk` resolves to :latest, so a
# newer image silently rewrites public/calculator.js with different runtime glue
# even when calculator.c is unchanged.
EMSDK_VERSION="5.0.7"

mkdir -p "$OUT_DIR"

# MSYS_NO_PATHCONV prevents Git Bash on Windows from mangling
# Linux-style paths (e.g. /src -> C:/Program Files/Git/src).
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$SCRIPT_DIR":/src \
  -v "$OUT_DIR":/out \
  emscripten/emsdk:"$EMSDK_VERSION" \
  emcc /src/calculator.c \
    -o /out/calculator.js \
    -s EXPORTED_FUNCTIONS="['_calculate','_optimizer','_malloc','_free']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','HEAPU8','HEAP32','HEAPF64']" \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createCalculatorModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -O2

echo "WASM build complete. Output in public/"
ls -la "$OUT_DIR"/calculator.*
