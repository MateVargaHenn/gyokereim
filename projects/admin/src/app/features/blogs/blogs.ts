import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PagedResult } from '../../shared/models/paged-result';
import { PostStatus } from '../../shared/enums/post-status';
import { RouterLink } from '@angular/router';
import { BlogService } from '@admincore/services/blog.service';
import { AdminPostItemDto } from '../../shared/data-transfer-objects/admin-post-item.dto';
@Component({
  selector: 'app-blogs',
  imports: [DatePipe, RouterLink],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {
  readonly PostStatus = PostStatus;
  private readonly blogService = inject(BlogService);

  posts = signal<PagedResult<AdminPostItemDto> | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPosts(1);
  }

  loadPosts(page: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.blogService.getPosts().subscribe({
      next: data => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: error => {
        console.error(error);

        this.error.set(
          'Nem sikerült betölteni a bejegyzéseket.'
        );

        this.isLoading.set(false);
      }
    });
  }

  getPageNumbers(totalPages: number): number[] {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  publishPost(id: number): void {
    this.blogService.publishPost(id).subscribe({
      next: () => {
        this.loadPosts(this.posts()?.page ?? 1);
      },

      error: error => {
        console.error(error);
        this.error.set(
          'Nem sikerült publikálni a bejegyzést.'
        );
      }
    });
  }

  movePostToDraft(id: number): void {
    this.blogService.movePostToDraft(id).subscribe({
      next: () => {
        this.loadPosts(this.posts()?.page ?? 1);
      },

      error: error => {
        console.error(error);
        this.error.set(
          'Nem sikerült piszkozatba helyezni a bejegyzést.'
        );
      }
    });
  }

  deletePost(
    id: number,
    title: string
  ): void {
    const confirmed = confirm(
      `Biztosan törölni szeretnéd ezt a bejegyzést?\n\n${title}`
    );

    if (!confirmed) {
      return;
    }

    this.blogService.deletePost(id).subscribe({
      next: () => {
        this.loadPosts(
          this.posts()?.page ?? 1
        );
      },

      error: error => {
        console.error(error);

        this.error.set(
          'Nem sikerült törölni a bejegyzést.'
        );
      }
    });
  }
}
