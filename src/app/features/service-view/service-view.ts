import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServicesService } from '@core/services/services.service';
import { ServiceDto } from '@shared/data-transfer-objects/service.dto';
import { DecimalPipe } from '@angular/common';
import { SeoService } from '@core/services/seo-service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-service-view',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './service-view.html',
  styleUrl: './service-view.css',
})
export class ServiceView implements OnInit {
  private route = inject(ActivatedRoute);
  services = inject(ServicesService);
  service$: WritableSignal<ServiceDto | undefined> = signal(undefined);
  slug?: string;
  isLoading = signal(true);
  error = signal<string | null>(null);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private seoService = inject(SeoService);


 ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? undefined;

    if (!this.slug) {
      this.error.set('Érvénytelen szolgáltatás URL.');
      this.isLoading.set(false);
      return;
    }

    const canonicalUrl =
      `https://gyokereim.hu/szolgaltatasaim/${this.slug}`;

    this.seoService.setCanonical(canonicalUrl);

    this.services.getServiceBySlug(this.slug).subscribe({
      next: (data: ServiceDto | undefined) => {
        if (!data) {
          this.error.set('A szolgáltatás nem található.');
          this.isLoading.set(false);
          return;
        }

        this.service$.set(data);

        const pageTitle = `${data.name} | Gyökereim`;

        const description =
          `Ismerje meg a(z) ${data.name} szolgáltatást! ` +
          `Bánfi Zoltán Csaba családfakutató segítségével ` +
          `fedezze fel családja történetét és felmenőit.`;

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

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching service details:', error);
        this.error.set('Nem sikerült betölteni a szolgáltatást.');
        this.isLoading.set(false);
      },
    });
  }
}
