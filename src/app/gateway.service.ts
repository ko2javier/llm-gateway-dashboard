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
import { I18nService } from './i18n/i18n.service';

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
  private i18n = inject(I18nService);
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
            message: this.i18n.t().errors.network,
          }) as ChatFailure,
      );
    }

    // 400 => validation error with an EMPTY body.
    if (err.status === 400) {
      return throwError(
        () => ({ status: 400, message: this.i18n.t().errors.invalidPrompt }) as ChatFailure,
      );
    }

    // 401 / 429 / 502 => JSON error body { timestamp, status, error }, written by the backend
    // (always in Spanish today — the frontend can't translate text it doesn't generate).
    const body = err.error as Partial<ApiError> | null;
    const message =
      body && typeof body.error === 'string' && body.error.length > 0
        ? body.error
        : this.i18n.t().errors.generic(err.status);
    return throwError(
      () => ({ status: err.status, message }) as ChatFailure,
    );
  }
}
