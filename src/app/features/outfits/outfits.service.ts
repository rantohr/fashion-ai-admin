import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-config';
import type { Outfit, OutfitPayload } from './outfit.model';

@Injectable({ providedIn: 'root' })
export class OutfitsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/outfits`;

  list() {
    return this.http.get<Outfit[]>(this.baseUrl);
  }

  get(id: string) {
    return this.http.get<Outfit>(`${this.baseUrl}/${id}`);
  }

  create(payload: OutfitPayload) {
    return this.http.post<Outfit>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<OutfitPayload>) {
    return this.http.patch<Outfit>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
