
#define MAX_PARM_FIT 17    // Max number of fitting parameters
#define MAX_WEIGHTS 8      // Max number of weights
#define PI 3.1415926536
#define MIN_PARTICLES 1000 // Minimum number of particles of any type

int ref_mass_material = 1; // Unless Mat N:1 is fixed as constant
int ref_size_material = 1; // Unless Mat N:1 is fixed as constant
int iprint = 0;
int iterations = 100;   // simplex itter, 0: compute capacity only;
double tolerance = 0.0001; // SIMPLEX tolerance value to end

typedef struct {
 double AM_load;
 double AM_util;
 double C_util;
 double SE_util;
 double all_util;
 double Cap_AM;
 double Cap_sys;
} type_tau;

typedef struct {
    char name[64];
    double electronic_conductivity;
    double li_ion_conductivity;
    double grain_size;
    double molecular_weight;
    double density;
    double reduction_potential;
    double valency;
} type_Material;

typedef struct {
 long long Npart;  // number of particles
 double e_cond;
 double Li_cond;
 double Volt;
 double grain_size;
 double density;
 double gmol;
 double valency;
 int Mtype;   // 1:C; 2:SE; 4:AM + any binary combination
} type_work_material;

typedef struct {
    int N_mat;
    type_Material Mat[8];
    double mass_ratio[8];  // mass% ratio of each material
} type_Cathode;

typedef struct {
    int N_mat;
    type_work_material Mat[9];
    double mass_ratio[9];  // mass% ratio of each material
    double volume_ratio[9];  // mass% ratio of each material
} type_work_Cathode;

typedef struct {
    double am_capacity;
    double overall_cathode_capacity;
    double material_utilization[8];
    double overall_cathode_utilization;
} CalculationResult;

typedef struct {
    int param_kind; // 1: mass ratio; 2: gr size ratio;
    int grain_type; // of which grain type is this param. !
    double val;     // paranmeter value
    double val_min;
    double val_max;
} type_prop;

typedef struct {
  int npar_fit;
  type_prop prop[MAX_PARM_FIT];
} type_fit_prop;

// global variables
type_fit_prop fit_prop_type;
double ref_size_to_fit;              // in set_prop_type()
double vol_ratio_to_fit;         // in set_prop_type()
int fit_natoms_of_type[9];   // 0: no mass ratio fit; 1: mass ratio fit
int fit_size_of_type[9];     // 0: no size ratio fit; 1: size ratio fit

// global functions
type_tau init_tau(void);
type_Cathode init_Cathode(void);
void convert_to_work_types(type_Cathode, type_work_Cathode*);
void optimizer(type_Cathode, type_Cathode*, CalculationResult*);
void calculate(type_Cathode, CalculationResult*);
void implicit_cathode(type_work_Cathode);
double collect_cathode(type_tau);
void set_fit_types(type_Cathode);
type_fit_prop set_prop_type(type_work_Cathode*);
void get_res(type_work_Cathode, type_Cathode*, CalculationResult*);
void print_res(type_Cathode, CalculationResult*);

void prop_to_param(type_fit_prop, double param_fit[], double param_ini[]);
int param_to_prop(double param_fit[], type_fit_prop*, type_work_Cathode*); // return(ipenalty=0,1)
void get_new_fit_vol(type_fit_prop, double pin_fit[], double pout_fit[]);
void get_new_fit_size(type_fit_prop, double pin_fit[], double pout_fit[]);
void combine_fit(type_fit_prop, double pin_fit_atm[], double pin_fit_size[], double pout_fit[]);

type_work_Cathode minimization(type_work_Cathode);
type_work_Cathode min_simplex(type_work_Cathode); // multidimentional minimization
type_work_Cathode min_gold(type_work_Cathode);    // 1D minimization

double COST_FUNC(double param[], type_work_Cathode*);
int SIMPLEX(int, double, double, int, type_work_Cathode*);
double SIMPLEX_NEXT(double psum[], int, double, int, double, double fac, type_work_Cathode*);
double GOLDEN(double, double*, type_work_Cathode*);

double f(double, type_work_Cathode*);

type_tau tau;

double CF, CF_min, CF_max, CF_min_glb, CF_eps;
double C_of_AM, C_AM_max, C_of_sys;
double Util_of_type[6];
double Util_of_Mat[9];
double CostF[MAX_WEIGHTS];
double CostF_max[MAX_WEIGHTS];
int npar_fit;
double psum [MAX_PARM_FIT+2];
double y_fit[MAX_PARM_FIT+2];
double param_fit[MAX_PARM_FIT+1];
double param_ini[MAX_PARM_FIT+1];
double param_min[MAX_PARM_FIT+1];
double param_min_glb[MAX_PARM_FIT+1];
double p_fit[MAX_PARM_FIT+1][MAX_PARM_FIT+1];
double pbest_fit[MAX_PARM_FIT+1];


