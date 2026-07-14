
#define MAX_PARM_FIT 8   // Max number of fitting parameters
#define MAX_WEIGHTS 8    // Max number of weights
#define PI 3.1415926536
#define MIN_PARTICLES 1000 // Minimum number of particles of any type

extern int iprint;   // 0: no print; 1: print calculations to test

extern int iterations;   // simplex itter, 0: compute capacity only;
extern double tolerance; // SIMPLEX tolerance value to end
extern int Ntypes;       // number of powder material types
extern double C_of_AM, C_AM_max, C_of_sys;

extern double Util_of_type[6];
extern double Util_of_Mat[9];
extern double CostF[MAX_WEIGHTS];

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
    int N_mat;
    type_Material Mat[8];
    double mass_ratio[8];  // mass% ratio of each material
} type_Cathode;

typedef struct {
    double am_capacity;
    double overall_cathode_capacity;
    double material_utilization[8];
    double overall_cathode_utilization;
} CalculationResult;

typedef struct {
 int Npart;  // number of particles
 double e_cond;
 double Li_cond;
 double Volt;
 double Diam;
 double Density;
 double gmol;
 double valency;
 int Mtype;   // 1:C; 2:SE; 4:AM + any binary combination
} type_work_material;

typedef struct {
    int N_mat;
    type_work_material Mat[8];
    double mass_ratio[8];  // mass% ratio of each material
} type_work_Cathode;

type_tau init_tau(void);
type_Cathode init_Cathode(void);
void conver_to_work_types(type_Cathode, type_work_Cathode*);
void optimizer(type_Cathode, type_Cathode*, CalculationResult*);
void calculator(type_Cathode, CalculationResult*);
void implicit_cathode(type_work_Cathode);
double collect_cathode(type_tau);
void print_res(int, CalculationResult*);

int iprint = 0;
double CF;
double C_of_AM, C_AM_max, C_of_sys;
double Util_of_type[6];
double Util_of_Mat[9];
double CostF[MAX_WEIGHTS];
type_tau tau;

