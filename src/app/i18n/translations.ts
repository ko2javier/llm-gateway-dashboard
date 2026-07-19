export type Locale = 'en' | 'es' | 'de';

export const LOCALES: Locale[] = ['en', 'es', 'de'];

export interface QuickExampleText {
  label: string;
  prompt: string;
}

export interface Dictionary {
  app: {
    title: string;
    tag: string;
    description: string;
    baseUrlLabel: string;
    footer: string;
  };
  chat: {
    panelTitle: string;
    badge: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyPromptError: string;
    placeholder: string;
    send: string;
    maxTokensLabel: string;
    degradedBadge: string;
    examples: QuickExampleText[];
  };
  status: {
    title: string;
    live: string;
    offline: string;
    offlineBanner: string;
    failedCalls: string;
    retryAttempts: string;
    bufferedCalls: string;
    notAvailable: string;
  };
  errors: {
    network: string;
    invalidPrompt: string;
    generic: (status: number) => string;
  };
}

export const TRANSLATIONS: Record<Locale, Dictionary> = {
  en: {
    app: {
      title: 'LLM Gateway',
      tag: 'observability',
      description: 'Spring Boot · Groq · Resilience4j (retry + circuit breaker) · weather tool',
      baseUrlLabel: 'base_url = ',
      footer: 'demo UI · GET /api/v1/status polled every 5s · POST /api/v1/llm/chat',
    },
    chat: {
      panelTitle: 'LLM Gateway · Chat',
      badge: 'groq · resilience4j',
      emptyTitle: '// no messages yet',
      emptySubtitle: 'Type a prompt or try a quick example below.',
      emptyPromptError: "Prompt can't be empty",
      placeholder: 'Type your prompt…',
      send: 'Send',
      maxTokensLabel: 'maxTokens',
      degradedBadge: 'circuit breaker OPEN · fallback',
      examples: [
        {
          label: 'What is a circuit breaker?',
          prompt:
            "Explain in 2 sentences what a circuit breaker is and why it's useful in an LLM gateway.",
        },
        {
          label: 'Weather in Madrid',
          prompt: "What's the weather like in Madrid right now?",
        },
        {
          label: 'Resilience4j vs manual',
          prompt:
            'Summarize in 2 sentences the advantages of Resilience4j over handling retries manually.',
        },
      ],
    },
    status: {
      title: 'Resilience Status',
      live: 'live · 5s',
      offline: 'offline',
      offlineBanner:
        'No connection to /api/v1/status. The backend may be down; status is unavailable.',
      failedCalls: 'Failed calls',
      retryAttempts: 'Retry attempts',
      bufferedCalls: 'Buffered calls',
      notAvailable: 'NOT AVAILABLE',
    },
    errors: {
      network: 'Could not connect to the gateway. Check that the backend is running.',
      invalidPrompt: 'Invalid prompt',
      generic: (status) => `Gateway error ${status}.`,
    },
  },
  es: {
    app: {
      title: 'LLM Gateway',
      tag: 'observabilidad',
      description: 'Spring Boot · Groq · Resilience4j (retry + circuit breaker) · tool de clima',
      baseUrlLabel: 'base_url = ',
      footer: 'UI de demo · GET /api/v1/status consultado cada 5s · POST /api/v1/llm/chat',
    },
    chat: {
      panelTitle: 'LLM Gateway · Chat',
      badge: 'groq · resilience4j',
      emptyTitle: '// sin mensajes todavía',
      emptySubtitle: 'Escribe un prompt o prueba un ejemplo rápido abajo.',
      emptyPromptError: 'El prompt no puede estar vacío',
      placeholder: 'Escribe tu prompt…',
      send: 'Enviar',
      maxTokensLabel: 'maxTokens',
      degradedBadge: 'circuit breaker OPEN · fallback',
      examples: [
        {
          label: '¿Qué es un circuit breaker?',
          prompt:
            'Explícame en 2 frases qué es un circuit breaker y por qué es útil en un gateway de LLMs.',
        },
        {
          label: 'Clima en Madrid',
          prompt: '¿Qué tiempo hace ahora en Madrid?',
        },
        {
          label: 'Resilience4j vs manual',
          prompt:
            'Resume en 2 frases las ventajas de Resilience4j frente a manejar reintentos manualmente.',
        },
      ],
    },
    status: {
      title: 'Estado de resiliencia',
      live: 'en vivo · 5s',
      offline: 'sin conexión',
      offlineBanner:
        'Sin conexión con /api/v1/status. El backend puede no estar en marcha; los estados no están disponibles.',
      failedCalls: 'Llamadas fallidas',
      retryAttempts: 'Reintentos',
      bufferedCalls: 'Llamadas en buffer',
      notAvailable: 'NO DISPONIBLE',
    },
    errors: {
      network: 'No se pudo conectar con el gateway. Comprueba que el backend esté en marcha.',
      invalidPrompt: 'Prompt inválido',
      generic: (status) => `Error ${status} del gateway.`,
    },
  },
  de: {
    app: {
      title: 'LLM Gateway',
      tag: 'Observability',
      description: 'Spring Boot · Groq · Resilience4j (Retry + Circuit Breaker) · Wetter-Tool',
      baseUrlLabel: 'base_url = ',
      footer: 'Demo-UI · GET /api/v1/status wird alle 5s abgefragt · POST /api/v1/llm/chat',
    },
    chat: {
      panelTitle: 'LLM Gateway · Chat',
      badge: 'groq · resilience4j',
      emptyTitle: '// noch keine Nachrichten',
      emptySubtitle: 'Schreibe einen Prompt oder probiere unten ein Beispiel.',
      emptyPromptError: 'Der Prompt darf nicht leer sein',
      placeholder: 'Schreibe deinen Prompt…',
      send: 'Senden',
      maxTokensLabel: 'maxTokens',
      degradedBadge: 'Circuit Breaker OPEN · Fallback',
      examples: [
        {
          label: 'Was ist ein Circuit Breaker?',
          prompt:
            'Erkläre in 2 Sätzen, was ein Circuit Breaker ist und warum er in einem LLM-Gateway nützlich ist.',
        },
        {
          label: 'Wetter in Madrid',
          prompt: 'Wie ist das Wetter gerade in Madrid?',
        },
        {
          label: 'Resilience4j vs. manuell',
          prompt:
            'Fasse in 2 Sätzen die Vorteile von Resilience4j gegenüber manuellem Retry-Handling zusammen.',
        },
      ],
    },
    status: {
      title: 'Resilience-Status',
      live: 'live · 5s',
      offline: 'offline',
      offlineBanner:
        'Keine Verbindung zu /api/v1/status. Das Backend läuft möglicherweise nicht; Status nicht verfügbar.',
      failedCalls: 'Fehlgeschlagene Aufrufe',
      retryAttempts: 'Wiederholungsversuche',
      bufferedCalls: 'Gepufferte Aufrufe',
      notAvailable: 'NICHT VERFÜGBAR',
    },
    errors: {
      network: 'Verbindung zum Gateway fehlgeschlagen. Prüfe, ob das Backend läuft.',
      invalidPrompt: 'Ungültiger Prompt',
      generic: (status) => `Gateway-Fehler ${status}.`,
    },
  },
};
