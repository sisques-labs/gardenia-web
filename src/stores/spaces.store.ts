import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Space {
  id: string;
  name: string;
}

interface SpacesState {
  availableSpaces: Space[];
  currentSpaceId: string | null;
  isLoading: boolean;
  isResolved: boolean;
  setSpaces: (spaces: Space[]) => void;
  setActiveSpace: (spaceId: string) => void;
  clear: () => void;
}

export const useSpacesStore = create<SpacesState>()(
  persist(
    (set) => ({
      availableSpaces: [],
      currentSpaceId: null,
      isLoading: false,
      isResolved: false,
      setSpaces: (spaces) => set({ availableSpaces: spaces }),
      setActiveSpace: (spaceId) => set({ currentSpaceId: spaceId }),
      clear: () =>
        set({ availableSpaces: [], currentSpaceId: null, isResolved: false }),
    }),
    {
      name: 'gardenia.activeSpaceId',
      partialize: (s) => ({ currentSpaceId: s.currentSpaceId }),
    }
  )
);
