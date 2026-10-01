import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'szolgaltatasaim/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'megrendeles/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'nyomkovetes/:tracknumber/:email',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
