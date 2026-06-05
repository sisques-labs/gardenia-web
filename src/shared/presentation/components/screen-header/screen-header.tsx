import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/presentation/components/ui/breadcrumb';

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface ScreenHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: ReactNode;
}

export function ScreenHeader({ title, breadcrumbs, actions }: ScreenHeaderProps) {
  return (
    <header className="flex flex-col gap-1 px-6 py-4 border-b border-[var(--rule)]">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={crumb.label}>
                {index > 0 && <BreadcrumbSeparator />}
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center">
        <h1 className="headline text-[var(--ink)]">{title}</h1>
        {actions && (
          <div data-testid="screen-header-actions" className="ml-auto flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
