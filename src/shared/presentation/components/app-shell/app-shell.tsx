'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { Sidebar } from '../sidebar/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { collapsed, openDrawer } = useSidebarStore();
  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
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
  );
}
