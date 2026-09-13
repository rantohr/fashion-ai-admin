import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-config';
import type { DashboardStats } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats() {
    return this.http.get<DashboardStats>(`${API_BASE_URL}/dashboard/stats`);
  }
}
