import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  protected readonly auth = inject(AuthService);

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/brands', label: 'Brands' },
    { path: '/outfits', label: 'Outfits' },
    { path: '/articles', label: 'Articles' },
    { path: '/users', label: 'Users' },
    { path: '/wizards/outfit', label: 'Outfit Wizard' },
    { path: '/wizards/article', label: 'Article Wizard' },
    { path: '/scenarios', label: 'Scenarios' },
  ];

  protected logout(): void {
    this.auth.logout();
  }
}
