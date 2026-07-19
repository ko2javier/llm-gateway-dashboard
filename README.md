# LLM Gateway Dashboard

Angular dashboard demoing live chat, function/tool calling, and real-time Resilience4j circuit breaker state for [`llm-gateway-resilience`](https://github.com/ko2javier/llm-gateway-resilience).

## What it does

- **Chat** — `POST /api/v1/llm/chat`. Shows the response text, latency, token usage (input/output/total), and a `🔧 get_current_weather` badge whenever the model actually invoked the weather tool instead of answering from its own knowledge.
- **Resilience status panel** — polls `GET /api/v1/status` every 5s and shows the live circuit breaker state (`CLOSED` / `OPEN` / `HALF_OPEN`) and retry count for both backend instances, `groqApi` and `weatherApi`, independently.
- **Graceful degradation** — if a circuit breaker is `OPEN`, the backend still returns `200` with an apology message instead of failing; the UI detects this and renders it with a distinct amber/warning style instead of a normal assistant bubble.
- **Quick examples** — three preset prompts, one of which ("¿Qué tiempo hace en Madrid?") deliberately triggers the weather tool call so the badge and the `weatherApi` circuit breaker are demoable with a single click.

## Tech stack

Angular 18 (standalone components, signals, no router) + Tailwind CSS. Single screen, dark technical-dashboard theme.

## Backend

Talks directly to `https://llm.ko2-oreilly.com` (production `llm-gateway-resilience`, see `src/app/gateway.models.ts`). CORS is open on `/api/v1/**` on that backend specifically to allow this frontend to call it from the browser without a proxy.

## Running locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:4200` and talks to the production backend above — no local backend required.

## Project structure

```
src/app/
├── app.component.ts           — shell, two-column layout, no routing
├── chat-panel.component.ts    — chat UI, quick examples, message rendering
├── status-panel.component.ts  — resilience status polling + cards
├── gateway.service.ts         — HTTP calls + error mapping (400/401/429/502/network)
└── gateway.models.ts          — shared types, API base URL, degraded-text constant
```
