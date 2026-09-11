import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Outfit } from '../outfit.model';
import { OutfitsService } from '../outfits.service';

@Component({
  imports: [RouterLink],
  selector: 'app-outfit-list',
  styleUrl: './outfit-list.scss',
  templateUrl: './outfit-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutfitList implements OnInit {
  private readonly outfitsService = inject(OutfitsService);

  protected readonly outfits = signal<Outfit[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.outfitsService.list().subscribe({
      next: (outfits) => {
        this.outfits.set(outfits);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load outfits.');
        this.loading.set(false);
      },
    });
  }

  protected remove(outfit: Outfit): void {
    if (!confirm(`Delete ${outfit.name}? This cannot be undone.`)) {
      return;
    }
    this.outfitsService.remove(outfit.id).subscribe({
      next: () => this.outfits.update((list) => list.filter((o) => o.id !== outfit.id)),
      error: () => this.error.set('Failed to delete outfit.'),
    });
  }
}
