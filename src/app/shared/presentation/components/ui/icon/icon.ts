import { Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './icon.html',
  host: {
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.aria-label]': 'label() || null',
  },
})
export class Icon {
  readonly name = input.required<LucideIconData>();
  readonly size = input<number>(16);
  readonly strokeWidth = input<number>(1.75);
  readonly color = input<string>('currentColor');
  readonly label = input<string | null>(null);
}
