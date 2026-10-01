import { Component, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BlogService } from '@core/services/blog.service';
import { SeoService } from '@core/services/seo-service';
import { ServicesService } from '@core/services/services.service';
import { WebSettingsService } from '@core/services/web-settings.service';
import { PostItemDto } from '@shared/data-transfer-objects/post-item.dto';
import { ServiceDto } from '@shared/data-transfer-objects/service.dto';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  webSetting = inject(WebSettingsService);
  blogService = inject(BlogService);
  
  servicesService = inject(ServicesService);
  services$: WritableSignal<ServiceDto[]> = signal([]);
  serviceIsLoading = signal(true);
  protected readonly aboutImageUrl: Signal<string | undefined>;
  protected readonly aboutShortDescription: Signal<string | undefined>;
  posts$: WritableSignal<PostItemDto[]> = signal([]);
  postIsLoading = signal(true);
  error = signal<string | null>(null);
  private seoService = inject(SeoService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  
  constructor(webSetting: WebSettingsService, blogService: BlogService) {
    this.webSetting = webSetting;
    this.blogService = blogService;
    this.aboutImageUrl = toSignal(
      this.webSetting.getWebSettingString('introduce_image')
    );
    this.aboutShortDescription = toSignal(
      this.webSetting.getWebSettingString('introduce_short')
    );

  }


  ngOnInit(): void {

        this.seoService.setCanonical(
          'https://gyokereim.hu/kezdolap'
        );
        this.title.setTitle('Bánfi Zoltán Csaba családfakutató | Gyökereim kezdőlap');
        this.meta.updateTag({
          name: 'description',
          content: 'Bánfi Zoltán Csaba családfakutató, a Gyökereim blog szerzője. Családfakutatás, genealógia, családtörténet, családi örökség és hagyományok. Nézze meg a kezdőlapon az összefoglalót a szolgáltatásokról, a blogbejegyzésekről és a kapcsolatfelvételi lehetőségekről.'
        });
    
        this.blogService.getPostsForHome().subscribe({
        next: (data: PostItemDto[] | undefined) => {
          this.posts$.set(data ?? []);
          this.postIsLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.error.set('Nem sikerült betölteni a bejegyzéseket.');
          this.postIsLoading.set(false);
        },
      });

           this.servicesService.getServices().subscribe({
              next: (data: ServiceDto[] | undefined) => {
                this.services$.set(data ?? []);
                this.serviceIsLoading.set(false);
              },
              error: (error) => {
                console.error(error);
                this.error.set('Nem sikerült betölteni a szolgáltatásokat.');
                this.serviceIsLoading.set(false);
              },
            });
  }
}

