export const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export interface Article {
  id: string;
  outfitId: string;
  outfit?: { id: string; name: string; slug: string };
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlePayload {
  outfitId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: ArticleStatus;
  publishedAt?: string;
}
