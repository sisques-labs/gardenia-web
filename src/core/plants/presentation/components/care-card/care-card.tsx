import type { ReactNode } from 'react';
import { Card, CardContent } from '@/shared/presentation/components/ui/card';

type CareCardProps = {
  icon: ReactNode;
  label: string;
  labelVariant?: 'forest' | 'honey' | 'terra' | 'sage';
  title: string;
  description: string;
};

export function CareCard({ icon, label, labelVariant, title, description }: CareCardProps) {
  return (
    <Card data-testid="care-card">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`eyebrow${labelVariant ? ` text-[var(--${labelVariant})]` : ''}`}
          >
            {label}
          </span>
        </div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-[var(--ink-3)]">{description}</p>
      </CardContent>
    </Card>
  );
}
