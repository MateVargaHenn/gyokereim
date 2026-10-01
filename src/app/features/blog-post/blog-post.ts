import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import type { PostDetailsDto } from '@shared/data-transfer-objects/post-details.dto';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';

import { BlogService } from '@core/services/blog.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-blog-post',
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-post.html',
  styleUrl: './blog-post.css',
})
export class BlogPost {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  protected readonly linkCopied = signal(false);

  protected readonly post$ = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug')),
      filter((slug): slug is string => slug !== null),
      switchMap(slug => this.blogService.getPost(slug))
    )
  );
  
  constructor() {
    effect(() => {
      const post = this.post$();

      if (!post) {
        return;
      }

      const url = `https://gyokereim.hu/blog/${post.slug}`;

      this.title.setTitle(
        `${post.metaTitle || post.title} | Gyökereim`
      );

      this.meta.updateTag({
        name: 'description',
        content: post.summary
      });

      this.meta.updateTag({
        property: 'og:title',
        content: post.metaTitle || post.title
      });

      this.meta.updateTag({
        property: 'og:description',
        content: post.summary
      });

      this.meta.updateTag({
        property: 'og:url',
        content: url
      });

      this.meta.updateTag({
        property: 'og:type',
        content: 'article'
      });

      this.meta.updateTag({
        property: 'og:site_name',
        content: 'Gyökereim'
      });
    });
  }

  protected async sharePost(post: PostDetailsDto) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.summary,
        url
      });
    }
  }

  protected shareOnFacebook(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  protected shareOnLinkedIn(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  protected async copyLink(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await navigator.clipboard.writeText(
      window.location.href
    );
    this.linkCopied.set(true);

    setTimeout(() => {
      this.linkCopied.set(false);
    }, 2000);
  }
}
