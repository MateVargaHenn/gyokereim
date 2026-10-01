import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthenticationService } from '../../core/services/authentication.service';

export const authenticationInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const authenticationService =
    inject(AuthenticationService);

  const accessToken =
    authenticationService.getAccessToken();

  if (!accessToken) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return next(authenticatedRequest);
};