import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/presentation/components/ui/breadcrumb/breadcrumb';

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: ReactNode;
}

export function ScreenHeader({ title, eyebrow, subtitle, breadcrumbs, actions }: ScreenHeaderProps) {
  return (
    <header className="flex flex-col gap-1 px-6 py-4 border-b border-[var(--rule)]">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="contents">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-baseline gap-2">
          <h1 className="headline text-[var(--ink)]">{title}</h1>
          {subtitle && (
            <span
              className="text-base italic text-[var(--terracotta)]"
              style={{ fontFamily: 'var(--hand)' }}
            >
              {subtitle}
            </span>
          )}
        </div>
        {actions && (
          <div data-testid="screen-header-actions" className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
