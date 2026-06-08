'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { NAV_ITEMS } from '../sidebar-nav-items/nav-items';
import { NavItem } from '../sidebar-nav-items/nav-item';
import { SidebarFooter } from '../sidebar-footer/sidebar-footer';

interface SidebarProps {
  inDrawer?: boolean;
  dict: AppDict['shell'];
}

export function Sidebar({ inDrawer = false, dict }: SidebarProps) {
  const { collapsed, toggleCollapsed, closeDrawer } = useSidebarStore();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] ?? 'en';

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer]);

  const sidebarContent = (
    <nav data-testid="sidebar" className="flex flex-col h-full border-r border-[var(--rule)] paper-grain">
      {/* Brand header + collapse toggle */}
      <div className="border-b border-[var(--rule)] px-2 py-2">
        {collapsed ? (
          !inDrawer && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={dict.sidebar.expand}
              className="flex w-full items-center justify-center rounded-md p-2 hover:bg-[var(--forest-bg)] hover:text-[var(--forest)] text-[var(--ink)]/60 transition-colors"
            >
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 px-1 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Leaf className="w-5 h-5 shrink-0 text-[var(--forest)]" />
              <span className="text-sm font-semibold tracking-wide text-[var(--ink)]">Gardenia</span>
            </div>
            {!inDrawer && (
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={dict.sidebar.collapse}
                className="shrink-0 rounded-md p-1 text-[var(--ink)]/60 transition-colors hover:bg-[var(--forest-bg)] hover:text-[var(--forest)]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const resolvedHref = item.href.replace('/[lang]', `/${locale}`);
          const active = pathname?.startsWith(resolvedHref) ?? false;
          return (
            <NavItem
              key={item.href}
              item={{ ...item, href: resolvedHref }}
              label={dict.nav[item.key]}
              collapsed={collapsed}
              active={active}
              onClick={closeDrawer}
            />
          );
        })}
      </div>

      {/* Garden + account */}
      <div className="border-t border-[var(--rule)]">
        <SidebarFooter
          dict={{ spaceSwitcher: dict.spaceSwitcher, userMenu: dict.userMenu }}
          locale={locale}
          onNavigate={closeDrawer}
        />
      </div>
    </nav>
  );

  if (inDrawer) {
    return <div className="h-full">{sidebarContent}</div>;
  }

  return <div className="hidden md:block h-full">{sidebarContent}</div>;
}
