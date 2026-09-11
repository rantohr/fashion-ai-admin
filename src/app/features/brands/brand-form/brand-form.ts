import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UploadsService } from '../../../core/uploads/uploads.service';
import { ImageCropper } from '../../../shared/image-cropper/image-cropper';
import { BrandsService } from '../brands.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, ImageCropper],
  selector: 'app-brand-form',
  styleUrl: './brand-form.scss',
  templateUrl: './brand-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly brandsService = inject(BrandsService);
  private readonly uploadsService = inject(UploadsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly brandId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  // Logo upload: reuses ImageCropper in single-crop mode (Day 4) rather
  // than a separate upload widget.
  protected readonly pendingLogoSrc = signal<string | null>(null);
  protected readonly uploadingLogo = signal(false);
  protected readonly logoError = signal<string | null>(null);

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

  protected onLogoFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.pendingLogoSrc.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected cancelLogoCrop(): void {
    this.pendingLogoSrc.set(null);
  }

  protected onLogoCropped(blobs: Blob[]): void {
    const blob = blobs[0];
    if (!blob) {
      return;
    }
    this.uploadingLogo.set(true);
    this.logoError.set(null);
    this.uploadsService.upload(blob, 'logo.png').subscribe({
      next: (response) => {
        this.form.controls.logoUrl.setValue(response.url);
        this.pendingLogoSrc.set(null);
        this.uploadingLogo.set(false);
      },
      error: () => {
        this.uploadingLogo.set(false);
        this.logoError.set('Failed to upload the logo.');
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
