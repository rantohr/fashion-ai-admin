import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ARTICLE_STATUSES } from '../../articles/article.model';
import { ArticlesService } from '../../articles/articles.service';
import { slugify } from '../outfit-wizard/outfit-wizard.utils';
import { buildArticleDataPrompt, getArticleSystemPrompt, parseArticleResponse } from './article-wizard.utils';

type WizardStep = 1 | 2;

// No outfit relation (articles are independent, see CLAUDE.md) and no
// image step - unlike OutfitWizard, this is a 2-step flow: generate +
// parse one article, then review + create it.
@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-article-wizard',
  styleUrl: './article-wizard.scss',
  templateUrl: './article-wizard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleWizard {
  private readonly articlesService = inject(ArticlesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly statuses = ARTICLE_STATUSES;
  protected readonly systemPrompt = getArticleSystemPrompt();

  protected readonly step = signal<WizardStep>(1);
  protected readonly doneTopics = signal<string[]>([]);
  protected readonly dataPrompt = computed(() => buildArticleDataPrompt(this.doneTopics()));

  protected readonly rawResponse = signal('');
  protected readonly parseErrors = signal<string[]>([]);

  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly createdId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    excerpt: [''],
    content: ['', Validators.required],
    status: ['DRAFT' as (typeof ARTICLE_STATUSES)[number]],
  });

  constructor() {
    // Existing article titles become the <done_topics> the next prompt
    // asks the AI to avoid repeating.
    this.articlesService.list().subscribe((articles) => this.doneTopics.set(articles.map((article) => article.title)));
  }

  protected copyToClipboard(text: string): void {
    void navigator.clipboard?.writeText(text);
  }

  protected parse(): void {
    const result = parseArticleResponse(this.rawResponse());
    if (!result.draft) {
      this.parseErrors.set(result.errors);
      return;
    }

    this.parseErrors.set([]);
    this.form.patchValue({
      title: result.draft.title,
      slug: slugify(result.draft.title),
      excerpt: result.draft.summary,
      content: result.draft.content,
    });
    this.step.set(2);
  }

  protected backToPrompt(): void {
    this.step.set(1);
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    const raw = this.form.getRawValue();

    this.articlesService
      .create({
        title: raw.title,
        slug: raw.slug,
        excerpt: raw.excerpt || undefined,
        content: raw.content,
        status: raw.status,
      })
      .subscribe({
        next: (article) => {
          this.saving.set(false);
          this.createdId.set(article.id);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to create the article.');
        },
      });
  }

  protected goToArticles(): void {
    void this.router.navigateByUrl('/articles');
  }
}
