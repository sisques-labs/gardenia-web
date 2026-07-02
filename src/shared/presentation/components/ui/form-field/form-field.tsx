import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface FormFieldProps {
  label: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
FormField.displayName = 'FormField';
