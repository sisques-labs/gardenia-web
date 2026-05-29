import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.html',
  host: {
    class: 'card',
    '[class.bordered]': 'variant() === "bordered"',
    role: 'article',
  },
})
export class Card {
  readonly variant = input<'default' | 'bordered'>('default');
}
