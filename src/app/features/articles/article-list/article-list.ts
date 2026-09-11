import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Article } from '../article.model';
import { ArticlesService } from '../articles.service';

@Component({
  imports: [RouterLink],
  selector: 'app-article-list',
  styleUrl: './article-list.scss',
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleList implements OnInit {
  private readonly articlesService = inject(ArticlesService);

  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.articlesService.list().subscribe({
      next: (articles) => {
        this.articles.set(articles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load articles.');
        this.loading.set(false);
      },
    });
  }

  protected remove(article: Article): void {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) {
      return;
    }
    this.articlesService.remove(article.id).subscribe({
      next: () => this.articles.update((list) => list.filter((a) => a.id !== article.id)),
      error: () => this.error.set('Failed to delete article.'),
    });
  }
}
