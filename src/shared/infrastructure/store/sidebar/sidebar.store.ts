import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SidebarState {
  collapsed: boolean;
  drawerOpen: boolean;
  toggleCollapsed: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      drawerOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: 'gardenia.sidebar.collapsed',
      partialize: (s) => ({ collapsed: s.collapsed }),
    }
  )
);
