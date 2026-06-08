import { describe, it, expect, beforeEach } from 'vitest';
import { useSpacesStore } from './spaces.store';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const existingSpace: Space = {
  id: 'space-1',
  name: 'Garden',
  ownerId: 'user-1',
  createdAt: '2024-01-01',
};

const newSpace: Space = {
  id: 'space-new',
  name: 'New Garden',
  ownerId: 'user-1',
  createdAt: '2024-01-02',
};

describe('useSpacesStore resolveActiveSpace', () => {
  beforeEach(() => {
    useSpacesStore.getState().clear();
  });

  it('keeps stored id when it exists in fetched spaces', () => {
    useSpacesStore.getState().setActiveSpace('space-1');
    useSpacesStore.getState().resolveActiveSpace([existingSpace], 'space-1');
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-1');
  });

  it('keeps stored id when it is only in availableSpaces (pending sync)', () => {
    useSpacesStore.getState().setSpaces([existingSpace, newSpace]);
    useSpacesStore.getState().setActiveSpace('space-new');
    useSpacesStore.getState().resolveActiveSpace([existingSpace], 'space-new');
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-new');
  });

  it('falls back to first space when stored id is unknown', () => {
    useSpacesStore.getState().resolveActiveSpace([existingSpace], 'unknown');
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-1');
  });
});
