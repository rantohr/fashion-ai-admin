import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-config';
import type { Article, ArticlePayload } from './article.model';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/articles`;

  list() {
    return this.http.get<Article[]>(this.baseUrl);
  }

  get(id: string) {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  create(payload: ArticlePayload) {
    return this.http.post<Article>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<ArticlePayload>) {
    return this.http.patch<Article>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
