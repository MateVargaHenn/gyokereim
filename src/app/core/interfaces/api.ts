import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IApi {
  readonly getBaseUrl: Signal<string>;

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse | undefined> | never;

  get<TResponse>(endpoint: string): Observable<TResponse | undefined> | never;

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
  ): Observable<TResponse | undefined> | never;

  delete<TResponse>(endpoint: string): Observable<TResponse | undefined> | never;
}
