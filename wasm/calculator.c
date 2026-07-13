#include <emscripten.h>

#define FARADAY 96485.0

typedef struct {
    char name[64];
    double electronic_conductivity;
    double li_ion_conductivity;
    double grain_size;
    double molecular_weight;
    double density;
    double reduction_potential;
} type_Material;

typedef struct {
    int N_mat;
    type_Material Mat[8];
} type_Cathode;

typedef struct {
    double am_capacity;
    double overall_cathode_capacity;
    double material_utilization[8];
    double overall_cathode_utilization;
} CalculationResult;

EMSCRIPTEN_KEEPALIVE
void calculate(type_Cathode Cathode_in, CalculationResult* out_result) {
    if (out_result == 0) {
        return;
    }

    if (Cathode_in.N_mat <= 0 || Cathode_in.N_mat > 8) {
        out_result->am_capacity = -1.0;
        out_result->overall_cathode_capacity = -1.0;
        out_result->overall_cathode_utilization = 0.0;
        for (int i = 0; i < 8; i++) {
            out_result->material_utilization[i] = 0.0;
        }
        return;
    }

    out_result->am_capacity = 0.0;
    out_result->overall_cathode_capacity = 0.0;
    out_result->overall_cathode_utilization = 0.0;

    for (int i = 0; i < 8; i++) {
        out_result->material_utilization[i] = 0.0;
    }
}
