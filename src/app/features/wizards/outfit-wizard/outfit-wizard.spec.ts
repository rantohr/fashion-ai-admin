import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OutfitWizard } from './outfit-wizard';

function tenOutfits() {
  return Array.from({ length: 10 }, (_, i) => ({
    name: `Outfit ${i + 1}`,
    category: 'outerwear',
    price: 100 + i,
    description: 'A great outfit.',
    tags: ['coat'],
    season: 'FALL',
  }));
}

describe('OutfitWizard', () => {
  let component: OutfitWizard;
  let fixture: ComponentFixture<OutfitWizard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutfitWizard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OutfitWizard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load brands on init', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([{ id: 'b1', name: 'Acme', slug: 'acme' }]);
    expect(component).toBeTruthy();
  });

  it('stays on step 1 and reports errors for invalid JSON', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([]);

    component['jsonInput'].set('not json');
    component['parseJson']();

    expect(component['step']()).toBe(1);
    expect(component['parseErrors']()).toEqual(['That is not valid JSON.']);
  });

  it('advances to step 2 once 10 valid outfits are parsed', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([]);

    component['jsonInput'].set(JSON.stringify(tenOutfits()));
    component['parseJson']();

    expect(component['step']()).toBe(2);
    expect(component['parseErrors']()).toEqual([]);
    expect(component['drafts']()).toHaveLength(10);
  });

  it('builds an image prompt that lists the parsed outfit names', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([]);

    component['jsonInput'].set(JSON.stringify(tenOutfits()));
    component['parseJson']();

    expect(component['imagePrompt']()).toContain('Outfit 1');
    expect(component['imagePrompt']()).toContain('Outfit 10');
  });
});
