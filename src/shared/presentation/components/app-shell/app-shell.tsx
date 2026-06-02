'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useSidebar } from '../sidebar/sidebar.context';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <div
      data-testid="app-shell"
      className="grid h-screen md:grid-cols-[var(--sidebar-width)_1fr] grid-cols-[1fr] transition-[grid-template-columns]"
      style={{ '--sidebar-width': sidebarWidth } as CSSProperties}
    >
      <aside className="hidden md:block border-r border-[var(--rule)] bg-[var(--paper)]" />
      <main className="overflow-y-auto bg-[var(--paper)]">
        {children}
      </main>
    </div>
  );
}
