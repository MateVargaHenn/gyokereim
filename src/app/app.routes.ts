import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/kezdolap', pathMatch: 'full' },
    { path: 'kezdolap', loadComponent: () => import('./features/home/home').then(m => m.Home) },
    { path: 'rolam', loadComponent: () => import('./features/about/about').then(m => m.About) },
    { path: 'szolgaltatasaim', loadComponent: () => import('./features/services/services').then(m => m.Services) },
    { path: 'szolgaltatasaim/:slug', loadComponent: () => import('./features/service-view/service-view').then(m => m.ServiceView) },
    { path: 'kapcsolat', loadComponent: () => import('./features/contact/contact').then(m => m.Contact) },
    { path: 'blog', loadComponent: () => import('./features/blog/blog').then(m => m.Blog) },
    { path: 'blog/:slug', loadComponent: () => import('./features/blog-post/blog-post').then(m => m.BlogPost) },
    { path: 'adatvedelmi-tajekoztato', loadComponent: () => import('./features/privacy/privacy').then(m => m.Privacy) },
    { path: 'impresszum', loadComponent: () => import('./features/impressum/impressum').then(m => m.Impressum) },
    { path: 'cookie', loadComponent: () => import('./features/cookie/cookie').then(m => m.Cookie) },
    { path: 'megrendeles/:slug', loadComponent: () => import('./features/order/order').then(m => m.Order) },
    { path: 'altalanos-szerzodesi-feltetelek', loadComponent: () => import('./features/terms-conditions/terms-conditions').then(m => m.TermsConditions) },
    { path: 'nyomkovetes/:tracknumber/:email', loadComponent: () => import('./features/tracking/tracking').then(m => m.Tracking) },
    { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound) },
];
