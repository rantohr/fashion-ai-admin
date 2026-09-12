import { Directive, computed, input, signal } from '@angular/core';

const FEEDBACK_DURATION_MS = 1500;

// Attribute directive: put it on any clickable element (typically a
// button) and give it the text to copy. Owns the click handling, the
// clipboard write, and the transient "Copied!" label - replaces the
// identical copyToClipboard() method + hand-written click handler that
// used to be duplicated across OutfitWizard and ArticleWizard.
//
// Usage: <button [appCopyToClipboard]="dataPrompt()">Copy</button>
// (the "Copy" text child is optional - the directive owns the label via
// [textContent] once applied, so it's fine to leave the template empty too).
@Directive({
  selector: '[appCopyToClipboard]',
  host: {
    '[textContent]': 'label()',
    '(click)': 'onClick()',
  },
})
export class CopyToClipboard {
  // The text copied to the clipboard on click.
  readonly appCopyToClipboard = input.required<string>();
  // Idle label; restored automatically after the "Copied!" flash.
  readonly copyLabel = input('Copy');

  private readonly copied = signal(false);
  protected readonly label = computed(() => (this.copied() ? 'Copied!' : this.copyLabel()));

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  protected async onClick(): Promise<void> {
    const text = this.appCopyToClipboard();
    if (!text || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => this.copied.set(false), FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard access denied or unavailable (e.g. insecure context) -
      // silently no-op; the prompt text is still visible on the page for
      // the user to select and copy by hand.
    }
  }
}
