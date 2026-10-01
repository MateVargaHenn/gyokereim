import {
  inject,
  Injectable,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  switchMap,
  tap
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequestDto } from '../../shared/data-transfer-objects/login-request.dto';
import { LoginResponseDto } from '../../shared/data-transfer-objects/login-response.dto';
import { CurrentUserDto } from '../../shared/data-transfer-objects/current-user.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<CurrentUserDto | null>(null);

  login(
    request: LoginRequestDto
  ): Observable<CurrentUserDto> {

    return this.http
      .post<LoginResponseDto>(
        `${environment.apiUrl}/authentication/login`,
        request
      )
      .pipe(
        tap(response => {
          this.storeTokens(response);
        }),

        switchMap(() => {
          return this.loadCurrentUser();
        })
      );
  }

  loadCurrentUser(): Observable<CurrentUserDto> {
    return this.http
      .get<CurrentUserDto>(
        `${environment.apiUrl}/authentication/me`
      )
      .pipe(
        tap(user => {
          this.currentUser.set(user);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }

    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return sessionStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()
      ?.roles
      .includes(role) ?? false;
  }

  private storeTokens(
    response: LoginResponseDto
  ): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.setItem(
      'accessToken',
      response.accessToken
    );

    sessionStorage.setItem(
      'refreshToken',
      response.refreshToken
    );
  }
}