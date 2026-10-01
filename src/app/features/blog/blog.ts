import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '@core/services/seo-service';
import { BlogService } from '@core/services/blog.service';
import { PostItemDto } from '@shared/data-transfer-objects/post-item.dto';
import { Meta, Title } from '@angular/platform-browser';
import { PagedResult } from '@models/paged-result';

@Component({
  selector: 'app-blog',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {
  blogService = inject(BlogService);
  posts$: WritableSignal<PagedResult<PostItemDto> | null> = signal(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  slug?: string;
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private seoService = inject(SeoService);

    constructor() {
      this.title.setTitle('Családfakutatás, családtörténet – Blog | Gyökereim');
      this.meta.updateTag({
        name: 'description',
        content: 'Bánfi Zoltán Csaba családfakutató, a Gyökereim blog szerzője. Családfakutatás, genealógia, családtörténet, családi örökség és hagyományok.'
      });
      this.seoService.setCanonical(
        'https://gyokereim.hu/blog'
      );
    }

    ngOnInit(): void {
      this.route.queryParamMap.subscribe(params => {
        const page = Number(params.get('page') ?? 1);

        this.blogService.getPosts(page).subscribe({
          next: (data: PagedResult<PostItemDto> | undefined) => {
            this.posts$.set(data ?? null);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.error.set('Nem sikerült betölteni a bejegyzéseket.');
            this.isLoading.set(false);
          },
        });
      });
  }

  getPageNumbers(totalPages: number): number[] {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }
}