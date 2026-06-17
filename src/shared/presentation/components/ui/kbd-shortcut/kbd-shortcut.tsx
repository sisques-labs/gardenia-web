import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface KbdShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys: string[];
  separator?: string;
}

const KbdShortcut = React.forwardRef<HTMLSpanElement, KbdShortcutProps>(
  ({ className, keys, separator = '+', ...props }, ref) => (
    <span ref={ref} className={cn('inline-flex items-center gap-0.5', className)} {...props}>
      {keys.map((key, i) => (
        <React.Fragment key={`${key}-${i}`}>
          <kbd className="inline-flex items-center justify-center rounded border border-[var(--rule)] bg-[var(--paper-2)] px-1.5 py-0.5 font-mono text-xs text-[var(--ink-2)]">
            {key}
          </kbd>
          {i < keys.length - 1 && (
            <span data-separator className="text-xs text-[var(--ink-3)]">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  ),
);
KbdShortcut.displayName = 'KbdShortcut';

export { KbdShortcut };
