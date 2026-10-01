import { inject, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApi } from '@core/interfaces/api';
import { APP_CONFIG } from '@core/configurations/app-config';

export class Api implements IApi {
  readonly getBaseUrl: Signal<string> = signal(APP_CONFIG.apiBaseUrl);
  private readonly httpClient = inject(HttpClient);

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse> {
    return this.httpClient.post<TResponse>(`${this.getBaseUrl()}/${endpoint}`, body);
  }

  get<TResponse>(endpoint: string): Observable<TResponse> {

  const url = `${this.getBaseUrl()}/${endpoint}`;

    return this.httpClient.get<TResponse>(`${this.getBaseUrl()}/${endpoint}`,{
      transferCache: true
    });
  }

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse | undefined> {
    return this.httpClient.put<TResponse>(`${this.getBaseUrl()}/${endpoint}`, body);
  }

  delete<TResponse>(endpoint: string): Observable<TResponse | undefined> {
    return this.httpClient.delete<TResponse>(`${this.getBaseUrl()}/${endpoint}`);
  }
}
