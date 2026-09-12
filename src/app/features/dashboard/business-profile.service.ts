import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-config';
import type { BusinessProfile, BusinessProfilePayload } from './business-profile.model';

// Singleton resource - GET returns the one row (upserting it into
// existence on the API side if it's missing), PATCH updates it. No
// list/detail screen: this is edited from a single form on the Dashboard.
@Injectable({ providedIn: 'root' })
export class BusinessProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/business-profile`;

  get() {
    return this.http.get<BusinessProfile>(this.baseUrl);
  }

  update(payload: BusinessProfilePayload) {
    return this.http.patch<BusinessProfile>(this.baseUrl, payload);
  }
}
