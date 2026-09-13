import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleWizard } from './article-wizard';

const VALID_RESPONSE = [
  'Loud Prints, Quiet Confidence',
  '',
  'Why bold patterns are the easiest way to feel like yourself.',
  '',
  'Prints get a bad reputation for being loud. But worn right, a bold pattern is armor.',
].join('\n');

describe('ArticleWizard', () => {
  let component: ArticleWizard;
  let fixture: ComponentFixture<ArticleWizard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleWizard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleWizard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load existing article titles as done topics', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/articles').flush([
      {
        id: 'a1',
        title: 'Capsule Wardrobes 101',
        slug: 'capsule-wardrobes-101',
        excerpt: null,
        content: 'content',
        status: 'PUBLISHED',
        publishedAt: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(component).toBeTruthy();
    expect(component['doneTopics']()).toEqual(['Capsule Wardrobes 101']);
    expect(component['dataPrompt']()).toContain('Capsule Wardrobes 101');
  });

  it('stays on step 1 and reports errors for an unparsable response', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/articles').flush([]);

    component['rawResponse'].set('not enough blocks here');
    component['parse']();

    expect(component['step']()).toBe(1);
    expect(component['parseErrors']().length).toBeGreaterThan(0);
  });

  it('parses a valid response and advances to the review step, pre-filling the form', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/articles').flush([]);

    component['rawResponse'].set(VALID_RESPONSE);
    component['parse']();

    expect(component['step']()).toBe(2);
    expect(component['parseErrors']()).toEqual([]);
    expect(component['form'].value.title).toBe('Loud Prints, Quiet Confidence');
    expect(component['form'].value.slug).toBe('loud-prints-quiet-confidence');
    expect(component['form'].value.excerpt).toBe('Why bold patterns are the easiest way to feel like yourself.');
    expect(component['form'].value.content).toContain('Prints get a bad reputation');
  });
});
