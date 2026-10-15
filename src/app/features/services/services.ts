import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ServiceDto } from '@shared/data-transfer-objects/service.dto';
import { ServicesService } from '@core/services/services.service';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SeoService } from '@core/services/seo-service';

@Component({
  selector: 'app-services',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit {
  servicesService = inject(ServicesService);
  services$: WritableSignal<ServiceDto[]> = signal([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  slug?: string;
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    const pageTitle =
      'Családfakutatás árak és szolgáltatások | Gyökereim';

    const description =
      'Ismerje meg családfakutatási szolgáltatásaimat és áraimat! Kutatás 5, 6 vagy 7 generációig, felmenők feltárása és családtörténeti kutatás.';

    const canonicalUrl =
      'https://gyokereim.hu/szolgaltatasaim';

    this.seoService.setCanonical(canonicalUrl);

    this.title.setTitle(pageTitle);

    this.meta.updateTag({
      name: 'description',
      content: description
    });

    this.meta.updateTag({
      property: 'og:title',
      content: pageTitle
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description
    });

    this.meta.updateTag({
      property: 'og:url',
      content: canonicalUrl
    });

    this.servicesService.getServices().subscribe({
      next: (data: ServiceDto[] | undefined) => {
        this.services$.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Nem sikerült betölteni a szolgáltatásokat.');
        this.isLoading.set(false);
      },
    });
  }
}
