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


  constructor() {
    this.title.setTitle('Szolgáltatásaim - Bánfi Zoltán Csaba családfakutató | Gyökereim');
    this.meta.updateTag({
      name: 'description',
      content: 'Bánfi Zoltán Csaba családfakutató, a Gyökereim blog szerzője. Családfakutatás, genealógia, családtörténet, családi örökség és hagyományok. Fedezze fel a szolgáltatásait és ismerje meg a gyökereit!'
    });
    this.seoService.setCanonical(
      'https://gyokereim.hu/szolgaltatasaim'
    );
  }

  ngOnInit(): void {

  
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
