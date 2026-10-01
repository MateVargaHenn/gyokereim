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
    this.title.setTitle('Családfakutatás, családtörténet – Blog | Gyökereim');
    this.meta.updateTag({
      name: 'description',
      content: `Bánfi Zoltán Csaba családfakutató, a Gyökereim blog szerzője. Családfakutatás, genealógia, családtörténet, családi örökség és hagyományok. Fedezze fel a ${this.slug ?? ''} szolgáltatást és ismerje meg a gyökereit!`
    });
    this.seoService.setCanonical(
      `https://gyokereim.hu/szolgaltatasaim/${this.slug ?? ''}`
    );
    this.services.getServiceBySlug(this.slug ?? '').subscribe({
      next: (data: ServiceDto | undefined) => {
        this.service$.set(data);
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
