import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

@Injectable({
  providedIn: 'root',
})
export class Analytics {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly measurementId = 'G-NZLCX1SPR3';
  private started = false;

  start(): void {
    if (!isPlatformBrowser(this.platformId) || this.started) {
      return;
    }

    const win = this.document.defaultView as AnalyticsWindow | null;

    if (!win) {
      return;
    }

    this.started = true;

    const dataLayer = win.dataLayer ??= [];

    win.gtag ??= function (..._args: unknown[]): void {
      dataLayer.push(arguments);
    };

    win.gtag('js', new Date());
    win.gtag('config', this.measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = this.document.createElement('script');
    script.async = true;
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(this.measurementId);

    this.document.head.appendChild(script);
  }

  stop(): void {
    if (!isPlatformBrowser(this.platformId) || !this.started) {
      return;
    }

    const win = this.document.defaultView;

    if (!win) {
      return;
    }

    // Az újabb mérési események letiltása.
    Reflect.set(win, `ga-disable-${this.measurementId}`, true);

    // Újratöltés után az elmentett elutasítás miatt
    // már nem töltjük be az Analytics kódját.
    win.location.reload();
  }
}