import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { WebSettingsService } from '@core/services/web-settings.service';
import { WebSettingDto } from '@shared/data-transfer-objects/web-setting.dto';
import { SeoService } from '@core/services/seo-service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {

  webSettings = inject(WebSettingsService);
  webSettings$: WritableSignal<WebSettingDto | undefined> = signal(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);
  imageUrl = signal<string | undefined>(undefined);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private seoService = inject(SeoService);

  constructor() {
    this.title.setTitle('Bánfi Zoltán Csaba családfakutató | Gyökereim');
    this.meta.updateTag({
      name: 'description',
      content: 'Ismerje meg Bánfi Zoltán Csaba családfakutatót és történészt, kutatási szemléletét, valamint anyakönyvi, levéltári és történeti forrásokra épülő munkáját.'
    });
    this.seoService.setCanonical(
      'https://gyokereim.hu/rolam'
    );
  }
  
  ngOnInit(): void {
    this.webSettings.getWebSetting('introduce').subscribe({
      next: (data) => {
        this.webSettings$.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set(error.message);
      },
    });

    this.webSettings.getWebSetting('introduce_image').subscribe({
      next: (data) => {
        this.imageUrl.set(data?.value);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
