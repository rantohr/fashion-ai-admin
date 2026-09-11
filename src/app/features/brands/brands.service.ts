import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-config';
import type { Brand, BrandPayload } from './brand.model';

@Injectable({ providedIn: 'root' })
export class BrandsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/brands`;

  list() {
    return this.http.get<Brand[]>(this.baseUrl);
  }

  get(id: string) {
    return this.http.get<Brand>(`${this.baseUrl}/${id}`);
  }

  create(payload: BrandPayload) {
    return this.http.post<Brand>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<BrandPayload>) {
    return this.http.patch<Brand>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
