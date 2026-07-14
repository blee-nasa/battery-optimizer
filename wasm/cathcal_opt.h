/***************************
 *                         *
 * Initialization routines *
 *                         *
 ***************************/

// Set wCathode->Mat[i].Npart from Cathode.mass_ratio[i]

void mass_to_particles(type_Cathode Cathode, type_work_Cathode* wCathode)
{
int i, i_max, N_mat, N_min, N_part[8];
double D, D_max, V_tot, M_tot, Part_mult;
double D_of[8], V_of[8], M_of[8], M_ratio[8], density[8];
double V1_of[8], M1_of[8];

   N_mat = Cathode.N_mat;
   for (i=0; i<8; i++) N_part[i]=0; 

// Select the largest particle size
   D_max = 0.0; i_max = 0;
   for (i=0; i<N_mat; i++) {
     M_ratio[i] = Cathode.mass_ratio[i];
     density[i] = Cathode.Mat[i].density;
     D = Cathode.Mat[i].grain_size;
     D_of[i] = D;
     V1_of[i] = PI/6.0 *D*D*D;           // Volume of one particle 
     M1_of[i] = V1_of[i]*density[i];     // Mass of one particle
     if(D > D_max) { D_max=D; i_max=i; }
   } // for (int i = 0; i < 8; i++)

// Assume system contains only MIN_PARTICLES particle of the largest material type.
// Calculate the particles number of the other materials.

   M_tot = MIN_PARTICLES*M1_of[i_max]/M_ratio[i_max]; 
   // Total mass assuming MIN_PARTICLES of the largest particles.

   N_min = MIN_PARTICLES;
   for (i=0; i<N_mat; i++) {
     N_part[i] = round(M_ratio[i]*M_tot/M1_of[i]);
     if(N_part[i] < N_min) N_min=N_part[i];

//     printf("N_part[%d]= %d\n", i, N_part[i]);

   } // for (int i = 0; i < 8; i++)
 
   Part_mult = 1.0; 
   if(N_min < MIN_PARTICLES) Part_mult=1.0*MIN_PARTICLES/N_min;

//   printf("N_min= %d,  N_mult= %lf\n", N_min, Part_mult);

   for (int i = 0; i < N_mat; i++) {
     wCathode->Mat[i+1].Npart = round(Part_mult*N_part[i]);

//     printf("Cathode.mass_ratio[%d]= %lf  ", i,Cathode.mass_ratio[i]);
//     printf("wCathode->Mat[%d].Npart= %d\n", i+1,wCathode->Mat[i+1].Npart);

   } // for (int i = 0; i < 8; i++)

} // void mass_to_particles() 

type_tau init_tau(void)
{
 type_tau tau_inp;
   tau_inp.AM_load = 0.0;
   tau_inp.AM_util = 0.0;
   tau_inp.C_util = 0.0;
   tau_inp.SE_util = 0.0;
   tau_inp.all_util = 0.0;
   tau_inp.Cap_AM = 0.0;
   tau_inp.Cap_sys = 1.0;

   return(tau_inp);
} // init_tau(void)

type_Cathode init_Cathode(void)
{
   type_Cathode Cathode;
   Cathode.N_mat = 3;  // number of materials in the cathode

   Cathode.mass_ratio[0] = 0.166625;
   Cathode.Mat[0].electronic_conductivity = 1000.0;
   Cathode.Mat[0].li_ion_conductivity = 0.0;
   Cathode.Mat[0].grain_size = 25.0;
   Cathode.Mat[0].molecular_weight = 12.01;
   Cathode.Mat[0].density = 2.00;
   Cathode.Mat[0].reduction_potential = 0.0;
   Cathode.Mat[0].valency = 0.0;

   Cathode.mass_ratio[1] = 0.369206;
//   Cathode.mass_ratio[1] = 0.169206;
   Cathode.Mat[1].electronic_conductivity = 0.0;
   Cathode.Mat[1].li_ion_conductivity = 0.0005;
   Cathode.Mat[1].grain_size = 30.0;
   Cathode.Mat[1].molecular_weight = 81.38;
   Cathode.Mat[1].density = 5.61;
   Cathode.Mat[1].reduction_potential = 0.0;
   Cathode.Mat[1].valency = 0.0;

   Cathode.mass_ratio[2] = 0.464169;
//   Cathode.mass_ratio[2] = 0.664169;
   Cathode.Mat[2].electronic_conductivity = 0.0;
   Cathode.Mat[2].li_ion_conductivity = 0.001;
   Cathode.Mat[2].grain_size = 50.0;
   Cathode.Mat[2].molecular_weight = 32.07;
   Cathode.Mat[2].density = 1.95;
   Cathode.Mat[2].reduction_potential = 3.0;
   Cathode.Mat[2].valency = 2.0;

   return(Cathode);
} // init_Cathode(void)

void conver_to_work_types(type_Cathode Cathode_in, type_work_Cathode* wCathode)
{
int k, mat_type;
   wCathode->N_mat = Cathode_in.N_mat;  // number of materials in the cathode

   for(k=1; k<=wCathode->N_mat; k++) {
     wCathode->Mat[k].e_cond = Cathode_in.Mat[k-1].electronic_conductivity;
     wCathode->Mat[k].Li_cond = Cathode_in.Mat[k-1].li_ion_conductivity;
     wCathode->Mat[k].Diam = Cathode_in.Mat[k-1].grain_size;
     wCathode->Mat[k].gmol = Cathode_in.Mat[k-1].molecular_weight;
     wCathode->Mat[k].Density = Cathode_in.Mat[k-1].density;
     wCathode->Mat[k].Volt = Cathode_in.Mat[k-1].reduction_potential;
     wCathode->Mat[k].valency = Cathode_in.Mat[k-1].valency;
     wCathode->mass_ratio[k] = Cathode_in.mass_ratio[k-1];
   }

// Calculate  Nparticles[] from Mass_ratio[]

   mass_to_particles(Cathode_in, wCathode);

//   printf("\n conver_to_work_types:\n");
   for(k=1; k<=wCathode->N_mat; k++) {
     mat_type = 0;
     if(wCathode->Mat[k].e_cond > 2e-12) mat_type=mat_type|1;
     if(wCathode->Mat[k].Li_cond > 2e-12) mat_type=mat_type|2;
     if(wCathode->Mat[k].Volt > 2e-12) mat_type=mat_type|4;
     wCathode->Mat[k].Mtype = mat_type;

//     printf("wCathode->Mat[%d].Mtype = %d\n", k,mat_type); 
   }

} // void conver_to_work_types()


/*************************
 *                       *
 * Optimization routines *
 *                       *
 *************************/

// Calculate cathode utilization & capacity

void implicit_cathode(type_work_Cathode Cat)
{
 double S_tot;
 double S_fract[8];
 double D_ratio[8][8];
 double Z_kl[8][8];
 double Z_kl1[8][8];
 double Z_CB[8], Z_SE[8];
 double P_CB[8], P_SE[8];
 double P_AM_util[8];
 double P_noCB[8], P_noSE[8];

 int na_all, nall_of_mater[6];

 int nAM_part;
 int i,k,l;
 int ncat_types, mtype_k, mtype_l, mtype_kl;
 int Npart, Np_tot;
 double A, D, Dk, Dl, R_kk,R_kl, Denom, Rand_occ, C_AM, Cap;
 double gr_mass, gr_mass_AM, gr_mass_sys, Volume, Volume_cm3;
 int Ncount_of_mat[9];

 ncat_types = Cat.N_mat;
// printf("\n implicit_cathode: ncat_types= %d\n", ncat_types);
 
 Np_tot = 0;
 S_tot = 0.0;
 for(k=1; k<=ncat_types; k++) {
  Npart = Cat.Mat[k].Npart;
  Np_tot += Npart;
  Dk = Cat.Mat[k].Diam;
  S_fract[k] = Npart * Dk*Dk;
  S_tot += S_fract[k];
  for(l=1; l<=ncat_types; l++) {
   Dl = Cat.Mat[l].Diam;
   D_ratio[k][l] = Dk/Dl;
  } 
 } // for(k=1; k<=ncat_types; k++)

 if(Np_tot > 0) { for(k=1; k<=ncat_types; k++) S_fract[k]/=S_tot; }

/*
 if(iprint > 0) { 
  for(i=1; i<=ncat_types; i++) {
   printf("S_frac[%d]= %lf\n", i,S_fract[i]);
  }

  printf("\n");
  for(k=1; k<=ncat_types; k++) {
   for(l=1; l<=ncat_types; l++) {
    printf("  D(%d, %d)= %6.2lf", k,l,  D_ratio[k][l]);
   }
   printf("\n");
  }
 } // if(iprint > 0)
*/

 Rand_occ = 6.0;
 A = 0.5*(2.0 - sqrt(3.0))*Rand_occ;

 for(k=1; k<=ncat_types; k++) {
  for(l=1; l<=ncat_types; l++) {
   R_kl = D_ratio[k][l];
   if(R_kl < 1.0) {
    R_kl = 1.0/R_kl;
    Denom = 1.0 + R_kl - sqrt(R_kl*(R_kl + 2.0));
    Z_kl1[k][l] = A*(R_kl + 1.0)/(Denom*R_kl*R_kl);
   } else {
    Denom = 1.0 + R_kl - sqrt(R_kl*(R_kl + 2.0));
    Z_kl1[k][l] = A*(R_kl + 1.0)/Denom;
   }
  } // for(l=1; l<=ncat_types; l++)
 } // for(k=1; k<=ncat_types; k++)

 for(k=1; k<=ncat_types; k++) {  // R_kk = 1
  R_kk = 1.0;
  Z_kl1[k][k] = A*(R_kk + 1.0)/Denom;
 }

 // Average number of contacts of a k-particle with l-particles
 for(k=1; k<=ncat_types; k++) {
  for(l=1; l<=ncat_types; l++) {
   Z_kl[k][l] =  Z_kl1[k][l]*S_fract[l];
  }
 }

 for(i=0; i<8; i++) { Z_CB[i]=0.0; Z_SE[i]=0.0; }
 for(k=1; k<=ncat_types; k++) {
  mtype_k = Cat.Mat[k].Mtype;
  for(l=1; l<=ncat_types; l++) {
   mtype_l = Cat.Mat[l].Mtype;
   mtype_kl = mtype_k & mtype_l;
   if((mtype_kl&1) == 1) Z_CB[k] += Z_kl[k][l];
   if((mtype_kl&2) == 2) Z_SE[k] += Z_kl[k][l];
  } // for(l=1; l<=ncat_types; l++)
 } // for(k=1; k<=ncat_types; k++)

/*
 if(iprint > 0) { 
  printf("Z_kl1:\n");
  for(k=1; k<=ncat_types; k++) {
   for(l=1; l<=ncat_types; l++) {
    printf("  Z1[%d][%d]= %6.2lf", k,l,Z_kl1[k][l]);
   }
   printf("\n");
  }
  printf("\nZ_kl:\n");
  for(k=1; k<=ncat_types; k++) {
   for(l=1; l<=ncat_types; l++) {
    printf("  Z[%d][%d]= %6.2lf", k,l,Z_kl[k][l]);
   }
   printf("\n");
  }
  printf("\n");
 } // if(iprint > 0)

 if(iprint > 0) { 
  for(k=1; k<=ncat_types; k++)
  printf("  Z_CB[%d]= %8.3lf Z_SE[%d]= %8.3lf\n", k,Z_CB[k], k,Z_SE[k]);
  printf("\n");
 } // if(iprint > 0)
*/

// P_CB(k) = Prob of k-type CB grain to be in a percolating cluster and
// utilized
// P_SE(k) = Prob of k-type SE grain to be in a percolating cluster and
// utilized
 for(i=0; i<8; i++) { P_CB[i]=0.0; P_SE[i]=0.0; }
 for(k=1; k<=ncat_types; k++) {
  if(Z_CB[k] < 4.236) {
   if(Z_CB[k] > 1.764) P_CB[k] = 1.0 - pow(((4.236 - Z_CB[k])/2.472),3.7);
  } else { P_CB[k] = 1.0; } // Z_CB[k] > 4.236
  if(Z_SE[k] < 4.236) {
   if(Z_SE[k] > 1.764) P_SE[k] = 1.0 - pow(((4.236 - Z_SE[k])/2.472),3.7);
  } else { P_SE[k] = 1.0; } // Z_SE[k] > 4.236
 } // for(k=1; k<=ncat_types; k++)

/*
 if(iprint > 0) { 
  for(k=1; k<=ncat_types; k++)
  printf("  P_CB[%d]= %6.3lf P_SE[%d]= %6.3lf\n", k,P_CB[k], k,P_SE[k]);
  printf("\n");
 } // if(iprint > 0)
*/

 for(i=0; i<8; i++) 
 { P_noCB[i]=1.0; P_noSE[i]=1.0; P_AM_util[i]=0.0; }
 for(k=1; k<=ncat_types; k++) {
  for(l=1; l<=ncat_types; l++) {
   mtype_l = Cat.Mat[l].Mtype;
   if((mtype_l&1) == 1) P_noCB[k] *= pow((1.0 - P_CB[l]), Z_kl[k][l]);
   if((mtype_l&2) == 2) P_noSE[k] *= pow((1.0 - P_SE[l]), Z_kl[k][l]);
  } // for(l=1; l<=ncat_types; l++)
 } // for(k=1; k<=ncat_types; k++)

 for(i=0; i<9; i++) { Util_of_Mat[i]=0.0; Ncount_of_mat[i]=0; }
 for(i=0; i<6; i++) { Util_of_type[i]=0.0; nall_of_mater[i]=0; }
 for(k=1; k<=ncat_types; k++) {
  mtype_k = Cat.Mat[k].Mtype;
  Npart = Cat.Mat[k].Npart;
  if((mtype_k&1) == 1) {
   nall_of_mater[1] +=  Npart;
   Ncount_of_mat[k] += Npart;
   Util_of_type[1] += P_CB[k]*Npart;
   Util_of_Mat[k] += P_CB[k]*Npart;
  }
  if((mtype_k&2) == 2) {
   nall_of_mater[2] +=  Npart;
   Ncount_of_mat[k] += Npart;
   Util_of_type[2] += P_SE[k]*Npart;
   Util_of_Mat[k] += P_SE[k]*Npart;
  }
  if((mtype_k&4) == 4) {
   nall_of_mater[4] +=  Npart;
   Ncount_of_mat[k] += Npart;
   P_AM_util[k] = (1.0 - P_noCB[k])*(1.0 - P_noSE[k]);
   Util_of_type[4] += P_AM_util[k]*Npart;
   Util_of_Mat[k] += P_AM_util[k]*Npart;
  }
 } // for(k=1; k<=ncat_types; k++)

 na_all = 0;
 Util_of_type[0] = 0.0;
 for(k=1; k<=ncat_types; k++) {
   na_all += Ncount_of_mat[k];
   if(Ncount_of_mat[k] > 0) {
     Util_of_Mat[k] /= Ncount_of_mat[k];
     Util_of_type[0] += Util_of_Mat[k]*Cat.mass_ratio[k];
   }
 }

 if(nall_of_mater[1] > 0) Util_of_type[1] /= nall_of_mater[1];
 if(nall_of_mater[2] > 0) Util_of_type[2] /= nall_of_mater[2];
 if(nall_of_mater[4] > 0) Util_of_type[4] /= nall_of_mater[4];
 Util_of_type[5] = Util_of_type[0];

 nAM_part = 0;
 C_AM = 0.0; C_AM_max = 0.0; gr_mass_AM = 0.0; gr_mass_sys = 0.0;
 for(k=1; k<=ncat_types; k++) {
  mtype_k = Cat.Mat[k].Mtype;
  D = Cat.Mat[k].Diam;
  Volume = 3.141592/6.0 * D*D*D; // [nm^3]
  Volume_cm3 = Cat.Mat[k].Npart * Volume * 1E-21; // [cm^3]
  gr_mass = Volume_cm3 * Cat.Mat[k].Density;      // [grams]

  if((mtype_k&4) == 4) {
   nAM_part += Cat.Mat[k].Npart;
   // Cap = n * Na * e / (3.6 * gmol_mass(k))
   Cap = Cat.Mat[k].valency * 6.022045E23*1.6021E-19 /(3.6*Cat.Mat[k].gmol);
   C_AM_max += gr_mass*Cap;
   C_AM += gr_mass*Cap*Util_of_type[4];
   gr_mass_AM += gr_mass;
  }
  gr_mass_sys += gr_mass;
 } // for(k=1; k<=ncat_types; k++)

 if(nAM_part > 0) {
  C_AM_max /=gr_mass_AM;
  C_of_AM = C_AM/gr_mass_AM;
  C_of_sys = C_AM/gr_mass_sys;
 } else  { // No AM material
  C_AM_max = 1673.0;
  C_of_AM = 0.0;
  C_of_sys = 0.0;
 }

/*
 if(iprint > 0) { 
  printf("Utilization:\n");
  printf("U(C)   = %7.3lf\n", 100.0*Util_of_type[1]);
  printf("U(SE)  = %7.3lf\n", 100.0*Util_of_type[2]);
  printf("U(AM)  = %7.3lf\n", 100.0*Util_of_type[4]);
  printf("U(all) = %7.3lf\n", 100.0*Util_of_type[5]);
  printf("CAM_max = %9.2lf\n", C_AM_max);
  printf("C_of_AM = %9.2lf\n", C_of_AM);
  printf("C_of_sys = %9.2lf\n\n", C_of_sys);

  for(k=1; k<=ncat_types; k++) {
   mtype_k = Cat.Mat[k].Mtype;
   if((mtype_k&4) == 4) {
    printf("  P_noCB[%d]= %7.4lf  P_noSE[%d]= %7.4lf |  P_AM_util[%d]= %7.4lf\n\n",
    k,P_noCB[k], k,P_noSE[k], k,P_AM_util[k]);
   }
  } // for(k=1; k<=ncat_types; k++)

  printf("\n");
 } // if(iprint > 0)
*/

 return;
} // END implicit_cathode()

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

/*
void print_res(int N_mat, CalculationResult *result)
{
   printf("\nCF= %lf\n", CF);
   printf("Cathode materials: %d\n", N_mat);
   printf("am_capacity= %8.2lf mAh\n", result->am_capacity);
   printf("cathode_capacity= %8.2lf mAh\n", result->overall_cathode_capacity);
   for (int i = 0; i < N_mat; i++) {
       printf("Utilization of material[%d]= %6.2lf%%\n", 
       i+1,result->material_utilization[i]);
   }

  return;
} // print_res()
*/
