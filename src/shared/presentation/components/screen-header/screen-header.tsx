import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/presentation/components/ui/breadcrumb/breadcrumb';
import { useMobileMenu } from '@/shared/presentation/components/app-shell/mobile-menu.context';

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
  const mobileMenu = useMobileMenu();

  return (
    <header className="flex min-h-16 flex-col justify-center gap-1 px-4 sm:px-6 py-3 border-b border-[var(--rule)]">
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {mobileMenu && (
          <button
            type="button"
            onClick={mobileMenu.onOpen}
            aria-label={mobileMenu.label}
            className="md:hidden -ml-1 shrink-0 rounded-md p-1 text-[var(--ink)] hover:bg-[var(--forest-bg)]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
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
          <div data-testid="screen-header-actions" className="ml-auto flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
