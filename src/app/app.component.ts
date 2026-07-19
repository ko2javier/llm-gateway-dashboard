import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatPanelComponent } from './chat-panel.component';
import { StatusPanelComponent } from './status-panel.component';
import { API_BASE_URL } from './gateway.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatPanelComponent, StatusPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen bg-base text-slate-200">
      <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <!-- Header -->
        <header class="mb-6 flex flex-col gap-1">
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 font-mono text-accent shadow-[0_0_16px_rgba(74,222,128,0.25)]"
            >
              λ
            </span>
            <div>
              <h1 class="text-lg font-semibold tracking-tight text-slate-100">
                LLM Gateway
                <span class="text-slate-600">/</span>
                <span class="font-mono text-sm text-accent">observability</span>
              </h1>
              <p class="text-xs text-slate-500">
                Spring Boot · Groq · Resilience4j (retry + circuit breaker) · weather tool
              </p>
            </div>
          </div>
          <p class="ml-12 font-mono text-[10px] text-slate-600">
            base_url = <span class="text-slate-500">{{ baseUrl }}</span>
          </p>
        </header>

        <!-- Two-column dashboard -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <app-chat-panel></app-chat-panel>
          </div>
          <aside class="lg:col-span-1">
            <div class="lg:sticky lg:top-6">
              <app-status-panel></app-status-panel>
            </div>
          </aside>
        </div>

        <footer class="mt-8 text-center font-mono text-[10px] text-slate-700">
          demo UI · GET /api/v1/status polled every 5s · POST /api/v1/llm/chat
        </footer>
      </div>
    </main>
  `,
})
export class AppComponent {
  baseUrl = API_BASE_URL;
}
