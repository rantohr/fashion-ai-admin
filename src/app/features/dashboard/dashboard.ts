import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessProfileService } from './business-profile.service';
import type { DashboardStats } from './dashboard.model';
import { DashboardService } from './dashboard.service';
import { titleCase, toRankBars, toRecentActivity, toShareBars } from './dashboard.utils';

@Component({
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly fb = inject(FormBuilder);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly statsLoading = signal(true);
  protected readonly statsError = signal<string | null>(null);

  protected readonly profileLoading = signal(true);
  protected readonly profileError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);

  // Every breakdown/leaderboard the template renders is derived here so
  // dashboard.html only ever deals with a flat { label, count, pct }[] -
  // see dashboard.utils.ts (unit-tested independently of this component).
  protected readonly outfitStatusBars = computed(() =>
    toShareBars(
      (this.stats()?.outfitsByStatus ?? []).map((row) => ({ label: titleCase(row.status), count: row.count })),
    ),
  );

  protected readonly outfitSeasonBars = computed(() =>
    toShareBars(
      (this.stats()?.outfitsBySeason ?? []).map((row) => ({ label: titleCase(row.season), count: row.count })),
    ),
  );

  protected readonly articleStatusBars = computed(() =>
    toShareBars(
      (this.stats()?.articlesByStatus ?? []).map((row) => ({ label: titleCase(row.status), count: row.count })),
    ),
  );

  protected readonly topBrandBars = computed(() =>
    toRankBars((this.stats()?.topBrands ?? []).map((brand) => ({ label: brand.name, count: brand.outfitCount }))),
  );

  protected readonly recentActivity = computed(() =>
    toRecentActivity(this.stats()?.recentOutfits ?? [], this.stats()?.recentArticles ?? []),
  );

  protected readonly form = this.fb.nonNullable.group({
    shopName: ['', Validators.required],
    monthlyRevenue: [0, [Validators.required, Validators.min(0)]],
    monthlyCosts: [0, [Validators.required, Validators.min(0)]],
    // The API requires these two as positive integers (@IsPositive()), unlike
    // the other fields here which merely disallow negatives - min(1) matches.
    monthlyCustomers: [0, [Validators.required, Validators.min(1)]],
    monthlySalesVolume: [0, [Validators.required, Validators.min(1)]],
    marketingBudget: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsError.set('Failed to load dashboard stats.');
        this.statsLoading.set(false);
      },
    });

    this.businessProfileService.get().subscribe({
      next: (profile) => {
        this.form.patchValue({
          shopName: profile.shopName,
          monthlyRevenue: Number(profile.monthlyRevenue),
          monthlyCosts: Number(profile.monthlyCosts),
          monthlyCustomers: profile.monthlyCustomers,
          monthlySalesVolume: profile.monthlySalesVolume,
          marketingBudget: Number(profile.marketingBudget),
        });
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileError.set('Failed to load the business profile.');
        this.profileLoading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.profileError.set(null);
    this.saved.set(false);

    this.businessProfileService.update(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.profileError.set('Failed to save the business profile.');
      },
    });
  }
}
