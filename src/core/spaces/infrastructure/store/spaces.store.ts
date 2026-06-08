import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export interface SpacesState {
  availableSpaces: Space[];
  currentSpaceId: string | null;
  isResolved: boolean;
  setSpaces: (spaces: Space[]) => void;
  setActiveSpace: (spaceId: string) => void;
  resolveActiveSpace: (spaces: Space[], storedId: string | null) => void;
  clear: () => void;
}

export const useSpacesStore = create<SpacesState>()(
  persist(
    (set, get) => ({
      availableSpaces: [],
      currentSpaceId: null,
      isResolved: false,
      setSpaces: (spaces) => set({ availableSpaces: spaces }),
      setActiveSpace: (spaceId) => set({ currentSpaceId: spaceId }),
      resolveActiveSpace: (spaces, storedId) => {
        const valid = storedId && spaces.some((s) => s.id === storedId);
        if (valid) {
          set({ currentSpaceId: storedId, isResolved: true });
          return;
        }
        const pending = storedId && get().availableSpaces.some((s) => s.id === storedId);
        set({
          currentSpaceId: pending ? storedId : (spaces[0]?.id ?? null),
          isResolved: true,
        });
      },
      clear: () => set({ availableSpaces: [], currentSpaceId: null, isResolved: false }),
    }),
    {
      name: 'gardenia.activeSpaceId',
      partialize: (s) => ({ currentSpaceId: s.currentSpaceId }),
    }
  )
);

export const currentSpace = () => {
  const { availableSpaces, currentSpaceId } = useSpacesStore.getState();
  return availableSpaces.find((s) => s.id === currentSpaceId) ?? null;
};
