import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'station/:id',
    loadComponent: () =>
      import('./pages/station-detail/station-detail.page').then(m => m.StationDetailPage)
  },
  {
    path: 'report/:stationId',
    loadComponent: () => import('./pages/report/report.page').then(m => m.ReportPage)
  },
];
