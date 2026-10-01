import { Injectable } from '@angular/core';
import { Api } from './api/api';
import { Observable } from 'rxjs';
import { PostItemDto } from '@shared/data-transfer-objects/post-item.dto';
import { PostDetailsDto } from '@shared/data-transfer-objects/post-details.dto';
import { PagedResult } from '@models/paged-result';

@Injectable({
  providedIn: 'root',
})
export class BlogService extends Api {
  

  getPosts(page:number): Observable<PagedResult<PostItemDto>> {
    return this.get<PagedResult<PostItemDto>>(`blog/posts/${page}`);
  }

  getPostsForHome(): Observable<PostItemDto[]> {
    return this.get<PostItemDto[]>('blog/posts-for-home');
  }

  getPost(slug: string): Observable<PostDetailsDto> {
    return this.get<PostDetailsDto>(`blog/posts/${slug}`);
  }
}
