import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CookieManagement {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  set(
    name: string,
    value: string,
    maxAgeSeconds: number = 365 * 24 * 60 * 60
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const secure =
      this.document.location.protocol === 'https:'
        ? '; Secure'
        : '';

    this.document.cookie =
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
      `; Max-Age=${maxAgeSeconds}` +
      `; Path=/` +
      `; SameSite=Lax` +
      secure;
    }

    get(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const encodedName = `${encodeURIComponent(name)}=`;

    const cookie = this.document.cookie
      .split('; ')
      .find(item => item.startsWith(encodedName));

    return cookie
      ? decodeURIComponent(cookie.substring(encodedName.length))
      : null;
  }

  delete(name: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.cookie =
      `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}
