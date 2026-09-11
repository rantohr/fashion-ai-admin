import { parseOutfitDrafts, slugify, withUniqueSlugs } from './outfit-wizard.utils';

function validOutfit(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Midnight Trench',
    category: 'outerwear',
    price: 199.99,
    description: 'A sharp trench coat.',
    tags: ['coat', 'formal'],
    season: 'FALL',
    ...overrides,
  };
}

function tenOf(item: Record<string, unknown>) {
  return Array.from({ length: 10 }, (_, i) => ({ ...item, name: `${item['name']} ${i + 1}` }));
}

describe('slugify', () => {
  it('lowercases, dashes, and trims', () => {
    expect(slugify('  Midnight Trench!! Coat  ')).toBe('midnight-trench-coat');
  });

  it('collapses repeated separators', () => {
    expect(slugify('a---b__c')).toBe('a-b-c');
  });
});

describe('withUniqueSlugs', () => {
  it('leaves distinct names alone', () => {
    expect(withUniqueSlugs(['Red Coat', 'Blue Coat'])).toEqual(['red-coat', 'blue-coat']);
  });

  it('disambiguates duplicate names within the same batch', () => {
    expect(withUniqueSlugs(['Red Coat', 'Red Coat', 'Red Coat'])).toEqual([
      'red-coat',
      'red-coat-2',
      'red-coat-3',
    ]);
  });

  it('falls back to a non-empty slug for a name with no alphanumerics', () => {
    expect(withUniqueSlugs(['!!!'])).toEqual(['outfit']);
  });
});

describe('parseOutfitDrafts', () => {
  it('rejects invalid JSON', () => {
    const result = parseOutfitDrafts('not json');
    expect(result.outfits).toEqual([]);
    expect(result.errors).toEqual(['That is not valid JSON.']);
  });

  it('rejects a non-array payload', () => {
    const result = parseOutfitDrafts(JSON.stringify({ not: 'an array' }));
    expect(result.errors).toEqual(['Expected a JSON array of outfits.']);
  });

  it('rejects the wrong count', () => {
    const result = parseOutfitDrafts(JSON.stringify([validOutfit()]));
    expect(result.errors).toEqual(['Expected exactly 10 outfits, got 1.']);
  });

  it('accepts exactly 10 well-formed outfits and normalizes optional fields', () => {
    const raw = JSON.stringify(tenOf(validOutfit({ tags: undefined, season: undefined })));
    const result = parseOutfitDrafts(raw);

    expect(result.errors).toEqual([]);
    expect(result.outfits).toHaveLength(10);
    expect(result.outfits[0]).toEqual({
      name: 'Midnight Trench 1',
      category: 'outerwear',
      price: 199.99,
      description: 'A sharp trench coat.',
      tags: [],
      season: 'ALL_SEASON',
    });
  });

  it('collects one error per invalid item and reports none of the outfits', () => {
    const items = tenOf(validOutfit());
    items[3] = validOutfit({ price: -5 });
    items[7] = validOutfit({ name: '' });

    const result = parseOutfitDrafts(JSON.stringify(items));

    expect(result.outfits).toEqual([]);
    expect(result.errors).toEqual([
      'Outfit 4: "price" must be a positive number.',
      'Outfit 8: "name" is required.',
    ]);
  });

  it('ignores an unrecognized season and falls back to ALL_SEASON', () => {
    const items = tenOf(validOutfit({ season: 'MONSOON' }));
    const result = parseOutfitDrafts(JSON.stringify(items));

    expect(result.errors).toEqual([]);
    expect(result.outfits.every((o) => o.season === 'ALL_SEASON')).toBe(true);
  });
});
