import { Routes } from '@angular/router';
import { authGuard } from '@admincore/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin'
  },
  {
    path: 'bejelentkezes',
    loadComponent: () =>
      import('./features/login/login')
        .then(m => m.Login)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/admin-layout/admin-layout')
        .then(m => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'vezerlopult'
      },
      {
        path: 'vezerlopult',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./features/blogs/blogs')
            .then(m => m.Blogs)
      },
      {
        path: 'blog/uj',
        loadComponent: () =>
          import('./features/blog-form/blog-form')
            .then(m => m.BlogForm)
      },
      {
        path: 'blog/:id',
        loadComponent: () =>
          import('./features/blog-form/blog-form')
            .then(m => m.BlogForm)
      },
      {
        path: 'szolgaltatasok',
        loadComponent: () =>
          import('./features/services/services')
            .then(m => m.Services)
      },
      {
        path: 'szolgaltatasok/uj',
        loadComponent: () =>
          import(
            './features/service-form/service-form'
          ).then(m => m.ServiceForm)
      },
      {
        path: 'szolgaltatasok/:id',
        loadComponent: () =>
          import(
            './features/service-form/service-form'
          ).then(m => m.ServiceForm)
      },
      {
        path: 'megrendelesek',
        loadComponent: () =>
          import('./features/orders/orders')
            .then(m => m.Orders)
      },
      {
        path: 'megrendelesek/:id',
        loadComponent: () =>
          import(
            './features/order-details/order-details'
          ).then(m => m.OrderDetails)
      },
      {
        path: 'fajlok',
        loadComponent: () =>
          import('./features/files/files')
            .then(m => m.Files)
      },
      {
        path: 'web-beallitasok',
        loadComponent: () =>
          import('./features/web-settings/web-settings')
            .then(m => m.WebSettings)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];