import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'destructive'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly classes = computed(() => {
    const v = this.variant();
    const s = this.size();

    const base =
      'btn-reset inline-flex items-center justify-center gap-2 rounded-md font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-3 disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<typeof v, string> = {
      primary: 'bg-forest text-paper hover:bg-forest-2',
      secondary: 'bg-paper-2 text-ink border border-rule hover:bg-paper-3',
      ghost: 'bg-transparent text-ink hover:bg-paper-2',
      destructive: 'bg-terracotta text-paper app-button--destructive',
    };

    const sizes: Record<typeof s, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };

    return `${base} ${variants[v]} ${sizes[s]}`;
  });
}
