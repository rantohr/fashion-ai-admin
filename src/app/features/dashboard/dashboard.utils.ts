export interface LabeledCount {
  label: string;
  count: number;
}

export interface BarItem extends LabeledCount {
  pct: number;
}

export interface RecentActivityItem {
  id: string;
  kind: 'outfit' | 'article';
  title: string;
  createdAt: string;
}

// "ALL_SEASON" -> "All Season", "DRAFT" -> "Draft".
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

// Percentage of the group's own total - for breakdowns that partition one
// whole set, where every item has exactly one status/season (so the bars
// should read as "60% of outfits are Draft", summing to 100%).
export function toShareBars(items: LabeledCount[]): BarItem[] {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return items.map((item) => ({ ...item, pct: total > 0 ? Math.round((item.count / total) * 100) : 0 }));
}

// Percentage of the highest count - for rankings that don't partition a
// whole (e.g. top brands by outfit count), where the bars should read
// relative to the leader rather than summing to 100%.
export function toRankBars(items: LabeledCount[]): BarItem[] {
  const max = items.reduce((highest, item) => Math.max(highest, item.count), 0);
  return items.map((item) => ({ ...item, pct: max > 0 ? Math.round((item.count / max) * 100) : 0 }));
}

// Merges the two "recent" lists into one feed ordered by creation date
// (newest first) instead of always showing every outfit before every
// article.
export function toRecentActivity(
  outfits: { id: string; name: string; createdAt: string }[],
  articles: { id: string; title: string; createdAt: string }[],
): RecentActivityItem[] {
  const items: RecentActivityItem[] = [
    ...outfits.map((outfit) => ({ id: outfit.id, kind: 'outfit' as const, title: outfit.name, createdAt: outfit.createdAt })),
    ...articles.map((article) => ({
      id: article.id,
      kind: 'article' as const,
      title: article.title,
      createdAt: article.createdAt,
    })),
  ];
  return items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
