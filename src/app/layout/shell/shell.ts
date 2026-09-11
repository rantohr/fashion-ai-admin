import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
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
}
