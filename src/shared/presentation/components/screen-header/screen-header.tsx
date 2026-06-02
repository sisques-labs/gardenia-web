import type { ReactNode } from 'react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ScreenHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}

export function ScreenHeader({ title, breadcrumbs, actions }: ScreenHeaderProps) {
  return (
    <header className="flex flex-col gap-1 px-6 py-4 border-b border-[var(--rule)]">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--ink)]/60">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={crumb.label} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true" className="text-[var(--ink)]/40">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[var(--ink)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-[var(--ink)]' : ''}>{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title row */}
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
