import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ServerStatus } from '@core/services/server-status'; 
import { catchError, tap, throwError } from 'rxjs';
import type { HttpErrorResponse } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const serverStatus = inject(ServerStatus);

    return next(req).pipe(
        tap(() => serverStatus.setAvailable(true)),


        catchError((error: HttpErrorResponse) => {

            console.error('HTTP ERROR:', error);

            return throwError(() => error);
        })
    );
};
