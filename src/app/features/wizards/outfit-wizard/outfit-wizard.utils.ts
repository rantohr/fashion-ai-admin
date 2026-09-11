import { SEASONS, type Season } from '../../outfits/outfit.model';

export interface ParsedOutfitDraft {
  name: string;
  category: string;
  price: number;
  description: string;
  tags: string[];
  season: Season;
}

export interface ParseResult {
  outfits: ParsedOutfitDraft[];
  errors: string[];
}

export const OUTFIT_WIZARD_COUNT = 10;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// Guarantees unique, non-empty slugs within one batch (the API's unique
// constraint on Outfit.slug would otherwise roll back the whole
// transactional batch-create over a single collision - see outfits.controller.ts).
export function withUniqueSlugs(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const base = slugify(name) || 'outfit';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

// Validates the AI's pasted JSON response against the shape the wizard
// needs (see outfit-wizard.ts's dataPrompt) without pulling in a schema
// validation library for one call site.
export function parseOutfitDrafts(raw: string, expectedCount = OUTFIT_WIZARD_COUNT): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { outfits: [], errors: ['That is not valid JSON.'] };
  }

  if (!Array.isArray(data)) {
    return { outfits: [], errors: ['Expected a JSON array of outfits.'] };
  }

  if (data.length !== expectedCount) {
    return { outfits: [], errors: [`Expected exactly ${expectedCount} outfits, got ${data.length}.`] };
  }

  const errors: string[] = [];
  const outfits: ParsedOutfitDraft[] = [];

  data.forEach((item, index) => {
    const label = `Outfit ${index + 1}`;
    if (typeof item !== 'object' || item === null) {
      errors.push(`${label}: must be an object.`);
      return;
    }
    const record = item as Record<string, unknown>;

    const name = record['name'];
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push(`${label}: "name" is required.`);
      return;
    }

    const category = record['category'];
    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push(`${label}: "category" is required.`);
      return;
    }

    const price = record['price'];
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      errors.push(`${label}: "price" must be a positive number.`);
      return;
    }

    const description = typeof record['description'] === 'string' ? (record['description'] as string) : '';

    const tagsRaw = record['tags'];
    const tags = Array.isArray(tagsRaw) ? tagsRaw.filter((tag): tag is string => typeof tag === 'string') : [];

    const seasonRaw = record['season'];
    const season = (SEASONS as readonly string[]).includes(seasonRaw as string)
      ? (seasonRaw as Season)
      : 'ALL_SEASON';

    outfits.push({ name: name.trim(), category: category.trim(), price, description, tags, season });
  });

  if (errors.length > 0) {
    return { outfits: [], errors };
  }

  return { outfits, errors: [] };
}
