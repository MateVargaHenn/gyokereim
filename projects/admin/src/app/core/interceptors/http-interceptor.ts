import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

    let modifiedRequest = req;

    // 1. Base URL hozzáadása
    if (!req.url.startsWith('http')) {
        modifiedRequest = modifiedRequest.clone({
            url: `${environment.apiUrl}/${req.url}`
        });
    }

    // 2. Általános headerek
    modifiedRequest = modifiedRequest.clone({
        setHeaders: {
            Accept: 'application/json'
        }
    });

    // 3. Cookie alapú auth esetén
    modifiedRequest = modifiedRequest.clone({
        withCredentials: true
    });

    return next(modifiedRequest);
};