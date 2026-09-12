export interface ParsedArticleDraft {
  title: string;
  summary: string;
  content: string;
}

export interface ArticleParseResult {
  draft: ParsedArticleDraft | null;
  errors: string[];
}

// Persona/system prompt for whatever external AI tool generates the
// article - pasted into that tool's system-role field, separate from the
// per-run generation prompt below.
const SYSTEM_PROMPT = `Respond as a profesionnal social media content creator. Give simple words and human-like response and avoid AI response style. Be as creative and random as possible when brainstorming ideas.`;

export function getArticleSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

// Builds the per-run generation prompt, substituting the running list of
// already-published article titles into <done_topics> so the AI doesn't
// repeat a topic.
export function buildArticleDataPrompt(doneTopics: string[]): string {
  const doneTopicsBlock = doneTopics.length > 0 ? doneTopics.join('\n') : '(none yet)';

  return `Generate an article about fashion.

Guidlines:
- The article must be around 300 words
- Do not include any images
- Write the article in a .md format
- Include tables, list, or charts if needed

Follow these steps:
1. Analyse which topic attract people's mind without including topics that already done
2. Generate a short summary or teaser of the article's content
3. Plan the list of sections and subsections
4. Generate the content for each section
5. Return the data as a plain md format

Here are the list of done topics:
<done_topics>
${doneTopicsBlock}
</done_topics>

Format the response respecting this order:
<response_format>
[Article title]

[Summary]

[Content]
</response_format>

Here are some examples of topics:
<ideal_topic_example>
The Psychology Behind the Colors We Wear
</ideal_topic_example>`;
}

function stripTitleMarkup(raw: string): string {
  return raw
    .trim()
    .replace(/^#{1,6}\s*/, '')
    .replace(/^\*\*(.+)\*\*$/, '$1')
    .trim();
}

// Parses the <response_format> contract: title, blank line, summary, blank
// line, content - everything after the second blank-line boundary is
// content verbatim (it may itself contain blank lines, tables, lists).
export function parseArticleResponse(raw: string): ArticleParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { draft: null, errors: ["Paste the AI's response first."] };
  }

  const blocks = trimmed.split(/\n{2,}/);
  if (blocks.length < 3) {
    return {
      draft: null,
      errors: ['Expected a title, a summary, and content, each separated by a blank line.'],
    };
  }

  const title = stripTitleMarkup(blocks[0]);
  const summary = blocks[1].trim();
  const content = blocks.slice(2).join('\n\n').trim();

  const errors: string[] = [];
  if (!title) {
    errors.push('Could not find the article title.');
  }
  if (!summary) {
    errors.push('Could not find the summary.');
  }
  if (!content) {
    errors.push('Could not find the article content.');
  }

  if (errors.length > 0) {
    return { draft: null, errors };
  }

  return { draft: { title, summary, content }, errors: [] };
}
