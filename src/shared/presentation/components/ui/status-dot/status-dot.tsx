import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const STATUS_CLASS_MAP = {
  good: 'dot-good',
  warn: 'dot-warn',
  bad: 'dot-bad',
  inactive: 'dot',
} as const;

export type StatusDotStatus = keyof typeof STATUS_CLASS_MAP;

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusDotStatus;
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        STATUS_CLASS_MAP[status],
        className,
      )}
      {...props}
    />
  ),
);
StatusDot.displayName = 'StatusDot';

export { StatusDot };
