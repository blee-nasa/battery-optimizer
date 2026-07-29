/***************************
 *                         *
 * GOLD SECTION routine    *
 *                         *
 ***************************/

double GOLDEN(double ftol, double* xmin, type_work_Cathode* wCath)
{
double R = 0.61803399;
double C = 1.0 - R;
double ax,bx,cx, f1,f2, x0,x1,x2,x3, res;

  ax = 0.0;
  bx = param_fit[1]; // 0 <= bx <= 1.0
  cx = 1.0;

//  printf("GOLDEN: bx = param_fit[1] = %lf\n", bx);

  x1 = ax;
  x3 = cx;

  if(fabs(cx-bx) > fabs(bx-ax)) {
    x1 = bx;
    x2 = bx + C*(cx-bx);
  } else {
    x2 = bx;
    x1 = bx - C*(bx-ax);
  }

  f1 = f(x1, wCath);
  f2 = f(x2, wCath);

  while (fabs(x3-x0) > ftol*(fabs(x1)+fabs(x2))) {
    if(f2 < f1) {
      x0 = x1;
      x1 = x2;
      x2 = R*x1 + C*x3;
      f1 = f2;
      f2 = f(x2, wCath);
    } else {
      x3 = x2;
      x2 = x1;
      x1 = R*x2 + C*x0;
      f2 = f1;
      f1 = f(x1, wCath);
    }

//    printf(" fabs(x1)=%lf, fabs(x2)=%lf, fabs(x3-x0)=%lf\n", fabs(x1), fabs(x2), fabs(x3-x0)); 
//    getchar();
  }

  if(f1 < f2) {
    res = f1;
    *xmin = x1;
  } else {
    res = f2;
    *xmin = x2;
  }

return(res);
} // END GOLDEN()

double f(double x, type_work_Cathode* wCath)
{
double y;

//gets npar_fit = (global) fit_prop_type.npar_fit using (global) param_fit[]

  param_fit[1] = x;
  y = COST_FUNC(param_fit, wCath);

// y = (x-0.75)*(x-0.75) + 0.335;
return(y);
}

/***************************
 *                         *
 * SIMPLEX routines        *
 *                         *
 ***************************/

int SIMPLEX(int ndim, double yb, double ftol, int iter, type_work_Cathode* Cath)
{
 int n, m, i, j;
 int ilo, ihi;
 double sum, ylo, yhi, ynhi, yt, ytry, ysave, rtol, swap;
 double psum[MAX_PARM_FIT+1];

// printf("SIMPLEX: ndim= %d, yb= %lf, ftol= %lf, iter= %d, Cath->N_mat= %d\n",
//        ndim, yb, ftol, iter, Cath->N_mat);

step1: for(n=1; n<=ndim; n++) {
         sum = 0.0;
         for(m=1; m<=ndim+1; m++) { sum += p_fit[n][m]; }
         psum[n] = sum;
       }

step2: ilo = 1;
       ihi = 2;

       ylo = y_fit[1];
       ynhi = ylo;
       yhi = y_fit[2];

       if(ylo > yhi) {
	 ihi = 1;
	 ilo = 2;
	 ynhi = yhi;
	 yhi  = ylo;
	 ylo  = ynhi;
       }

       for(i=3; i<=ndim+1; i++) {
	 yt  = y_fit[i];
	 if(yt <= ylo) { ilo = i; ylo = yt; }
	 if(yt > yhi) { ynhi = yhi; ihi  = i; yhi  = yt; }
	 else if (yt > ynhi) { ynhi = yt; }
       } // for(i=3; i<=ndim+1; i++)

       rtol = 2.0*fabs(yhi - ylo)/(fabs(yhi) + fabs(ylo) + 0.000001);

// printf("SIMPLEX: yhi= %lf, ylo= %lf, rtol= %lf < ftol= %lf, iter= %d\n", 
//	yhi,ylo,rtol,ftol,iter);

       if ((rtol < ftol) || (iter < 0)) {
         swap = y_fit[1];
	 y_fit[1] = y_fit[ilo];
	 y_fit[ilo] = swap;
	 for(n=1; n<=ndim; n++) {
           swap = y_fit[1];
	   p_fit[n][1] = p_fit[n][ilo];
	   p_fit[n][ilo] = swap;
	 }
         return(iter);
       } // if ((rtol < ftol) || (iter < 0))
       iter -= 2;
       ytry = SIMPLEX_NEXT(psum,ndim,yb,ihi,yhi,-1.0, Cath);
       if (ytry <= ylo) { 
	 ytry = SIMPLEX_NEXT(psum,ndim,yb,ihi,yhi,2.0, Cath); 
       } else if (ytry >= ynhi) { 
         ysave = yhi;
	 ytry =  SIMPLEX_NEXT(psum,ndim,yb,ihi,yhi,0.5, Cath);
	 if (ytry >= ysave) {
           for(i=1; i<=ndim+1; i++) {
	     if (i != ilo) {
	       for(j=1; j<=ndim; j++) {
		 psum[j] = 0.5*(p_fit[j][i] + p_fit[j][ilo]);
		 p_fit[j][i] = psum[j];
	       }
	       y_fit[i] = COST_FUNC(psum, Cath);
	     }
           }
	   iter -= ndim;
	   goto step1;
         }
       } else { iter++; }
       goto step2;

} // END SIMPLEX

double SIMPLEX_NEXT(double psum[MAX_PARM_FIT+1], int ndim, double yb, int ihi, double yhi,
         	    double fac, type_work_Cathode* Cath)
{
 int j;
 double fac1, fac2, ytry, yflu;
 double ptry[MAX_PARM_FIT+1];

// printf("SIMPLEX_NEXT: ndim=%d yb=%lf ihi=%d yhi=%lf fac=%lf\n", ndim,yb,ihi,yhi,fac);
for(int i=1; i<=ndim; i++) // printf("psum[%d]=%lf\n", i,psum[i]);

  fac1 = (1.0 - fac)/ndim;
  fac2 = fac1 - fac;

  for(j=1; j<=ndim; j++) { ptry[j] = psum[j]*fac1 - p_fit[j][ihi]*fac2; }
  ytry = COST_FUNC(ptry, Cath);
  if (ytry <= yb) {
    for(j=1; j<=ndim; j++) { pbest_fit[j] = ptry[j]; }
    yb = ytry;
  }

// printf("SIMPLEX_NEXT: ytry=%lf\n", ytry);

  yflu = ytry;
  if( yflu < yhi) {
    y_fit[ihi] = ytry;
    yhi = yflu;
    for(j=1; j<=ndim; j++) {
      psum[j] = psum[j] - p_fit[j][ihi] + ptry[j];
      p_fit[j][ihi] = ptry[j];
    }
  }

// printf("SIMPLEX_NEXT RETURN yflu=%lf\n", yflu);
  return(yflu);

} // END SIMPLEX_NEXT
