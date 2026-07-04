import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockMutate = vi.hoisted(() => vi.fn());
const mockUseDeletePlant = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook', () => ({
  useDeletePlant: (...args: unknown[]) => mockUseDeletePlant(...args),
}));

import { useDeletePlantConfirm } from './use-delete-plant-confirm.hook';

const plant = { id: 'plant-1', name: 'Basil' } as Plant;

describe('useDeletePlantConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeletePlant.mockReturnValue({ mutate: mockMutate, isError: false });
  });

  it('starts with no plant pending deletion', () => {
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    expect(result.current.plantToDelete).toBeNull();
  });

  it('requests deletion of a plant', () => {
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    act(() => {
      result.current.requestDelete(plant);
    });

    expect(result.current.plantToDelete).toEqual(plant);
  });

  it('cancels the pending deletion', () => {
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    act(() => {
      result.current.requestDelete(plant);
      result.current.cancelDelete();
    });

    expect(result.current.plantToDelete).toBeNull();
  });

  it('does nothing when confirming without a pending plant', () => {
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    act(() => {
      result.current.confirmDelete();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('confirms deletion and clears the pending plant on settle', () => {
    mockMutate.mockImplementation((_id, { onSettled }: { onSettled: () => void }) => onSettled());
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    act(() => {
      result.current.requestDelete(plant);
    });
    act(() => {
      result.current.confirmDelete();
    });

    expect(mockMutate).toHaveBeenCalledWith('plant-1', expect.objectContaining({ onSettled: expect.any(Function) }));
    expect(result.current.plantToDelete).toBeNull();
  });

  it('exposes the error state from the underlying mutation', () => {
    mockUseDeletePlant.mockReturnValue({ mutate: mockMutate, isError: true });
    const { result } = renderHook(() => useDeletePlantConfirm('space-1'));

    expect(result.current.isError).toBe(true);
  });
});
