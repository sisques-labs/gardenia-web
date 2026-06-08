'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { NAV_ITEMS } from '../sidebar-nav-items/nav-items';
import { NavItem } from '../sidebar-nav-items/nav-item';
import { SpaceSwitcher } from '../space-switcher/space-switcher';

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
      {/* Brand header */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-[var(--rule)]">
        <Leaf className="w-5 h-5 text-[var(--forest)] shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--ink)] tracking-wide">Gardenia</span>
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

      {/* Active space */}
      <div className="border-t border-[var(--rule)]">
        <SpaceSwitcher dict={dict.spaceSwitcher} />
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--rule)] p-2">
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? dict.sidebar.expand : dict.sidebar.collapse}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-[var(--forest-bg)] hover:text-[var(--forest)] text-[var(--ink)]/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );

  if (inDrawer) {
    return <div className="h-full">{sidebarContent}</div>;
  }

  return <div className="hidden md:block h-full">{sidebarContent}</div>;
}
