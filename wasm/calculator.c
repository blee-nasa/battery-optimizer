#include <emscripten.h>
#include <math.h>
#include "cathcal_def.h"
#include "cathcal_opt.h"

#define FARADAY 96485.0

EMSCRIPTEN_KEEPALIVE
void calculate(type_Cathode Cathode_in, CalculationResult* out_result) {
type_work_Cathode wCathode; // working cathode type

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

    conver_to_work_types(Cathode_in, &wCathode);
    implicit_cathode(wCathode);

    for (int i = 0; i < 8; i++) {
        out_result->material_utilization[i] = 100.0*Util_of_Mat[i+1];
    }

    out_result->am_capacity = C_of_AM;
    out_result->overall_cathode_capacity = C_of_sys;
    out_result->overall_cathode_utilization = Util_of_type[0];

}

void optimizer(type_Cathode Cathode_in, type_Cathode* Cathode_out, CalculationResult* out_result)
{
    tau = init_tau();  // initialize weight factors tau

 // Altering mass_ratio of the first and second for test only !
    Cathode_out->mass_ratio[1] -= 1.0;
    Cathode_out->mass_ratio[2] += 1.0;

    calculator(Cathode_in, out_result);
    CF = collect_cathode(tau);  // Cost Function calculation (internal only)

//    print_res(Cathode_in.N_mat, out_result); // remove in the web version

} // END optimizer()

