import { buildArticleDataPrompt, getArticleSystemPrompt, parseArticleResponse } from './article-wizard.utils';

describe('getArticleSystemPrompt', () => {
  it('returns the fixed persona prompt', () => {
    expect(getArticleSystemPrompt()).toContain('social media content creator');
  });
});

describe('buildArticleDataPrompt', () => {
  it('lists a placeholder when there are no done topics yet', () => {
    const prompt = buildArticleDataPrompt([]);
    expect(prompt).toContain('<done_topics>\n(none yet)\n</done_topics>');
  });

  it('substitutes the given titles into <done_topics>', () => {
    const prompt = buildArticleDataPrompt(['Capsule Wardrobes 101', 'Thrifting Like a Pro']);
    expect(prompt).toContain('<done_topics>\nCapsule Wardrobes 101\nThrifting Like a Pro\n</done_topics>');
  });

  it('keeps the response format contract intact', () => {
    const prompt = buildArticleDataPrompt([]);
    expect(prompt).toContain('[Article title]\n\n[Summary]\n\n[Content]');
  });
});

describe('parseArticleResponse', () => {
  it('rejects an empty response', () => {
    const result = parseArticleResponse('   ');
    expect(result.draft).toBeNull();
    expect(result.errors).toEqual(["Paste the AI's response first."]);
  });

  it('rejects a response with fewer than 3 blocks', () => {
    const result = parseArticleResponse('Just a title\n\nJust a summary');
    expect(result.draft).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('parses title, summary, and multi-paragraph content', () => {
    const raw = [
      'The Psychology Behind the Colors We Wear',
      '',
      'Ever wonder why black feels powerful and yellow feels fun? Color choice says more than you think.',
      '',
      '## Why Color Matters',
      '',
      'Colors trigger real emotional responses.',
      '',
      '## Quick Reference',
      '',
      '| Color | Feeling |',
      '| --- | --- |',
      '| Red | Energy |',
      '| Blue | Calm |',
    ].join('\n');

    const result = parseArticleResponse(raw);

    expect(result.errors).toEqual([]);
    expect(result.draft).not.toBeNull();
    expect(result.draft?.title).toBe('The Psychology Behind the Colors We Wear');
    expect(result.draft?.summary).toBe(
      'Ever wonder why black feels powerful and yellow feels fun? Color choice says more than you think.',
    );
    expect(result.draft?.content).toContain('## Why Color Matters');
    expect(result.draft?.content).toContain('| Red | Energy |');
  });

  it('strips a markdown heading marker from the title', () => {
    const raw = '# Loud Prints, Quiet Confidence\n\nA short teaser.\n\nBody text here.';
    const result = parseArticleResponse(raw);
    expect(result.draft?.title).toBe('Loud Prints, Quiet Confidence');
  });

  it('strips bold-wrapping from the title', () => {
    const raw = '**Loud Prints, Quiet Confidence**\n\nA short teaser.\n\nBody text here.';
    const result = parseArticleResponse(raw);
    expect(result.draft?.title).toBe('Loud Prints, Quiet Confidence');
  });
});
