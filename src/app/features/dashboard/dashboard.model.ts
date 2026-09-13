export interface CountBreakdown<T extends string> {
  status: T;
  count: number;
}

export interface SeasonBreakdown {
  season: string;
  count: number;
}

export interface TopBrand {
  id: string;
  name: string;
  slug: string;
  outfitCount: number;
}

export interface RecentOutfit {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface RecentArticle {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    brands: number;
    outfits: number;
    articles: number;
    users: number;
    scenarios: number;
  };
  outfitsByStatus: CountBreakdown<string>[];
  outfitsBySeason: SeasonBreakdown[];
  articlesByStatus: CountBreakdown<string>[];
  topBrands: TopBrand[];
  pricing: { min: number | null; max: number | null; avg: number | null };
  recentOutfits: RecentOutfit[];
  recentArticles: RecentArticle[];
}
