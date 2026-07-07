'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Sidebar } from '../sidebar/sidebar';

interface AppShellProps {
  children: ReactNode;
  dict: AppDict['shell'];
}

export function AppShell({ children, dict }: AppShellProps) {
  const { collapsed, openDrawer, drawerOpen, closeDrawer } = useSidebarStore();
  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <>
      {/* Mobile drawer — outside the grid so the aside display:none doesn't suppress the fixed panel */}
      {drawerOpen && (
        <>
          <div
            data-testid="sidebar-overlay"
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--ink)]/40 z-30 md:hidden"
            onClick={closeDrawer}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-60 md:hidden">
            <Sidebar inDrawer dict={dict} />
          </div>
        </>
      )}

      <div
        data-testid="app-shell"
        className="grid h-screen md:grid-cols-[var(--sidebar-width)_1fr] grid-cols-[1fr] transition-[grid-template-columns]"
        style={{ '--sidebar-width': sidebarWidth } as CSSProperties}
      >
        <aside className="hidden md:block">
          <Sidebar dict={dict} />
        </aside>
        <main className="overflow-y-auto paper-grain">
          {/* Mobile hamburger — only visible below md */}
          <div className="md:hidden flex h-16 items-center px-4 border-b border-[var(--rule)]">
            <button
              onClick={openDrawer}
              aria-label={dict.openNavigation}
              className="p-1 rounded-md hover:bg-[var(--forest-bg)] text-[var(--ink)]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
