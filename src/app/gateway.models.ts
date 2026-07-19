// Shared types for the LLM gateway dashboard.

export const API_BASE_URL = 'https://llm.ko2-oreilly.com';

// Exact degraded-fallback string emitted by the backend when the circuit breaker is OPEN.
export const DEGRADED_TEXT =
  'El servicio de IA no está disponible en este momento. Intenta de nuevo en unos segundos.';

export interface ChatRequest {
  prompt: string;
  maxTokens: number;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  totalTokens: number;
}

export interface ChatResponse {
  text: string;
  latencyMs: number;
  usage: Usage;
  toolUsed: string | null;
}

// Upstream/error JSON body for 401/429/502.
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
}

export type MessageKind = 'user' | 'assistant' | 'degraded' | 'error';

export interface ChatMessage {
  id: number;
  kind: MessageKind;
  text: string;
  // Present only for successful assistant messages.
  latencyMs?: number;
  usage?: Usage;
  toolUsed?: string | null;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ResilienceInstance {
  state: CircuitState;
  failedCalls: number;
  bufferedCalls: number;
  retryAttempts: number;
}

export interface StatusResponse {
  groqApi: ResilienceInstance;
  weatherApi: ResilienceInstance;
}
