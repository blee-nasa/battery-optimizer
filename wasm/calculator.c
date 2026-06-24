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

typedef struct {
    double am_capacity;
    double overall_cathode_capacity;
    double material_utilization[8];
    double overall_cathode_utilization;
} CalculationResult;

EMSCRIPTEN_KEEPALIVE
void calculate(double n, double molecular_weight, CalculationResult* out_result) {
    if (out_result == 0) {
        return;
    }

    if (molecular_weight <= 0.0) {
        out_result->am_capacity = -1.0;
        out_result->overall_cathode_capacity = -1.0;
        out_result->overall_cathode_utilization = 0.0;
        for (int i = 0; i < 8; i++) {
            out_result->material_utilization[i] = 0.0;
        }
        return;
    }

    const double capacity = (n * FARADAY) / (molecular_weight * 3.6);
    out_result->am_capacity = capacity;
    out_result->overall_cathode_capacity = capacity;
    out_result->overall_cathode_utilization = 100.0;

    for (int i = 0; i < 8; i++) {
        out_result->material_utilization[i] = 0.0;
    }
    out_result->material_utilization[0] = 100.0;
}
