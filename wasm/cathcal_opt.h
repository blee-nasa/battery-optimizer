/***************************
 *                         *
 * Optimization routines   *
 *                         *
 ***************************/

type_tau init_tau(void)
{
 double CostSum;
 type_tau tau_inp;
 int i;

   tau_inp.AM_load = 0.0;
   tau_inp.AM_util = 0.0;
   tau_inp.C_util = 0.0;
   tau_inp.SE_util = 0.0;
   tau_inp.all_util = 0.0;
   tau_inp.Cap_AM = 0.0;
   tau_inp.Cap_sys = 1.0;

   CostSum = 0.0;
   CostF_max[0] = tau_inp.all_util;
   CostF_max[1] = tau_inp.C_util;
   CostF_max[2] = tau_inp.SE_util;
   CostF_max[3] = 0.0;
   CostF_max[4] = tau_inp.AM_util;
   CostF_max[5] = 0.0;
   CostF_max[6] = tau_inp.Cap_AM;
   CostF_max[7] = tau_inp.Cap_sys;

   for(i=0; i<8; i++) CostSum+=CostF_max[i];
   if(CostSum > 1.e-10) {
    for(i=0; i<8; i++) CostF_max[i] /= CostSum;
   }

   CF_max = 0.0;
   for(i=0; i<8; i++) CF_max += CostF_max[i];
   CF_eps = 0.0001*CF_max;
   CF_min_glb = CF_max + CF_eps;

//   srand((unsigned int)time(NULL));
    srand(1739);

   return(tau_inp);
} // init_tau(void)

void set_fit_types(type_Cathode Cathode_in)
{
int k;
   for(k=0; k<9; k++) { ifit_natoms_of_type[k]=0; ifit_size_of_type[k]=0; }
   for(k=1; k<=Cathode_in.N_mat; k++) {
     ifit_natoms_of_type[k] = 1; // default: fit all mass ratios 
   }
}

type_fit_prop set_prop_type(type_work_Cathode* wCathode_in)
{
type_fit_prop fit_prop;
int k, npar_fit, N_mat;

   volume_to_fit = 0.0; // global in cathcal_def.h
   npar_fit = 0;
   N_mat = wCathode_in->N_mat;

   for(k=1; k<=N_mat; k++) {
     if(ifit_natoms_of_type[k] > 0) volume_to_fit += wCathode_in->volume_ratio[k];
   }

   for(k=1; k<=N_mat; k++) {
     if((ifit_natoms_of_type[k] > 0) && (k != ref_mass_material)) {
       npar_fit++;
       fit_prop.prop[npar_fit].param_kind = 1; // fit to mass ratio
       fit_prop.prop[npar_fit].grain_type = k;
       fit_prop.prop[npar_fit].val = wCathode_in->volume_ratio[k];
       fit_prop.prop[npar_fit].val_min = 0;
       fit_prop.prop[npar_fit].val_max = 1.0;
     }
   } // for(k=1...)

   // choose the first grain size as reference ! Change later !
   ref_size = wCathode_in->Mat[ref_size_material].grain_size;

   for(k=1; k<=wCathode_in->N_mat; k++) {
     if((ifit_size_of_type[k] > 0) && (k != ref_size_material)) {
       npar_fit++;
       fit_prop.prop[npar_fit].param_kind = 2; // fit to size
       fit_prop.prop[npar_fit].grain_type = k;
       fit_prop.prop[npar_fit].val = wCathode_in->Mat[k].grain_size/ref_size;
       fit_prop.prop[npar_fit].val_min = 0.1*wCathode_in->Mat[k].grain_size;
       fit_prop.prop[npar_fit].val_max = 10.0*wCathode_in->Mat[k].grain_size;
     }
   } // for(k=1...)

   fit_prop.npar_fit = npar_fit;

   return(fit_prop);
}

void prop_to_param(type_fit_prop fit_prop_type, double p_fit[], double p_ini[])
{
// fit_prop_type --> p_fit[] --> p_ini[]

  for(int k=1; k<=fit_prop_type.npar_fit; k++) {
    p_fit[k] = fit_prop_type.prop[k].val;
    p_ini[k] = fit_prop_type.prop[k].val;
  }
} // END prop_to_param()

void combine_fit(type_fit_prop fit_prop_type,
	         double pin_fit_atm[], double pin_fit_size[], double pout_fit[])
{
 int ipar, npar, ikind;

  npar = fit_prop_type.npar_fit;

  for(ipar=1; ipar<=npar; ipar++) {
    ikind = fit_prop_type.prop[ipar].param_kind;
    switch (ikind) {
      case 1: {  pout_fit[ipar] = pin_fit_atm[ipar]; break; }  // grain at%
      case 2: {  pout_fit[ipar] = pin_fit_size[ipar]; break; } // grain size
    } // switch (ikind)
  } // for(ipar=1; ...
} // END combine_fit()

void get_new_fit_size(type_fit_prop fit_prop_type, double pin_fit[], double pout_fit[])
{
 int ip, ipar, npar, ikind, id_size;
 int iparm_of[MAX_PARM_FIT+1];
 double ran, value_min, value_max, value_new;

  npar = fit_prop_type.npar_fit;

  for(ip=1; ip<=npar; ip++) { pout_fit[ip] = pin_fit[ip]; }
  id_size = 0;
  for(ipar=1; ipar<=npar; ipar++) {
    ikind = fit_prop_type.prop[ipar].param_kind;
    if(ikind==2) {
      id_size++;
      iparm_of[id_size] = ipar;
    } 
  } // for(ipar=1; ...

  if(id_size > 0) {
// Select a random change for size fiiting set of parameters
    for(ip=1; ip<=id_size; ip++) {
      ipar = iparm_of[ip];
      value_min = fit_prop_type.prop[ipar].val_min;
      value_max = fit_prop_type.prop[ipar].val_max;
      ran = (double)rand() / (double)RAND_MAX; // 0 < ran < 1
      value_new = (value_max - value_min)*ran + value_min;
      pout_fit[ipar] = value_new;
    } // for(ip=1; ip<=id_size; ip++)
  } // if(id_size > 0)

/*
  printf("get_new_fit_size:\n");
  for(ip=1; ip<=id_size; ip++) {
    printf("pin_fit[%d]= %lf --> pout_fit[%d]= %lf\n", ip,pin_fit[ip], ip,pout_fit[ip]);
  }
*/
} // END get_new_fit_size()

void get_new_fit_vol(type_fit_prop fit_prop_type, double pin_fit[], double pout_fit[])
{
 int id_atm = 0;
 double ran, ran1, conc_range;
 int i, k, ip, ip_ran, ipar, npar, ikind, iused;
 int iparm_of[MAX_PARM_FIT+1];
 int ip_num[MAX_PARM_FIT+1];
 int ip_occ[MAX_PARM_FIT+1];

  npar = fit_prop_type.npar_fit; // number of fitted parameters

  conc_range = volume_to_fit; // defined in set_prop_type()

  for(ipar=1; ipar<=npar; ipar++) {
    ikind = fit_prop_type.prop[ipar].param_kind;
    if(ikind==1) {
      id_atm++;
      iparm_of[id_atm] = ipar;
    } 
  } // for(ipar=1; ...

  for(i=0; i<=npar; i++) { ip_num[i]=0; ip_occ[i]=0; }

  for(ip=1; ip<id_atm; ip++) {
    do {
      ran = (double)rand() / (double)RAND_MAX;
      ip_ran = (int)(id_atm*ran) + 1;
      iused = 0;
      for(k=1; k<=ip; k++) { if(ip_ran==ip_num[k]) iused=1; }
    } while (iused>0);

    ip_num[ip] = ip_ran;
    ip_occ[ip_ran] = 1;

    ran = (double)rand() / (double)RAND_MAX; // 0 < ran < 1
    ran1 = conc_range*ran;                   // 0 < ran1 < conc_range
    conc_range = conc_range - ran1;
    pout_fit[iparm_of[ip_ran]] = ran1;

//printf("get_new_fit_vol: ip= %d, ip_ran= %d, ran1= %lf, ip_occ[%d]= %d, pout_fit[%d]= %lf\n",
//ip, ip_ran, ran1, ip_ran, ip_occ[ip_ran], iparm_of[ip_ran], pout_fit[iparm_of[ip_ran]]);	

  } // for(int ip=1; ip<id_atm; ip++)

  for(k=1; k<=id_atm; k++) { if(ip_occ[k]==0) pout_fit[iparm_of[k]]=conc_range; }
/*  
  printf("get_new_fit_vol:\n");
  for(ip=1; ip<=id_atm; ip++) {
    printf("pin_fit[%d]= %lf --> pout_fit[%d]= %lf\n", ip,pin_fit[ip], ip,pout_fit[ip]);
  }
*/
} // END get_new_fit_vol()

int param_to_prop(double param[], type_fit_prop* fit_prop_type, type_work_Cathode* wCathode)
{ 
// param[] --> fit_prop_type --> wCathode

 type_work_Cathode Cath;
 int ipenalty = 0;
 int npar_fit, ikind, ipar, itype;
 double vol_prc, tot_vol_prc;
 double val, val_min, val_max, size_ratio, size_ref;

  npar_fit = fit_prop_type->npar_fit;

//  printf("param_to_prop: npar_fit= %d\n", npar_fit);

  tot_vol_prc = 0.0;
  for(ipar=1; ipar<=npar_fit; ipar++) {
    ikind = fit_prop_type->prop[ipar].param_kind;
    if(ikind==1) { tot_vol_prc += param[ipar];

// printf("param_to_prop: param[%d]= %lf, tot_vol_prc= %lf\n", ipar,param[ipar],tot_vol_prc);

    } // grain at%
    if(ikind==2) {
      val = param[ipar];  // grain diameter
      val_min = fit_prop_type->prop[ipar].val_min;
      val_max = fit_prop_type->prop[ipar].val_max;
      if((val < val_min) || (val_max < val)) ipenalty=1;
    } // case 2:

  } // for(ipar=1; ipar<=npar_fit; ipar++)

  if(tot_vol_prc > 1.00001) ipenalty=1; 

// Update optimized properties:
// Update grain diam first:

  for(ipar=1; ipar<=npar_fit; ipar++) {
    ikind = fit_prop_type->prop[ipar].param_kind;
    if(ikind==2) { // grain diam
      size_ratio = param[ipar];
      fit_prop_type->prop[ipar].val = size_ratio;
      itype = fit_prop_type->prop[ipar].grain_type;
      size_ref = wCathode->Mat[ref_size_material].grain_size;
      wCathode->Mat[itype].grain_size = size_ratio*size_ref; // update grain size
    } // if(ikind==2)...
  } // for(ipar=1; ipar<=npar_fit; ipar++)

// Update grain volume_ratio next:

  for(ipar=1; ipar<=npar_fit; ipar++) {
    ikind = fit_prop_type->prop[ipar].param_kind;
    if(ikind==1) { // volume_ratio
      vol_prc = param[ipar];
      fit_prop_type->prop[ipar].val = vol_prc;
      itype = fit_prop_type->prop[ipar].grain_type;
      if((vol_prc < 0.0) || (vol_prc > 1.0)) {
	ipenalty = 1;
	vol_prc = 0.0;
      }
      wCathode->volume_ratio[itype] = vol_prc; // update mass ratio

//printf("param_to_prop: ikind=%d, vol_prc=param[ipar=%d]= %lf, itype= %d\n", ikind,ipar,vol_prc,itype);

    } // if(ikind==1)...
  } // for(ipar=1; ipar<=npar_fit; ipar++)

//printf("FROM param_to_prop:\n");

  Cath = *wCathode;
  volume_to_particles(Cath, wCathode);
  Cath = *wCathode;
  particles_to_mass(Cath, wCathode);
/*
  for(int i=1; i<=3; i++) {
    printf("param_to_prop: wCathode->volume_ratio[%d]= %lf, wCathode->Mat[%d].Npart=%d\n",
    i,wCathode->volume_ratio[i], i,wCathode->Mat[i].Npart);
  }
*/
  return(ipenalty);
} // END param_to_prop()

type_work_Cathode minimization(type_work_Cathode wCathode) // updates wCathode during minimization
{
int isuccess = 0;
int imin_exist = 0;
int j0 = 1;
int iter = 1000;   // SIMPLEX internal iterations
int iend = 0;
double yb = 100.0;

int i,k, j_ind, ntrials, ntrials0, iter_out;
int npar_fit;
double CF_min;
double p1_fit[MAX_PARM_FIT+1];
double pnew_fit[MAX_PARM_FIT+1];
double pnew_fit_atm[MAX_PARM_FIT+1];
double pnew_fit_size[MAX_PARM_FIT+1];

   fit_prop_type = set_prop_type(&wCathode);
   prop_to_param(fit_prop_type, param_fit, param_ini);
   npar_fit = fit_prop_type.npar_fit;

/*
   for(i=1; i<=npar_fit; i++) {
     printf("param_fit[%d]= %lf  param_ini[%d]= %lf  kind= %d\n",
     i,param_fit[i], i,param_ini[i], fit_prop_type.prop[i].param_kind);
   }
*/
   CF_min = CF_max + CF_eps;  // To start the for{} loop !

   for(ntrials0=1; ntrials0<=iterations; ntrials0++) {

     for(i=1; i<=fit_prop_type.npar_fit; i++) {
       param0_fit[i] = param_fit[i];
       p_fit[i][1] = param_fit[i];
       if(fit_prop_type.prop[i].param_kind == 1) p1_fit[i]=param_fit[i];
       if(fit_prop_type.prop[i].param_kind == 2) p1_fit[i]=param_ini[i];
     }

     CF = y_fit[1] = COST_FUNC(param_fit, &wCathode);

//     for(i=1; i<=npar_fit; i++) printf("p_fit[%d][1]= %lf\n", i,p_fit[i][1]);

     if(CF < CF_min_glb) {
       imin_exist = 1; j0 = 2;
       CF_min_glb = CF_min = CF;
       for(i=0; i<=npar_fit; i++) param_min_glb[i]=param_fit[i];
     }

//printf("\nTRIAL: %d of %d\n INITIAL EVAL at minimization start...\n", ntrials0,iterations);
//printf("Start CF= %lf\n", CF);

//     goto point1;

     for(ntrials=0; CF_min>(CF_max-CF_eps); ntrials++) {
       CF_min = CF_max + CF_eps;
       for(j_ind=j0; j_ind<=npar_fit+1; j_ind++) {
//	 printf("j_ind= %d of %d\n", j_ind, npar_fit+1);
	 get_new_fit_vol(fit_prop_type, p1_fit, pnew_fit_atm);
	 get_new_fit_size(fit_prop_type, p1_fit, pnew_fit_size);
	 combine_fit(fit_prop_type, pnew_fit_atm, pnew_fit_size, pnew_fit);

	 for(i=1; i<=npar_fit; i++) {
	   p_fit[i][j_ind] = pnew_fit[i];
	   param_fit[i] = pnew_fit[i];
	 }

	 CF = COST_FUNC(param_fit, &wCathode);

	 y_fit[j_ind] = CF;

// printf("1: p_fit[1][%d]= %lf p_fit[2][%d]= %lf p_fit[3][%d]= %lf  CF= %lf\n",
// j_ind,p_fit[1][j_ind], j_ind,p_fit[2][j_ind], j_ind,p_fit[3][j_ind], CF);

	 if(CF < (CF_min-2.0*CF_eps)) { // substantially less
	   CF_min = CF;
	   for(i=0; i<=npar_fit; i++) param_min[i]=param_fit[i];
	   imin_exist = 1;
         }

         if(CF < CF_min_glb) {
           CF_min_glb = CF;
           for(i=0; i<=npar_fit; i++) param_min_glb[i]=param_fit[i];
         }
       } // for(j_ind=1; j_ind<=npar_fit+1; j_ind++)

// printf("\nminimization: ntrials= %d of %d, CF_min= %lf < CF_max= %lf CF_min_glb= %lf\n",
//    	ntrials, iterations, CF_min, CF_max, CF_min_glb);

       if(CF_min > (CF_max-CF_eps)) { isuccess = 0; } else { isuccess = 1; }

     } // for(ntrials=0; CF_min>(CF_max-CF_eps); ntrials++)

     if(imin_exist == 0) {
//       printf("\n INIT NOT FOUND at ntrials= %d, CF_min= %lf\n", ntrials, CF_min);
     } else { // imin_exist = 1 START SIMPLEX !

point1:
/*
     isuccess = 1; imin_exist = 1;
     p_fit[1][1] = 0.02917737; p_fit[2][1] = 0.26482655; p_fit[3][1] = 0.70599608;
     p_fit[1][2] = 0.67631435; p_fit[2][2] = 0.26334553; p_fit[3][2] = 0.06034012;
     p_fit[1][3] = 0.93370932; p_fit[2][3] = 0.00200787; p_fit[3][3] = 0.06428281;
     p_fit[1][4] = 0.13759850; p_fit[2][4] = 0.40931035; p_fit[3][4] = 0.45309114;
*/
     for(int j=1; j<=npar_fit+1; j++) {
       for(i=1; i<=npar_fit; i++) param_fit[i]=p_fit[i][j];
       CF = COST_FUNC(param_fit, &wCathode);
       y_fit[j] = CF;
// printf("2: p_fit[1][%d]= %lf p_fit[2][%d]= %lf p_fit[3][%d]= %lf  CF= %lf\n",
// j,p_fit[1][j], j,p_fit[2][j], j,p_fit[3][j], CF);
     }
// printf("\n");

// Minimization cycle

       for(i=1; i<=npar_fit; i++) pbest_fit[i]=p_fit[i][1];

       iter_out = SIMPLEX(npar_fit, yb, tolerance, iter, &wCathode);

   return(wCathode);  // NOT OK after SIMPLEX  VVVV

       if(iter_out > 0) iend=1;

//printf("minimization: iter_out= %d\n", iter_out);
//for(i=1; i<=npar_fit; i++) printf("pbest_fit[%d]= %lf\n", i,pbest_fit[i]);

       for(k=1; k<=npar_fit; k++) param_fit[k]=pbest_fit[k]; 
//       for(k=1; k<=npar_fit; k++) param_fit[k]=p_fit[k][1]; 
       CF = COST_FUNC(param_fit, &wCathode);

//     return(wCathode); // NOT OK VVVV

       if(CF < CF_min) {
	  CF_min = CF;
	  imin_exist = 1;
	  for(i=0; i<=npar_fit; i++) param_min[i]=param_fit[i];
          if(CF_min < CF_min_glb) {
             CF_min_glb = CF_min;
	     for(i=0; i<=npar_fit; i++) param_min_glb[i]=param_min[i];
          }
       }


     } // else if(imin_exist == 0) 


   } // for(ntrials0=0; ntrials0<iterations; ntrials0++)

   return(wCathode);

//printf("\n *****************\nEND minimization: CF_min_glb= %lf\n", CF_min_glb);
//for(i=1; i<=npar_fit; i++) printf("param_min_glb[%d]= %lf\n", i,param_min_glb[i]);

} // END minimization

double COST_FUNC(double param[MAX_PARM_FIT+1], type_work_Cathode* wCathode)
{
 type_work_Cathode Cath;
 int ipenalty = 0;
 double CF;

 CF = 9999.999;

/*
 int npar_fit = fit_prop_type.npar_fit;
 for(int i=1; i<=npar_fit; i++) {
   printf("COST_FUNC: param[%d]= %lf, kind= %d\n",
   i,param[i], fit_prop_type.prop[i].param_kind);
 }
*/
 ipenalty = param_to_prop(param, &fit_prop_type, wCathode); // param[] --> wCathode

// printf("COST_FUNC: ipenalty=%d\n", ipenalty);

 if(ipenalty==0) { // no penalty, keep going!
   Cath = *wCathode;

// for(int i=1; i<=Cath.N_mat; i++) printf("COST_FUNC: Cath.vol_ratio[%d]= %lf\n", i,Cath.vol_ratio[i]);

   implicit_cathode(Cath);
   *wCathode = Cath;
   CF = collect_cathode(tau);  // Cost Function calculation (internal only)
 } // if(ipenalty==0) 

// printf("COST_FUNC: CF= %lf\n", CF);

 return(CF);
} // END collect_cathode()

double collect_cathode(type_tau tau)
{
 int i;
 double CF;

 CostF[0] = tau.all_util*(1.0 - Util_of_type[0]);
 CostF[1] = tau.C_util*(1.0 - Util_of_type[1]);
 CostF[2] = tau.SE_util*(1.0 - Util_of_type[2]);
 CostF[3] = 0.0;
 CostF[4] = tau.AM_util*(1.0 - Util_of_type[4]);
 CostF[5] = 0.0;
 CostF[6] = tau.Cap_AM*(1.0 - C_of_AM/(C_AM_max + 1.E-6));
 CostF[7] = tau.Cap_sys*(1.0 - C_of_sys/(C_AM_max + 1.E-6));

 CF = 0.0;
 for(i=0; i<8; i++) CF+=CostF[i];

 return(CF);
} // END collect_cathode()

