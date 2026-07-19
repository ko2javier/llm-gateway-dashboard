import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  API_BASE_URL,
  ApiError,
  ChatRequest,
  ChatResponse,
  StatusResponse,
} from './gateway.models';

/**
 * Result of a failed chat call, normalized so the component can render the
 * right kind of message bubble.
 */
export interface ChatFailure {
  // 400 -> invalid prompt (empty body), 401/429/502 -> upstream JSON error,
  // 0 -> network/connection failure.
  status: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private http = inject(HttpClient);
  private base = API_BASE_URL;

  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http
      .post<ChatResponse>(`${this.base}/api/v1/llm/chat`, req)
      .pipe(catchError((err: HttpErrorResponse) => this.mapChatError(err)));
  }

  status(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.base}/api/v1/status`);
  }

  private mapChatError(err: HttpErrorResponse): Observable<never> {
    // status 0 => network failure / backend unreachable / CORS block.
    if (err.status === 0) {
      return throwError(
        () =>
          ({
            status: 0,
            message:
              'No se pudo conectar con el gateway. Comprueba que el backend esté en marcha.',
          }) as ChatFailure,
      );
    }

    // 400 => validation error with an EMPTY body.
    if (err.status === 400) {
      return throwError(
        () => ({ status: 400, message: 'Prompt inválido' }) as ChatFailure,
      );
    }

    // 401 / 429 / 502 => JSON error body { timestamp, status, error }.
    const body = err.error as Partial<ApiError> | null;
    const message =
      body && typeof body.error === 'string' && body.error.length > 0
        ? body.error
        : `Error ${err.status} del gateway.`;
    return throwError(
      () => ({ status: err.status, message }) as ChatFailure,
    );
  }
}
