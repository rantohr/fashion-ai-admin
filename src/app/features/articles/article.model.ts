export const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

// Independent from outfits - no relation to any other table.
export interface Article {
  id: string;
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
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: ArticleStatus;
  publishedAt?: string;
}
