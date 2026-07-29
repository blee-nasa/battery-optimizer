#include <emscripten.h>
#include <math.h>
#include "cathcal_def.h"
#include "cathcal_calc.h"
#include "cathcal_opt.h"
#include "simplex.h"

EMSCRIPTEN_KEEPALIVE
void calculate(type_Cathode Cathode_in, CalculationResult* out_result)
{
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

    convert_to_work_types(Cathode_in, &wCathode);
    implicit_cathode(wCathode);

    for (int i = 0; i < 8; i++) {
        out_result->material_utilization[i] = 100.0*Util_of_Mat[i+1];
    }
    out_result->am_capacity = C_of_AM;
    out_result->overall_cathode_capacity = C_of_sys;
    out_result->overall_cathode_utilization = Util_of_type[0];

//    print_res(Cathode_in, out_result); // remove in the web version

} // END calculate()


void optimizer(type_Cathode Cathode_in, type_Cathode* Cathode_out, CalculationResult* out_result)
{
type_work_Cathode wCathode, wCathode_in; // working cathode type
type_Cathode Cath_out;

    tau = init_tau();  // initialize weight factors tau

    set_fit_types(Cathode_in);
    convert_to_work_types(Cathode_in, &wCathode_in);
/*
    int N_mat = Cathode_in.N_mat;
    for (int i=0; i<N_mat; i++) {
     printf("optimizer: Cathode_in.mass_ratio[%d]= %lf, wCathode_in.mass_ratio[%d]= %lf\n",
     i,Cathode_in.mass_ratio[i], i+1, wCathode_in.mass_ratio[i+1]);
    }
*/
    wCathode = minimization(wCathode_in); // works on wCathode
  
    get_res(wCathode, Cathode_out, out_result);
    Cath_out = *Cathode_out;
    calculate(Cath_out, out_result);

//    Cathode_out->mass_ratio[1] -= 1.0;
//    Cathode_out->mass_ratio[2] += 1.0;

//    print_res(Cathode_in, out_result); // remove in the web version

} // END optimizer()

