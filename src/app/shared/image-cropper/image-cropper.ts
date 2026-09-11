import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MAX_DISPLAY_WIDTH = 640;
const MIN_DRAG_PX = 10;

// Canvas-based crop tool, generic across two modes:
// - 'grid': the whole image is sliced into an even rows x cols grid (used
//   for the outfit wizard's combined 10-outfit image - no interactive
//   selection, the image-generation prompt already asks for a clean grid).
// - 'single': the user drags a rectangle to select one region (used for
//   brand logo upload, where the source image isn't already pre-composed).
@Component({
  selector: 'app-image-cropper',
  imports: [],
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCropper {
  readonly imageSrc = input.required<string>();
  readonly mode = input<'single' | 'grid'>('single');
  readonly rows = input(1);
  readonly cols = input(1);
  readonly cropped = output<Blob[]>();

  protected readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly ready = signal(false);
  protected readonly cropping = signal(false);
  private readonly draggingState = signal(false);

  private image: HTMLImageElement | null = null;
  private scale = 1;
  private displayWidth = 0;
  private displayHeight = 0;
  private selection: Rect | null = null;
  private dragStart: { x: number; y: number } | null = null;

  constructor() {
    // Re-runs whenever imageSrc changes OR the canvas first becomes
    // available, whichever happens later - covers both the initial render
    // and a later swap of the source image on an already-mounted cropper.
    effect(() => {
      const src = this.imageSrc();
      const canvasEl = this.canvasRef();
      if (canvasEl) {
        this.loadImage(src, canvasEl.nativeElement);
      }
    });
  }

  private loadImage(src: string, canvas: HTMLCanvasElement): void {
    this.ready.set(false);
    const img = new Image();
    img.onload = () => {
      this.image = img;
      const maxWidth = Math.min(MAX_DISPLAY_WIDTH, img.naturalWidth || MAX_DISPLAY_WIDTH);
      this.scale = img.naturalWidth > 0 ? maxWidth / img.naturalWidth : 1;
      this.displayWidth = Math.max(1, Math.round(img.naturalWidth * this.scale));
      this.displayHeight = Math.max(1, Math.round(img.naturalHeight * this.scale));

      canvas.width = this.displayWidth;
      canvas.height = this.displayHeight;

      if (this.mode() === 'single') {
        const size = Math.min(this.displayWidth, this.displayHeight) * 0.7;
        this.selection = {
          x: (this.displayWidth - size) / 2,
          y: (this.displayHeight - size) / 2,
          w: size,
          h: size,
        };
      }

      this.ready.set(true);
      this.redraw();
    };
    img.src = src;
  }

  private redraw(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !this.image) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.image, 0, 0, this.displayWidth, this.displayHeight);

    if (this.mode() === 'grid') {
      this.drawGridOverlay(ctx);
    } else if (this.selection) {
      this.drawSingleOverlay(ctx, this.selection);
    }
  }

  private drawGridOverlay(ctx: CanvasRenderingContext2D): void {
    const rows = this.rows();
    const cols = this.cols();
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1;
    for (let c = 1; c < cols; c++) {
      const x = (this.displayWidth / cols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.displayHeight);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const y = (this.displayHeight / rows) * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.displayWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSingleOverlay(ctx: CanvasRenderingContext2D, rect: Rect): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.displayWidth, rect.y);
    ctx.fillRect(0, rect.y + rect.h, this.displayWidth, this.displayHeight - rect.y - rect.h);
    ctx.fillRect(0, rect.y, rect.x, rect.h);
    ctx.fillRect(rect.x + rect.w, rect.y, this.displayWidth - rect.x - rect.w, rect.h);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.mode() !== 'single') {
      return;
    }
    const point = this.pointFromEvent(event);
    this.dragStart = point;
    this.draggingState.set(true);
    this.selection = { x: point.x, y: point.y, w: 0, h: 0 };
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.draggingState() || !this.dragStart) {
      return;
    }
    const point = this.pointFromEvent(event);
    const x = Math.min(this.dragStart.x, point.x);
    const y = Math.min(this.dragStart.y, point.y);
    const w = Math.abs(point.x - this.dragStart.x);
    const h = Math.abs(point.y - this.dragStart.y);
    this.selection = this.clampRect({ x, y, w, h });
    this.redraw();
  }

  protected onPointerUp(): void {
    if (!this.draggingState()) {
      return;
    }
    this.draggingState.set(false);
    this.dragStart = null;
    if (this.selection && (this.selection.w < MIN_DRAG_PX || this.selection.h < MIN_DRAG_PX)) {
      // Too small a drag to be intentional - restore a sensible default
      // rather than leaving a near-zero-size selection.
      this.selection = {
        x: this.displayWidth * 0.15,
        y: this.displayHeight * 0.15,
        w: this.displayWidth * 0.7,
        h: this.displayHeight * 0.7,
      };
      this.redraw();
    }
  }

  private clampRect(rect: Rect): Rect {
    const x = Math.max(0, Math.min(rect.x, this.displayWidth));
    const y = Math.max(0, Math.min(rect.y, this.displayHeight));
    const w = Math.max(0, Math.min(rect.w, this.displayWidth - x));
    const h = Math.max(0, Math.min(rect.h, this.displayHeight - y));
    return { x, y, w, h };
  }

  private pointFromEvent(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef()?.nativeElement;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  protected async confirm(): Promise<void> {
    if (!this.image) {
      return;
    }
    this.cropping.set(true);
    try {
      const blobs = this.mode() === 'grid' ? await this.sliceGrid() : await this.sliceSingle();
      this.cropped.emit(blobs);
    } finally {
      this.cropping.set(false);
    }
  }

  private async sliceSingle(): Promise<Blob[]> {
    if (!this.image || !this.selection) {
      return [];
    }
    const blob = await this.extract(
      this.image,
      this.selection.x / this.scale,
      this.selection.y / this.scale,
      this.selection.w / this.scale,
      this.selection.h / this.scale,
    );
    return blob ? [blob] : [];
  }

  private async sliceGrid(): Promise<Blob[]> {
    if (!this.image) {
      return [];
    }
    const rows = this.rows();
    const cols = this.cols();
    const cellW = this.image.naturalWidth / cols;
    const cellH = this.image.naturalHeight / rows;

    const blobs: Blob[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const blob = await this.extract(this.image, c * cellW, r * cellH, cellW, cellH);
        if (blob) {
          blobs.push(blob);
        }
      }
    }
    return blobs;
  }

  private extract(image: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw));
    canvas.height = Math.max(1, Math.round(sh));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.resolve(null);
    }
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
  }
}
