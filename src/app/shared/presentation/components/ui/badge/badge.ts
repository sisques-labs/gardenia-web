import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'default' | 'outline' | 'dot';
export type BadgeColor = 'forest' | 'honey' | 'terracotta' | 'sage' | 'sky' | 'plum' | 'ink';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.html',
  host: {
    '[class]': 'classes()',
  },
})
export class Badge {
  readonly variant = input<BadgeVariant>('default');
  readonly color = input<BadgeColor>('ink');

  /** Maps BadgeColor to the .chip color modifier class name */
  private readonly colorClass = computed(() => {
    const colorMap: Record<BadgeColor, string> = {
      forest: 'forest',
      honey: 'honey',
      terracotta: 'terra',
      sage: 'sage',
      sky: 'sky',
      plum: 'plum',
      ink: 'ink',
    };
    return colorMap[this.color()];
  });

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const color = this.colorClass();
    const parts = ['chip'];

    if (color) parts.push(color);
    if (variant === 'outline') parts.push('outline');

    return parts.join(' ');
  });

  protected readonly dotColor = computed(() => {
    const map: Record<BadgeColor, string> = {
      forest: 'var(--forest)',
      honey: 'var(--honey)',
      terracotta: 'var(--terracotta)',
      sage: 'var(--sage)',
      sky: 'var(--sky)',
      plum: 'var(--plum)',
      ink: 'var(--ink)',
    };
    return map[this.color()];
  });
}
