import { Component, input, signal } from '@angular/core';
import { LucideMenu, LucideX } from '@lucide/angular';
import { Button } from '../ui/button/button';
import { Icon } from '../ui/icon/icon';

export interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Button, Icon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly navLinks = input<NavLink[]>([]);
  readonly ctaLabel = input<string>('');

  protected readonly mobileMenuOpen = signal(false);

  protected readonly menuIcon = LucideMenu.icon;
  protected readonly closeIcon = LucideX.icon;

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }
}
