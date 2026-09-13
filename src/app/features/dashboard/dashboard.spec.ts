import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { DashboardStats } from './dashboard.model';
import { Dashboard } from './dashboard';

const PROFILE = {
  id: 'default',
  shopName: 'Fashion AI Showcase',
  monthlyRevenue: '5000',
  monthlyCosts: '2000',
  monthlyCustomers: 120,
  monthlySalesVolume: 340,
  marketingBudget: '750',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const STATS: DashboardStats = {
  totals: { brands: 2, outfits: 15, articles: 3, users: 1, scenarios: 0 },
  outfitsByStatus: [
    { status: 'DRAFT', count: 12 },
    { status: 'PUBLISHED', count: 3 },
    { status: 'ARCHIVED', count: 0 },
  ],
  outfitsBySeason: [{ season: 'ALL_SEASON', count: 15 }],
  articlesByStatus: [
    { status: 'DRAFT', count: 3 },
    { status: 'PUBLISHED', count: 0 },
    { status: 'ARCHIVED', count: 0 },
  ],
  topBrands: [{ id: 'b1', name: 'Acme Apparel', slug: 'acme-apparel', outfitCount: 15 }],
  pricing: { min: 48, max: 199.99, avg: 113.3 },
  recentOutfits: [{ id: 'o1', name: 'Midnight Trench', slug: 'midnight-trench', createdAt: '2026-01-02T00:00:00.000Z' }],
  recentArticles: [],
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushInit(stats: DashboardStats = STATS): void {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/dashboard/stats').flush(stats);
    httpMock.expectOne('http://localhost:3000/business-profile').flush(PROFILE);
  }

  it('should create and load stats + business profile', () => {
    flushInit();
    expect(component).toBeTruthy();
    expect(component['stats']()?.totals).toEqual(STATS.totals);
  });

  it('converts the Decimal-as-string profile fields to numbers in the form', () => {
    flushInit();
    expect(component['form'].value.monthlyRevenue).toBe(5000);
    expect(component['form'].value.monthlyCosts).toBe(2000);
    expect(component['form'].value.marketingBudget).toBe(750);
    expect(component['form'].value.shopName).toBe('Fashion AI Showcase');
  });

  it('derives outfit-status share bars that sum to 100%', () => {
    flushInit();
    const bars = component['outfitStatusBars']();
    expect(bars).toEqual([
      { label: 'Draft', count: 12, pct: 80 },
      { label: 'Published', count: 3, pct: 20 },
      { label: 'Archived', count: 0, pct: 0 },
    ]);
  });

  it('derives a top-brands leaderboard scaled to the leader', () => {
    flushInit();
    expect(component['topBrandBars']()).toEqual([{ label: 'Acme Apparel', count: 15, pct: 100 }]);
  });

  it('saves the profile and shows a confirmation', () => {
    flushInit();

    component['submit']();
    const req = httpMock.expectOne('http://localhost:3000/business-profile');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...PROFILE, shopName: 'Updated Name' });

    expect(component['saved']()).toBe(true);
    expect(component['saving']()).toBe(false);
  });

  it('surfaces an error if stats fail to load', () => {
    fixture.detectChanges();
    httpMock
      .expectOne('http://localhost:3000/dashboard/stats')
      .flush('nope', { status: 500, statusText: 'Server Error' });
    httpMock.expectOne('http://localhost:3000/business-profile').flush(PROFILE);

    expect(component['statsError']()).toBe('Failed to load dashboard stats.');
  });
});
