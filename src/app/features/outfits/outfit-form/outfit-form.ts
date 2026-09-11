import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Brand } from '../../brands/brand.model';
import { BrandsService } from '../../brands/brands.service';
import { OUTFIT_STATUSES, SEASONS } from '../outfit.model';
import { OutfitsService } from '../outfits.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-outfit-form',
  styleUrl: './outfit-form.scss',
  templateUrl: './outfit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutfitForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly outfitsService = inject(OutfitsService);
  private readonly brandsService = inject(BrandsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly seasons = SEASONS;
  protected readonly statuses = OUTFIT_STATUSES;

  protected readonly outfitId = signal<string | null>(null);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    brandId: ['', Validators.required],
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    imageUrl: [''],
    tagsText: [''],
    season: ['ALL_SEASON' as (typeof SEASONS)[number]],
    status: ['DRAFT' as (typeof OUTFIT_STATUSES)[number]],
  });

  ngOnInit(): void {
    this.brandsService.list().subscribe((brands) => this.brands.set(brands));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.outfitId.set(id);
    this.loading.set(true);
    this.outfitsService.get(id).subscribe({
      next: (outfit) => {
        this.form.patchValue({
          brandId: outfit.brandId,
          name: outfit.name,
          slug: outfit.slug,
          category: outfit.category,
          price: Number(outfit.price),
          description: outfit.description ?? '',
          imageUrl: outfit.imageUrl ?? '',
          tagsText: outfit.tags.join(', '),
          season: outfit.season,
          status: outfit.status,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load outfit.');
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
      brandId: raw.brandId,
      name: raw.name,
      slug: raw.slug,
      category: raw.category,
      price: raw.price,
      description: raw.description || undefined,
      imageUrl: raw.imageUrl || undefined,
      tags: raw.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      season: raw.season,
      status: raw.status,
    };

    const id = this.outfitId();
    const request = id ? this.outfitsService.update(id, payload) : this.outfitsService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/outfits');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save outfit.');
      },
    });
  }
}
