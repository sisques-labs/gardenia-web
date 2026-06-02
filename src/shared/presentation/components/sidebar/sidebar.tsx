'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { NAV_ITEMS } from './nav-items';
import { NavItem } from './nav-item';
import { SpaceSwitcher } from './space-switcher';

export function Sidebar() {
  const { collapsed, toggleCollapsed, drawerOpen, closeDrawer } = useSidebarStore();
  const pathname = usePathname();

  // Escape key closes drawer
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
      {/* Space switcher at top */}
      <div className="border-b border-[var(--rule)]">
        <SpaceSwitcher />
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.includes(item.href.replace('/[lang]', '')) ?? false;
          return (
            <NavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={active}
              onClick={closeDrawer}
            />
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--rule)] p-2">
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-[var(--forest-bg)] hover:text-[var(--forest)] text-[var(--ink)]/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: always visible, driven by AppShell grid */}
      <div className="hidden md:block h-full">{sidebarContent}</div>

      {/* Mobile: drawer */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            data-testid="sidebar-overlay"
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--ink)]/40 z-30 md:hidden"
            onClick={closeDrawer}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-40 w-60 md:hidden">{sidebarContent}</div>
        </>
      )}
    </>
  );
}
