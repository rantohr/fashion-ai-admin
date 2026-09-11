export const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'] as const;
export type Season = (typeof SEASONS)[number];

export const OUTFIT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type OutfitStatus = (typeof OUTFIT_STATUSES)[number];

export interface Outfit {
  id: string;
  brandId: string;
  brand?: { id: string; name: string; slug: string };
  name: string;
  slug: string;
  category: string;
  // Prisma's Decimal serializes to a string over JSON.
  price: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  season: Season;
  status: OutfitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitPayload {
  brandId: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  season?: Season;
  status?: OutfitStatus;
}
