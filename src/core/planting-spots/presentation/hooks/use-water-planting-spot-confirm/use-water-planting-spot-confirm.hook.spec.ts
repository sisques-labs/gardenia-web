import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';

const mockMutate = vi.fn();

vi.mock('@/core/planting-spots/presentation/hooks/use-water-planting-spot/use-water-planting-spot.hook', () => ({
  useWaterPlantingSpot: vi.fn(),
}));

import { useWaterPlantingSpot } from '@/core/planting-spots/presentation/hooks/use-water-planting-spot/use-water-planting-spot.hook';
import { useWaterPlantingSpotConfirm } from './use-water-planting-spot-confirm.hook';

describe('useWaterPlantingSpotConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);
  });

  it('starts closed with no result', () => {
    const { result } = renderHook(() => useWaterPlantingSpotConfirm('spot-1'));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.result).toBeNull();
  });

  it('opens the dialog on requestWater', () => {
    const { result } = renderHook(() => useWaterPlantingSpotConfirm('spot-1'));

    act(() => result.current.requestWater());

    expect(result.current.isOpen).toBe(true);
  });

  it('closes the dialog on cancelWater', () => {
    const { result } = renderHook(() => useWaterPlantingSpotConfirm('spot-1'));

    act(() => result.current.requestWater());
    act(() => result.current.cancelWater());

    expect(result.current.isOpen).toBe(false);
  });

  it('calls mutate with the spot id on confirmWater, storing the result and closing on settle', () => {
    const successResult: WaterPlantingSpotResult = {
      plantingSpotId: 'spot-1',
      wateredPlantIds: ['p1'],
      failedPlants: [],
    };
    mockMutate.mockImplementation((_vars, options) => {
      options?.onSuccess?.(successResult);
      options?.onSettled?.();
    });

    const { result } = renderHook(() => useWaterPlantingSpotConfirm('spot-1'));
    act(() => result.current.requestWater());
    act(() => result.current.confirmWater());

    expect(mockMutate).toHaveBeenCalledWith(
      { id: 'spot-1' },
      expect.objectContaining({ onSuccess: expect.any(Function), onSettled: expect.any(Function) }),
    );
    expect(result.current.result).toEqual(successResult);
    expect(result.current.isOpen).toBe(false);
  });

  it('exposes isPending and isError from the underlying mutation', () => {
    vi.mocked(useWaterPlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: true,
    } as unknown as ReturnType<typeof useWaterPlantingSpot>);

    const { result } = renderHook(() => useWaterPlantingSpotConfirm('spot-1'));

    expect(result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(true);
  });
});
