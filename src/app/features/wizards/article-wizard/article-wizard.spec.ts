import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleWizard } from './article-wizard';

describe('ArticleWizard', () => {
  let component: ArticleWizard;
  let fixture: ComponentFixture<ArticleWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
