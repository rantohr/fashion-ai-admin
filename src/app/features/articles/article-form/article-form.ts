import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Outfit } from '../../outfits/outfit.model';
import { OutfitsService } from '../../outfits/outfits.service';
import { ARTICLE_STATUSES } from '../article.model';
import { ArticlesService } from '../articles.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-article-form',
  styleUrl: './article-form.scss',
  templateUrl: './article-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly articlesService = inject(ArticlesService);
  private readonly outfitsService = inject(OutfitsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly statuses = ARTICLE_STATUSES;

  protected readonly articleId = signal<string | null>(null);
  protected readonly outfits = signal<Outfit[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    outfitId: ['', Validators.required],
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    excerpt: [''],
    content: ['', Validators.required],
    status: ['DRAFT' as (typeof ARTICLE_STATUSES)[number]],
  });

  ngOnInit(): void {
    this.outfitsService.list().subscribe((outfits) => this.outfits.set(outfits));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.articleId.set(id);
    this.loading.set(true);
    this.articlesService.get(id).subscribe({
      next: (article) => {
        this.form.patchValue({
          outfitId: article.outfitId,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? '',
          content: article.content,
          status: article.status,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load article.');
        this.loading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    const raw = this.form.getRawValue();
    const payload = {
      outfitId: raw.outfitId,
      title: raw.title,
      slug: raw.slug,
      excerpt: raw.excerpt || undefined,
      content: raw.content,
      status: raw.status,
    };

    const id = this.articleId();
    const request = id ? this.articlesService.update(id, payload) : this.articlesService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/articles');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save article.');
      },
    });
  }
}
