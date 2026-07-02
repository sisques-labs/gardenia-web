import type { ReactNode } from 'react';

type Props = {
  label: ReactNode;
  children: ReactNode;
};

export function Row({ label, children }: Props) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm text-muted-foreground w-32 flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
