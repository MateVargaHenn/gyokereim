import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import {
  catchError,
  map,
  of
} from 'rxjs';

import { AuthenticationService } from '../../core/services/authentication.service';

export const authGuard: CanActivateFn = () => {

  const authenticationService =
    inject(AuthenticationService);

  const router = inject(Router);

  if (!authenticationService.isAuthenticated()) {
    return router.createUrlTree(['/bejelentkezes']);
  }

  if (authenticationService.currentUser()) {
    return true;
  }

  return authenticationService
    .loadCurrentUser()
    .pipe(
      map(() => true),

      catchError(() => {
        authenticationService.logout();

        return of(
          router.createUrlTree(['/bejelentkezes'])
        );
      })
    );
};