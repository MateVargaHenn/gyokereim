import {
  afterNextRender,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Analytics } from '@core/services/analytics.service';
import { CookieManagement } from '@core/services/cookie-management';

@Component({
  selector: 'app-cookie-panel',
  imports: [RouterLink],
  templateUrl: './cookie-panel.html',
  styleUrl: './cookie-panel.css',
})
export class CookiePanel {
  private readonly cookie = inject(CookieManagement);
  private readonly analytics = inject(Analytics);

  private readonly consentKey = 'analytics_consent_v1';

  readonly visible = signal(false);

  constructor() {
    afterNextRender(() => {
      const consent = this.cookie.get(this.consentKey);

      this.visible.set(consent !== 'true' && consent !== 'false');

      if (consent === 'true') {
        this.analytics.start();
      }
    });
  }

  acceptCookies(): void {
    this.cookie.set(this.consentKey, 'true');
    this.visible.set(false);
    this.analytics.start();
  }

  declineCookies(): void {
    this.cookie.set(this.consentKey, 'false');
    this.visible.set(false);
    this.analytics.stop();
  }

  openSettings(): void {
    this.visible.set(true);
  }
}