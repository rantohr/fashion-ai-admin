import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyToClipboard } from './copy-to-clipboard';

@Component({
  imports: [CopyToClipboard],
  template: `<button [appCopyToClipboard]="text()">Copy</button>`,
})
class TestHost {
  readonly text = signal('hello world');
}

@Component({
  imports: [CopyToClipboard],
  template: `<button [appCopyToClipboard]="text()" copyLabel="Copy prompt">Copy prompt</button>`,
})
class TestHostWithCustomLabel {
  readonly text = signal('a prompt');
}

describe('CopyToClipboard', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createHost(): ComponentFixture<TestHost> {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    return fixture;
  }

  it('starts with the default "Copy" label', () => {
    const fixture = createHost();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toBe('Copy');
  });

  it('writes the bound text to the clipboard on click', () => {
    const fixture = createHost();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('flashes "Copied!" after a successful copy, then reverts', () => {
    vi.useFakeTimers();
    const fixture = createHost();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();
    return Promise.resolve().then(() => {
      fixture.detectChanges();
      expect(button.textContent).toBe('Copied!');

      vi.advanceTimersByTime(1500);
      fixture.detectChanges();
      expect(button.textContent).toBe('Copy');
    });
  });

  it('respects a custom idle label', () => {
    const fixture = TestBed.createComponent(TestHostWithCustomLabel);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toBe('Copy prompt');
  });

  it('does nothing when the bound text is empty', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.text.set('');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(writeText).not.toHaveBeenCalled();
  });

  it('clears the pending reset timer on destroy', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fixture = createHost();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();
    return Promise.resolve().then(() => {
      fixture.destroy();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
