import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GatewayService, ChatFailure } from './gateway.service';
import { ChatMessage, DEGRADED_TEXT } from './gateway.models';
import { I18nService } from './i18n/i18n.service';

// Fixed order, matched positionally against Dictionary.chat.examples in every locale.
const EXAMPLE_ICONS: Array<'brain' | 'cloud' | 'gear'> = ['brain', 'cloud', 'gear'];

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="flex h-full flex-col rounded-xl border border-edge bg-panel shadow-2xl shadow-black/60 ring-1 ring-white/5"
    >
      <header class="flex items-center justify-between border-b border-edge px-4 py-3.5">
        <div class="flex items-center gap-2">
          <span class="font-mono text-base font-bold text-accent">$</span>
          <h2 class="text-sm font-semibold tracking-wide text-slate-100">
            {{ i18n.t().chat.panelTitle }}
          </h2>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(74,222,128,0.9)]"></span>
          {{ i18n.t().chat.badge }}
        </span>
      </header>

      <!-- Message stream -->
      <div
        #scroll
        class="flex-1 space-y-4 overflow-y-auto px-4 py-5"
        style="min-height: 320px; max-height: 60vh;"
      >
        <div
          *ngIf="messages().length === 0"
          class="flex h-full flex-col items-center justify-center gap-2 text-center"
        >
          <p class="font-mono text-sm text-slate-500">
            {{ i18n.t().chat.emptyTitle }}
          </p>
          <p class="text-xs text-slate-600">
            {{ i18n.t().chat.emptySubtitle }}
          </p>
        </div>

        <div *ngFor="let m of messages()" class="flex w-full">
          <!-- USER -->
          <div *ngIf="m.kind === 'user'" class="ml-auto max-w-[80%]">
            <div
              class="rounded-2xl rounded-br-sm border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm leading-relaxed text-emerald-50"
            >
              {{ m.text }}
            </div>
          </div>

          <!-- ASSISTANT (normal) -->
          <div *ngIf="m.kind === 'assistant'" class="mr-auto max-w-[80%]">
            <div
              class="rounded-2xl rounded-bl-sm border border-edge bg-base px-4 py-2.5 text-sm leading-relaxed text-slate-200"
            >
              {{ m.text }}
            </div>
            <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span class="badge text-slate-400">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                {{ m.latencyMs }}ms
              </span>
              <span class="badge text-slate-400">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                {{ m.usage?.inputTokens }}→{{ m.usage?.outputTokens }} ({{
                  m.usage?.totalTokens
                }} total)
              </span>
              <span
                *ngIf="m.toolUsed"
                class="badge border-accent/40 bg-accent/10 text-accent"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.8 2.8-2-2 2.8-2.8z"/></svg>
                {{ m.toolUsed }}
              </span>
            </div>
          </div>

          <!-- ASSISTANT (degraded / circuit OPEN) -->
          <div *ngIf="m.kind === 'degraded'" class="mr-auto max-w-[80%]">
            <div
              class="flex items-start gap-2 rounded-2xl rounded-bl-sm border border-amber-500/60 bg-amber-500/10 px-4 py-2.5 text-sm leading-relaxed text-amber-100"
            >
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <span>{{ m.text }}</span>
            </div>
            <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                class="badge border-amber-500/50 bg-amber-500/10 text-amber-300"
              >
                {{ i18n.t().chat.degradedBadge }}
              </span>
            </div>
          </div>

          <!-- ERROR (401/429/502/400/network) -->
          <div *ngIf="m.kind === 'error'" class="mr-auto max-w-[80%]">
            <div
              class="flex items-start gap-2 rounded-2xl rounded-bl-sm border-l-4 border-rose-500 border-y border-r border-y-rose-500/30 border-r-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm leading-relaxed text-rose-100"
            >
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <span>{{ m.text }}</span>
            </div>
          </div>
        </div>

        <!-- typing indicator -->
        <div *ngIf="loading()" class="mr-auto max-w-[80%]">
          <div
            class="inline-flex items-center gap-1.5 rounded-lg rounded-bl-sm border border-edge bg-base/70 px-4 py-3"
          >
            <span class="typing-dot h-2 w-2 rounded-full bg-slate-400"></span>
            <span class="typing-dot h-2 w-2 rounded-full bg-slate-400"></span>
            <span class="typing-dot h-2 w-2 rounded-full bg-slate-400"></span>
          </div>
        </div>
      </div>

      <!-- Composer -->
      <div class="border-t border-edge p-4">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <input
              type="text"
              [ngModel]="prompt()"
              (ngModelChange)="prompt.set($event)"
              (keydown.enter)="onEnter($event)"
              [disabled]="loading()"
              [placeholder]="i18n.t().chat.placeholder"
              class="w-full rounded-lg border border-edge bg-base px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-accent/70 focus:ring-1 focus:ring-accent/40 disabled:opacity-50"
            />
            <p *ngIf="showEmptyError()" class="mt-1.5 text-xs text-rose-400">
              {{ i18n.t().chat.emptyPromptError }}
            </p>
          </div>

          <button
            type="button"
            (click)="send()"
            [disabled]="!canSend()"
            class="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-base shadow-[0_0_16px_rgba(74,222,128,0.4)] transition-all hover:bg-accent-dim hover:shadow-[0_0_22px_rgba(74,222,128,0.55)] disabled:cursor-not-allowed disabled:border-edge disabled:bg-slate-800/60 disabled:text-slate-500 disabled:shadow-none"
          >
            {{ i18n.t().chat.send }}
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 14 0"/><path d="m13 6 6 6-6 6"/></svg>
          </button>
        </div>

        <!-- maxTokens (subtle) -->
        <div class="mt-2.5 flex items-center gap-2">
          <label
            for="maxTokens"
            class="font-mono text-[10px] uppercase tracking-widest text-slate-600"
          >
            {{ i18n.t().chat.maxTokensLabel }}
          </label>
          <input
            id="maxTokens"
            type="number"
            min="1"
            [(ngModel)]="maxTokens"
            [disabled]="loading()"
            class="w-20 rounded-md border border-edge bg-base px-2 py-1 font-mono text-xs text-slate-300 outline-none focus:border-slate-500 disabled:opacity-50"
          />
        </div>

        <!-- Quick examples -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            *ngFor="let ex of i18n.t().chat.examples; let idx = index"
            type="button"
            (click)="runExample(ex.prompt)"
            [disabled]="loading()"
            class="group inline-flex items-center gap-1.5 rounded-full border border-edge bg-base px-3 py-1.5 text-xs text-slate-300 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/5 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <span class="text-slate-500 transition-colors group-hover:text-accent">
              <svg
                *ngIf="icons[idx] === 'brain'"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A2.5 2.5 0 0 0 9 18a3 3 0 0 0 3 1 3 3 0 0 0 3-1 2.5 2.5 0 0 0 2-4.8A3 3 0 0 0 15 8a3 3 0 0 0-3-3z"/>
                <path d="M12 5v14"/>
              </svg>
              <svg
                *ngIf="icons[idx] === 'cloud'"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A3.5 3.5 0 0 0 6.5 19z"/>
              </svg>
              <svg
                *ngIf="icons[idx] === 'gear'"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>
              </svg>
            </span>
            {{ ex.label }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        border-radius: 9999px;
        border: 1px solid #232c39;
        background: #07090d;
        padding: 0.15rem 0.55rem;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        line-height: 1.2;
      }
    `,
  ],
})
export class ChatPanelComponent {
  private gateway = inject(GatewayService);
  i18n = inject(I18nService);

  @ViewChild('scroll') private scrollRef?: ElementRef<HTMLDivElement>;

  prompt = signal('');
  maxTokens = 256;

  loading = signal(false);
  showEmptyError = signal(false);
  messages = signal<ChatMessage[]>([]);
  private nextId = 1;

  icons = EXAMPLE_ICONS;

  canSend = computed(() => !this.loading() && this.prompt().trim().length > 0);

  onEnter(event: Event): void {
    const e = event as KeyboardEvent;
    // Respect IME composition (CJK) and Safari's 229 keyCode quirk.
    if (e.isComposing || (e as unknown as { keyCode: number }).keyCode === 229) {
      return;
    }
    e.preventDefault();
    this.send();
  }

  runExample(prompt: string): void {
    if (this.loading()) return;
    this.prompt.set(prompt);
    this.send();
  }

  send(): void {
    const text = this.prompt().trim();

    // Client-side guard against the 400 empty-body validation error.
    if (text.length === 0) {
      this.showEmptyError.set(true);
      return;
    }
    this.showEmptyError.set(false);

    this.pushMessage({ kind: 'user', text });
    this.prompt.set('');
    this.loading.set(true);
    this.scrollToBottom();

    const maxTokens =
      Number.isFinite(this.maxTokens) && this.maxTokens > 0
        ? Math.floor(this.maxTokens)
        : 256;

    this.gateway.chat({ prompt: text, maxTokens }).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Detect the degraded fallback by exact-string comparison.
        if (res.text === DEGRADED_TEXT) {
          this.pushMessage({ kind: 'degraded', text: res.text });
        } else {
          this.pushMessage({
            kind: 'assistant',
            text: res.text,
            latencyMs: res.latencyMs,
            usage: res.usage,
            toolUsed: res.toolUsed,
          });
        }
        this.scrollToBottom();
      },
      error: (fail: ChatFailure) => {
        this.loading.set(false);
        this.pushMessage({ kind: 'error', text: fail.message });
        this.scrollToBottom();
      },
    });
  }

  private pushMessage(m: Omit<ChatMessage, 'id'>): void {
    this.messages.update((list) => [...list, { ...m, id: this.nextId++ }]);
  }

  private scrollToBottom(): void {
    // Defer until the DOM updates.
    setTimeout(() => {
      const el = this.scrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
