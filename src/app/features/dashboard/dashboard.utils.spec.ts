import { titleCase, toRankBars, toShareBars } from './dashboard.utils';

describe('titleCase', () => {
  it('title-cases a single word', () => {
    expect(titleCase('DRAFT')).toBe('Draft');
  });

  it('splits and title-cases an underscored value', () => {
    expect(titleCase('ALL_SEASON')).toBe('All Season');
  });
});

describe('toShareBars', () => {
  it('computes each item as a percentage of the group total', () => {
    const bars = toShareBars([
      { label: 'Draft', count: 3 },
      { label: 'Published', count: 1 },
    ]);

    expect(bars).toEqual([
      { label: 'Draft', count: 3, pct: 75 },
      { label: 'Published', count: 1, pct: 25 },
    ]);
  });

  it('returns 0% for every item when the total is 0', () => {
    const bars = toShareBars([
      { label: 'Draft', count: 0 },
      { label: 'Published', count: 0 },
    ]);

    expect(bars.every((bar) => bar.pct === 0)).toBe(true);
  });
});

describe('toRankBars', () => {
  it('scales each item relative to the highest count', () => {
    const bars = toRankBars([
      { label: 'Acme', count: 10 },
      { label: 'Zenith', count: 5 },
      { label: 'Nova', count: 2 },
    ]);

    expect(bars).toEqual([
      { label: 'Acme', count: 10, pct: 100 },
      { label: 'Zenith', count: 5, pct: 50 },
      { label: 'Nova', count: 2, pct: 20 },
    ]);
  });

  it('returns 0% for an empty list', () => {
    expect(toRankBars([])).toEqual([]);
  });
});
