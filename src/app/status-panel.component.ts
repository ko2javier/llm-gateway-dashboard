import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { GatewayService } from './gateway.service';
import { ResilienceInstance, StatusResponse } from './gateway.models';

interface CardView {
  key: string;
  label: string;
  data: ResilienceInstance | null; // null => unknown
}

@Component({
  selector: 'app-status-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="rounded-xl border border-edge-soft bg-panel-soft shadow-lg shadow-black/30"
    >
      <header class="flex items-center justify-between border-b border-edge-soft px-4 py-3">
        <div class="flex items-center gap-2">
          <span
            class="h-2 w-2 rounded-full"
            [ngClass]="
              reachable()
                ? 'bg-accent shadow-[0_0_8px_rgba(74,222,128,0.9)]'
                : 'bg-slate-700'
            "
          ></span>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Resilience Status
          </h2>
        </div>
        <span
          class="font-mono text-[10px] uppercase tracking-widest"
          [class.text-accent]="reachable()"
          [class.text-slate-600]="!reachable()"
        >
          {{ reachable() ? 'live · 5s' : 'offline' }}
        </span>
      </header>

      <div class="flex flex-col gap-5 p-4">
        <!-- Offline warning banner -->
        <div
          *ngIf="!reachable()"
          class="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <p class="text-[11px] leading-relaxed text-amber-100/90">
            Sin conexión con
            <span class="font-mono text-amber-200">/api/v1/status</span>. El backend
            puede no estar en marcha; los estados no están disponibles.
          </p>
        </div>

        <article
          *ngFor="let card of cards()"
          class="rounded-lg border p-4 transition-colors"
          [ngClass]="cardClass(card.data)"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-semibold text-slate-200">
              {{ card.label }}
            </span>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2.5 w-2.5">
                <span
                  *ngIf="card.data && card.data.state !== 'HALF_OPEN'"
                  class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  [ngClass]="dotPing(card.data)"
                ></span>
                <span
                  class="relative inline-flex h-2.5 w-2.5 rounded-full"
                  [ngClass]="dotCore(card.data)"
                ></span>
              </span>
              <span
                class="font-mono text-[11px] font-semibold tracking-wide"
                [ngClass]="stateText(card.data)"
              >
                {{ card.data ? card.data.state : 'NO DISPONIBLE' }}
              </span>
            </div>
          </div>

          <dl class="mt-3 space-y-1.5 text-[11px]">
            <div class="flex items-center justify-between">
              <dt class="text-slate-400">Failed calls</dt>
              <dd
                class="font-mono tabular-nums"
                [class.text-rose-300]="card.data && card.data.failedCalls > 0"
                [class.text-slate-300]="!card.data || card.data.failedCalls === 0"
              >
                {{ card.data ? card.data.failedCalls : '—' }}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-400">Retry attempts</dt>
              <dd class="font-mono tabular-nums text-slate-300">
                {{ card.data ? card.data.retryAttempts : '—' }}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-400">Buffered calls</dt>
              <dd class="font-mono tabular-nums text-slate-400">
                {{ card.data ? card.data.bufferedCalls : '—' }}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  `,
})
export class StatusPanelComponent implements OnInit, OnDestroy {
  private gateway = inject(GatewayService);
  private sub?: Subscription;

  reachable = signal(false);
  private status = signal<StatusResponse | null>(null);

  cards = signal<CardView[]>([
    { key: 'groqApi', label: 'groqApi', data: null },
    { key: 'weatherApi', label: 'weatherApi', data: null },
  ]);

  ngOnInit(): void {
    // Poll every 5s, firing immediately on start.
    this.sub = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.gateway.status()),
      )
      .subscribe({
        next: (res) => {
          this.reachable.set(true);
          this.status.set(res);
          this.cards.set([
            { key: 'groqApi', label: 'groqApi', data: res.groqApi },
            { key: 'weatherApi', label: 'weatherApi', data: res.weatherApi },
          ]);
        },
        error: () => {
          // Do NOT crash — degrade to unknown state.
          this.reachable.set(false);
          this.status.set(null);
          this.cards.set([
            { key: 'groqApi', label: 'groqApi', data: null },
            { key: 'weatherApi', label: 'weatherApi', data: null },
          ]);
        },
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cardClass(d: ResilienceInstance | null): string {
    if (!d) {
      // Unknown / offline: discreet, clearly "not available" — never reads as a healthy state.
      return 'border-dashed border-edge-soft bg-transparent opacity-55';
    }
    switch (d.state) {
      case 'CLOSED':
        return 'border-accent/30 bg-accent/[0.04]';
      case 'OPEN':
        // Whole-card red wash so a broken circuit is obvious at a glance.
        return 'border-rose-500/60 bg-rose-500/10 shadow-[0_0_22px_rgba(244,63,94,0.18)]';
      case 'HALF_OPEN':
        return 'border-amber-500/50 bg-amber-500/[0.08]';
    }
  }

  dotCore(d: ResilienceInstance | null): string {
    if (!d) return 'bg-slate-700';
    switch (d.state) {
      case 'CLOSED':
        return 'bg-accent shadow-[0_0_8px_rgba(74,222,128,0.8)]';
      case 'OPEN':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      case 'HALF_OPEN':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    }
  }

  dotPing(d: ResilienceInstance | null): string {
    if (!d) return 'bg-slate-700';
    return d.state === 'OPEN' ? 'bg-rose-500' : 'bg-accent';
  }

  stateText(d: ResilienceInstance | null): string {
    if (!d) return 'text-slate-600';
    switch (d.state) {
      case 'CLOSED':
        return 'text-accent';
      case 'OPEN':
        return 'text-rose-300';
      case 'HALF_OPEN':
        return 'text-amber-300';
    }
  }
}
