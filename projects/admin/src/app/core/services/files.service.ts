import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Api } from './api/api';
import { AdminFileItemDto } from '../../shared/data-transfer-objects/admin-file-item.dto';
import { UploadFileResponseDto } from '../../shared/data-transfer-objects/upload-file-response.dto';

@Injectable({
  providedIn: 'root'
})
export class FilesService extends Api {

  private readonly http = inject(HttpClient);

  getFiles(): Observable<AdminFileItemDto[]> {
    return this.get<AdminFileItemDto[]>(
      'files/admin'
    );
  }

  uploadFile(
    file: File
  ): Observable<UploadFileResponseDto> {
    const formData = new FormData();

    formData.append(
      'file',
      file,
      file.name
    );

    return this.post<UploadFileResponseDto>(
      'files/admin',
      formData
    );
  }

  getAdminFile(
    id: number
  ): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/files/admin/${id}`,
      {
        responseType: 'blob'
      }
    );
  }

  publishFile(
    id: number
  ): Observable<void> {
    return this.put<void>(
      `files/admin/${id}/publish`,
      null
    );
  }

  unpublishFile(
    id: number
  ): Observable<void> {
    return this.put<void>(
      `files/admin/${id}/unpublish`,
      null
    );
  }

  updateMetadata(
  id: number,
  dto: {
    title: string | null;
    altText: string | null;
  }
    ): Observable<void> {
    return this.put<void>(
        `files/admin/${id}`,
        dto
    );
    }
    getPublicFileUrl(
  key: string
): string {
  const apiUrl =
    environment.apiUrl.replace(/\/$/, '');

  return `${apiUrl}/files/${encodeURIComponent(key)}`;
}
}