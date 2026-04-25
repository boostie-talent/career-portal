import { Routes } from '@angular/router';
import { JobResolver } from './job.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main-page/main-page.component').then((m) => m.MainPageComponent),
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./job-details/job-details.component').then((m) => m.JobDetailsComponent),
    resolve: { message: JobResolver },
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./main-page/main-page.component').then((m) => m.MainPageComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
  },
  { path: '**', redirectTo: '/' },
];
