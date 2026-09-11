import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCropper } from './image-cropper';

// jsdom (this project's test environment) doesn't implement real canvas
// 2D rendering or image decoding, so this only verifies the component
// mounts and accepts its inputs without throwing - the actual pixel
// cropping is a manual/browser-verified concern, see CLAUDE.md.
const TRANSPARENT_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe('ImageCropper', () => {
  let component: ImageCropper;
  let fixture: ComponentFixture<ImageCropper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropper],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropper);
    fixture.componentRef.setInput('imageSrc', TRANSPARENT_PIXEL_PNG);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to single-crop mode', () => {
    expect(component.mode()).toBe('single');
  });

  it('accepts grid mode with a row/col count', () => {
    fixture.componentRef.setInput('mode', 'grid');
    fixture.componentRef.setInput('rows', 5);
    fixture.componentRef.setInput('cols', 2);
    fixture.detectChanges();

    expect(component.mode()).toBe('grid');
    expect(component.rows()).toBe(5);
    expect(component.cols()).toBe(2);
  });
});
