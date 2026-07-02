import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type EntityRowProps = {
  children: ReactNode;
  actions: ReactNode;
  className?: string;
};

function EntityRow({ children, actions, className }: EntityRowProps) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-4', className)}>
      {children}
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
EntityRow.displayName = 'EntityRow';

type EntityRowActionVariant = 'default' | 'accent' | 'destructive';

const actionVariantClass: Record<EntityRowActionVariant, string> = {
  default: 'text-sm font-medium hover:opacity-80',
  accent: 'text-sm font-medium text-[var(--forest)] hover:opacity-80',
  destructive: 'text-destructive hover:text-destructive/80 text-sm font-medium',
};

type EntityRowActionProps = {
  label: string;
  onClick: () => void;
  variant?: EntityRowActionVariant;
};

function EntityRowAction({ label, onClick, variant = 'default' }: EntityRowActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={actionVariantClass[variant]}
    >
      {label}
    </button>
  );
}
EntityRowAction.displayName = 'EntityRowAction';

export { EntityRow, EntityRowAction };
