import { inject, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApi } from '@admincore/interfaces/api/api';
import { APP_CONFIG } from '@admincore/configurations/app-config';

export class Api implements IApi {
  readonly getBaseUrl: Signal<string> = signal(APP_CONFIG.apiBaseUrl);

  private readonly httpClient = inject(HttpClient);

  private buildUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl().replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');

    return `${baseUrl}/${path}`;
  }

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse> {
    return this.httpClient.post<TResponse>(
      this.buildUrl(endpoint),
      body
    );
  }

  get<TResponse>(endpoint: string): Observable<TResponse> {
    return this.httpClient.get<TResponse>(
      this.buildUrl(endpoint),
      {
        transferCache: true
      }
    );
  }

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse | undefined> {
    return this.httpClient.put<TResponse>(
      this.buildUrl(endpoint),
      body
    );
  }

  delete<TResponse>(
    endpoint: string
  ): Observable<TResponse | undefined> {
    return this.httpClient.delete<TResponse>(
      this.buildUrl(endpoint)
    );
  }
}