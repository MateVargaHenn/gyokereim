import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideQuillConfig } from 'ngx-quill/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { httpInterceptor } from '@admincore/interceptors/http-interceptor';
import { errorInterceptor } from '@admincore/interceptors/error-interceptor';
import { authenticationInterceptor } from '@admincore/interceptors/authentication-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      httpInterceptor,
      errorInterceptor,
      authenticationInterceptor
    ])),
    provideQuillConfig({
      modules: {
        toolbar: [
            // Címsor
            [{ header: [1, 2, 3, 4, false] }],

            // Betűtípus és méret
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],

            // Alapformázások
            ['bold', 'italic', 'underline', 'strike'],

            // Színek
            [{ color: [] }, { background: [] }],

            // Alsó és felső index
            [{ script: 'sub' }, { script: 'super' }],

            // Listák
            [{ list: 'ordered' }, { list: 'bullet' }],

            // Behúzás
            [{ indent: '-1' }, { indent: '+1' }],

            // Igazítás
            [{ align: [] }],

            // Speciális blokkok
            ['blockquote', 'code-block'],

            // Beágyazások
            ['link', 'image', 'video'],

            // Formázás törlése
            ['clean']
        ]
      }
    })
  ]
};
