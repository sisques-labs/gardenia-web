import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--forest-2)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-[var(--forest)] text-[var(--white)] hover:opacity-90 active:scale-95 transition-all',
        destructive:
          'rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity',
        outline:
          'rounded-full border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors',
        secondary:
          'rounded-full bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--paper-3)] transition-colors',
        ghost:
          'rounded-full text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)] transition-colors',
        link:
          'text-[var(--forest)] underline underline-offset-2 decoration-dotted hover:opacity-80 transition-opacity',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        aria-disabled={loading ? 'true' : undefined}
        {...props}
      >
        {loading && (
          <svg
            aria-hidden="true"
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
