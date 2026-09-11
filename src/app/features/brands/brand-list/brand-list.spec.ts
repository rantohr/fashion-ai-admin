import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Brand } from '../brand.model';
import { BrandList } from './brand-list';

// BrandList's delete-flow members are `protected` (template-only by design);
// tests reach them the same way the template does, via a loosely-typed view.
type BrandListHarness = {
  requestDelete(brand: Brand): void;
  cancelDelete(): void;
  confirmDelete(): void;
  brands: () => Brand[];
  pendingDelete: () => Brand | null;
};

function asHarness(component: BrandList): BrandListHarness {
  return component as unknown as BrandListHarness;
}

const BRAND: Brand = {
  id: 'b1',
  name: 'Acme Apparel',
  slug: 'acme-apparel',
  description: null,
  logoUrl: null,
  website: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('BrandList', () => {
  let component: BrandList;
  let fixture: ComponentFixture<BrandList>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandList);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([]);
    expect(component).toBeTruthy();
  });

  it('does not render the confirm dialog until a delete is requested', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([BRAND]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-confirm-dialog')).toBeNull();
  });

  it('defers in the confirm dialog on delete, and removes the row once confirmed', async () => {
    const harness = asHarness(component);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([BRAND]);
    fixture.detectChanges();

    harness.requestDelete(BRAND);
    fixture.detectChanges();
    await fixture.whenStable(); // let the deferred confirm-dialog chunk resolve
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('app-confirm-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Acme Apparel');

    harness.confirmDelete();
    httpMock.expectOne('http://localhost:3000/brands/b1').flush(null);
    fixture.detectChanges();

    expect(harness.brands()).toEqual([]);
    expect(harness.pendingDelete()).toBeNull();
  });

  it('cancelling a delete clears pendingDelete without calling the API', async () => {
    const harness = asHarness(component);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/brands').flush([BRAND]);
    fixture.detectChanges();

    harness.requestDelete(BRAND);
    harness.cancelDelete();

    expect(harness.pendingDelete()).toBeNull();
    httpMock.expectNone('http://localhost:3000/brands/b1');
  });
});
