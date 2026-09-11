export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandPayload {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}
