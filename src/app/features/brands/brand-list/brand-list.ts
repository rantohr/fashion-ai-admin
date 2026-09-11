import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import type { Brand } from '../brand.model';
import { BrandsService } from '../brands.service';

@Component({
  imports: [RouterLink, ConfirmDialog],
  selector: 'app-brand-list',
  styleUrl: './brand-list.scss',
  templateUrl: './brand-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandList implements OnInit {
  private readonly brandsService = inject(BrandsService);

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  // Drives the deferred confirm dialog below - only set once the user
  // actually asks to delete something.
  protected readonly pendingDelete = signal<Brand | null>(null);

  ngOnInit(): void {
    this.fetchBrands();
  }

  private fetchBrands(): void {
    this.loading.set(true);
    this.brandsService.list().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load brands.');
        this.loading.set(false);
      },
    });
  }

  protected requestDelete(brand: Brand): void {
    this.pendingDelete.set(brand);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const brand = this.pendingDelete();
    if (!brand) {
      return;
    }
    this.brandsService.remove(brand.id).subscribe({
      next: () => {
        this.brands.update((list) => list.filter((b) => b.id !== brand.id));
        this.pendingDelete.set(null);
      },
      error: () => {
        this.error.set('Failed to delete brand.');
        this.pendingDelete.set(null);
      },
    });
  }
}
