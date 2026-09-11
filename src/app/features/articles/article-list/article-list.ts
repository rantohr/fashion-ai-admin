import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-article-list',
  styleUrl: './article-list.scss',
  templateUrl: './article-list.html',
})
export class ArticleList {}
