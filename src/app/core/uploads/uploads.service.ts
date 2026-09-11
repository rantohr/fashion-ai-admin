import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../api-config';

export interface UploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);

  // Angular's HttpClient sets the multipart Content-Type (with boundary)
  // automatically for a FormData body - don't set it manually here.
  upload(blob: Blob, filename: string) {
    const formData = new FormData();
    formData.append('file', blob, filename);
    return this.http.post<UploadResponse>(`${API_BASE_URL}/uploads`, formData);
  }
}
