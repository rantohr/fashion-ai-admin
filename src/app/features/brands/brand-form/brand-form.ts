import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandsService } from '../brands.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-brand-form',
  styleUrl: './brand-form.scss',
  templateUrl: './brand-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly brandsService = inject(BrandsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly brandId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    description: [''],
    logoUrl: [''],
    website: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.brandId.set(id);
    this.loading.set(true);
    this.brandsService.get(id).subscribe({
      next: (brand) => {
        this.form.patchValue({
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? '',
          logoUrl: brand.logoUrl ?? '',
          website: brand.website ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load brand.');
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
      name: raw.name,
      slug: raw.slug,
      description: raw.description || undefined,
      logoUrl: raw.logoUrl || undefined,
      website: raw.website || undefined,
    };

    const id = this.brandId();
    const request = id ? this.brandsService.update(id, payload) : this.brandsService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/brands');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save brand.');
      },
    });
  }
}
