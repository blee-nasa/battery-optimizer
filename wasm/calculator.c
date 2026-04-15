#include <emscripten.h>

/*
 * Stub WASM module for the Battery Optimizer POC.
 *
 * This will eventually be replaced with the real calculation logic
 * ported from FORTRAN by the project POC. For now it demonstrates
 * the React-to-WASM integration path.
 *
 * Specific capacity formula: C = (n * F) / (M * 3.6)
 *   n = electrons transferred per formula unit
 *   F = Faraday's constant (96485 C/mol)
 *   M = molecular weight (g/mol)
 *   3.6 = conversion factor (C to mAh)
 */

#define FARADAY 96485.0

EMSCRIPTEN_KEEPALIVE
double calculate(double n, double molecular_weight) {
    if (molecular_weight <= 0.0) {
        return -1.0;
    }
    return (n * FARADAY) / (molecular_weight * 3.6);
}
