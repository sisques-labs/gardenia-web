import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@/shared/presentation/components/header/header';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, Header],
  template: `
    <app-header />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayout {}
