import { Injectable, computed, signal } from '@angular/core';
import { Locale, LOCALES, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'llm-gateway-dashboard.locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  locale = signal<Locale>(this.readInitialLocale());
  t = computed(() => TRANSLATIONS[this.locale()]);

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    localStorage.setItem(STORAGE_KEY, locale);
  }

  private readInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) {
      return stored;
    }
    return 'en';
  }
}
