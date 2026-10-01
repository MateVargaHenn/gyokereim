import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { PagedResult } from '../../shared/models/paged-result';
import { CreatePostDetailsDto } from '../../shared/data-transfer-objects/create-post-details.dto';
import { PostDetailsDto } from '../../shared/data-transfer-objects/post-details.dto';
import { AdminPostItemDto } from '../../shared/data-transfer-objects/admin-post-item.dto';
import { Api } from './api/api';

@Injectable({
  providedIn: 'root'
})
export class BlogService extends Api{
  private readonly http = inject(HttpClient);

  createPost(
    dto: CreatePostDetailsDto
  ): Observable<void> {
    return this.post<void>(
      'blog/admin/post',
      dto
    );
  }

  getPost(id: number): Observable<PostDetailsDto> {
  return this.get<PostDetailsDto>(
    `blog/admin/post/${id}`
  );
}

updatePost(
  id: number,
  dto: CreatePostDetailsDto
): Observable<void> {
  return this.put<void>(
    `blog/admin/post/${id}`,
    dto
  );
}

  getPosts(page: number = 1): Observable<PagedResult<AdminPostItemDto>> {
    return this.get<PagedResult<AdminPostItemDto>>(
      `blog/admin/posts/${page}`
    );
  }

  publishPost(id: number): Observable<void> {
    return this.put<void>(
      `blog/admin/post/${id}/publish`,
      null
    );
  }

  movePostToDraft(id: number): Observable<void> {
    return this.put<void>(
      `blog/admin/post/${id}/draft`,
      null
    );
  }

  deletePost(id: number): Observable<void> {
    return this.delete<void>(
      `admin/post/${id}`
    );
  }
}