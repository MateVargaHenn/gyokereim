import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private document = inject(DOCUMENT);

  setCanonical(url: string): void {
    let link =
      this.document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');

      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}