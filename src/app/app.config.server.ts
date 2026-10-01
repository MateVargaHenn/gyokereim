import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from '@core/interceptors/http-interceptor';
import { errorInterceptor } from '@core/interceptors/error-interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withInterceptors([
      httpInterceptor,
      errorInterceptor
    ])),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
