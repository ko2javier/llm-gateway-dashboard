import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPanelComponent } from './chat-panel.component';
import { StatusPanelComponent } from './status-panel.component';
import { API_BASE_URL } from './gateway.models';
import { I18nService } from './i18n/i18n.service';
import { Locale } from './i18n/translations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatPanelComponent, StatusPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen bg-base text-slate-200">
      <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <!-- Header -->
        <header class="mb-6 flex flex-col gap-2">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 font-mono text-accent shadow-[0_0_16px_rgba(74,222,128,0.25)]"
              >
                λ
              </span>
              <div>
                <h1 class="text-lg font-semibold tracking-tight text-slate-100">
                  {{ i18n.t().app.title }}
                  <span class="text-slate-600">/</span>
                  <span class="font-mono text-sm text-accent">{{ i18n.t().app.tag }}</span>
                </h1>
                <p class="text-xs text-slate-500">
                  {{ i18n.t().app.description }}
                </p>
              </div>
            </div>

            <!-- Language switcher -->
            <div class="flex items-center gap-1 rounded-lg border border-edge bg-panel p-1">
              <button
                *ngFor="let l of locales"
                type="button"
                (click)="i18n.setLocale(l)"
                class="rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors"
                [class.bg-accent]="i18n.locale() === l"
                [class.text-base]="i18n.locale() === l"
                [class.text-slate-500]="i18n.locale() !== l"
                [class.hover:text-slate-200]="i18n.locale() !== l"
              >
                {{ l }}
              </button>
            </div>
          </div>
          <p class="ml-12 font-mono text-[10px] text-slate-600">
            {{ i18n.t().app.baseUrlLabel }}<span class="text-slate-500">{{ baseUrl }}</span>
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
          {{ i18n.t().app.footer }}
        </footer>
      </div>
    </main>
  `,
})
export class AppComponent {
  i18n = inject(I18nService);
  baseUrl = API_BASE_URL;
  locales: Locale[] = ['en', 'es', 'de'];
}
