'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { Sidebar } from '../sidebar/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
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
            <Sidebar inDrawer />
          </div>
        </>
      )}

      <div
        data-testid="app-shell"
        className="grid h-screen md:grid-cols-[var(--sidebar-width)_1fr] grid-cols-[1fr] transition-[grid-template-columns]"
        style={{ '--sidebar-width': sidebarWidth } as CSSProperties}
      >
        <aside className="hidden md:block">
          <Sidebar />
        </aside>
        <main className="overflow-y-auto paper-grain">
          {/* Mobile hamburger — only visible below md */}
          <div className="md:hidden flex items-center px-4 py-3 border-b border-[var(--rule)]">
            <button
              onClick={openDrawer}
              aria-label="Open navigation"
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
