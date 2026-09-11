import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UploadsService } from '../../../core/uploads/uploads.service';
import { ImageCropper } from '../../../shared/image-cropper/image-cropper';
import type { Brand } from '../../brands/brand.model';
import { BrandsService } from '../../brands/brands.service';
import type { OutfitPayload } from '../../outfits/outfit.model';
import { OutfitsService } from '../../outfits/outfits.service';
import { type ParsedOutfitDraft, parseOutfitDrafts, withUniqueSlugs } from './outfit-wizard.utils';

const GRID_ROWS = 5;
const GRID_COLS = 2;
const OUTFIT_COUNT = GRID_ROWS * GRID_COLS;

type WizardStep = 1 | 2 | 3;

@Component({
  imports: [FormsModule, ImageCropper],
  selector: 'app-outfit-wizard',
  styleUrl: './outfit-wizard.scss',
  templateUrl: './outfit-wizard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutfitWizard {
  private readonly brandsService = inject(BrandsService);
  private readonly outfitsService = inject(OutfitsService);
  private readonly uploadsService = inject(UploadsService);
  private readonly router = inject(Router);

  protected readonly gridRows = GRID_ROWS;
  protected readonly gridCols = GRID_COLS;
  protected readonly outfitCount = OUTFIT_COUNT;

  protected readonly step = signal<WizardStep>(1);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly brandId = signal('');

  protected readonly jsonInput = signal('');
  protected readonly parseErrors = signal<string[]>([]);
  protected readonly drafts = signal<ParsedOutfitDraft[] | null>(null);

  protected readonly combinedImageSrc = signal<string | null>(null);

  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly createdCount = signal<number | null>(null);

  private readonly selectedBrandName = computed(
    () => this.brands().find((brand) => brand.id === this.brandId())?.name ?? 'the brand',
  );

  protected readonly dataPrompt = computed(
    () => `Generate a JSON array of exactly ${OUTFIT_COUNT} fashion outfit ideas for the brand "${this.selectedBrandName()}".

Return ONLY a raw JSON array (no markdown fences, no commentary) of exactly ${OUTFIT_COUNT} objects. Each object must have exactly these fields:
- name: string, a short outfit name
- category: string, e.g. "outerwear", "dresses", "footwear", "accessories"
- price: number, USD, no currency symbol
- description: string, 1-2 sentences
- tags: array of 3-5 lowercase string tags
- season: one of "SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"`,
  );

  protected readonly imagePrompt = computed(() => {
    const names = this.drafts()
      ?.map((draft) => draft.name)
      .join(', ');
    return `Generate ONE image containing exactly ${OUTFIT_COUNT} distinct fashion outfit visuals arranged in a clean ${GRID_COLS}-column by ${GRID_ROWS}-row grid, evenly spaced with no gaps, borders, or labels between cells (the grid will be sliced programmatically, so precise alignment matters). The outfits, in reading order (left-to-right, top-to-bottom), are: ${names ?? ''}.`;
  });

  constructor() {
    this.brandsService.list().subscribe((brands) => this.brands.set(brands));
  }

  protected copyToClipboard(text: string): void {
    void navigator.clipboard?.writeText(text);
  }

  protected parseJson(): void {
    const result = parseOutfitDrafts(this.jsonInput(), OUTFIT_COUNT);
    if (result.errors.length > 0) {
      this.parseErrors.set(result.errors);
      this.drafts.set(null);
      return;
    }
    this.parseErrors.set([]);
    this.drafts.set(result.outfits);
    this.step.set(2);
  }

  protected onImagePasted(event: ClipboardEvent): void {
    const file = Array.from(event.clipboardData?.items ?? [])
      .find((item) => item.type.startsWith('image/'))
      ?.getAsFile();
    if (file) {
      this.readImageFile(file);
    }
  }

  protected onImageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.readImageFile(file);
    }
  }

  private readImageFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => this.combinedImageSrc.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected goToCrop(): void {
    if (this.combinedImageSrc()) {
      this.step.set(3);
    }
  }

  protected backTo(step: 1 | 2): void {
    this.step.set(step);
  }

  protected onCropped(blobs: Blob[]): void {
    const drafts = this.drafts();
    if (!drafts || blobs.length !== drafts.length) {
      this.createError.set('Could not slice the image into the expected number of outfits.');
      return;
    }
    this.createFromCrops(drafts, blobs);
  }

  private createFromCrops(drafts: ParsedOutfitDraft[], images: Blob[]): void {
    const brandId = this.brandId();
    if (!brandId) {
      this.createError.set('Select a brand before creating outfits.');
      return;
    }

    this.creating.set(true);
    this.createError.set(null);

    const slugs = withUniqueSlugs(drafts.map((draft) => draft.name));
    const uploads = images.map((blob, index) => this.uploadsService.upload(blob, `${slugs[index]}.png`));

    forkJoin(uploads)
      .pipe(
        switchMap((uploaded) => {
          const outfits: OutfitPayload[] = drafts.map((draft, index) => ({
            brandId,
            name: draft.name,
            slug: slugs[index],
            category: draft.category,
            price: draft.price,
            description: draft.description || undefined,
            imageUrl: uploaded[index].url,
            tags: draft.tags,
            season: draft.season,
          }));
          return this.outfitsService.batchCreate({ outfits });
        }),
      )
      .subscribe({
        next: (created) => {
          this.creating.set(false);
          this.createdCount.set(created.length);
        },
        error: () => {
          this.creating.set(false);
          this.createError.set('Failed to create outfits - nothing was saved (the batch is transactional).');
        },
      });
  }

  protected goToOutfits(): void {
    void this.router.navigateByUrl('/outfits');
  }
}
