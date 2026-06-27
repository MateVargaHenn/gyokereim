import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/kezdolap', pathMatch: 'full' },
    { path: 'kezdolap', loadComponent: () => import('./features/home/home').then(m => m.Home) },
];
