import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook',
  () => ({ useUpdatePlantingSpot: vi.fn() }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn().mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    }),
  };
});

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn().mockReturnValue(vi.fn()),
}));

import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useEditPlantingSpotForm } from './use-edit-planting-spot-form.hook';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'Nice bed',
  capacity: 5,
  row: 1,
  column: 2,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: null,
  userId: 'u1',
  spaceId: 's1',
  status: 'ACTIVE',
  fallowSince: null,
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const formValues = {
  name: 'Updated Bed',
  type: 'RAISED_BED' as const,
  description: 'A description',
  capacity: null,
  row: null,
  column: null,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: '',
};

describe('useEditPlantingSpotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as never);
  });

  it('calls updatePlantingSpot.mutate with the spot id, normalized values, and onClose as onSuccess', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useEditPlantingSpotForm(mockSpot, onClose));

    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)(formValues);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'spot-1', name: 'Updated Bed' }),
      expect.objectContaining({ onSuccess: onClose }),
    );
  });

  it('converts an empty description to null', () => {
    const { result } = renderHook(() => useEditPlantingSpotForm(mockSpot, vi.fn()));
    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)({ ...formValues, description: '' });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
      expect.any(Object),
    );
  });

  it('converts an empty soilType to null', () => {
    const { result } = renderHook(() => useEditPlantingSpotForm(mockSpot, vi.fn()));
    act(() => {
      (result.current.onSubmit as unknown as (v: typeof formValues) => void)({ ...formValues, soilType: '' });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ soilType: null }),
      expect.any(Object),
    );
  });

  it('exposes isPending from the mutation', () => {
    vi.mocked(useUpdatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as never);
    const { result } = renderHook(() => useEditPlantingSpotForm(mockSpot, vi.fn()));
    expect(result.current.isPending).toBe(true);
  });

  it('exposes error from the mutation', () => {
    const err = new Error('boom');
    vi.mocked(useUpdatePlantingSpot).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: err,
    } as never);
    const { result } = renderHook(() => useEditPlantingSpotForm(mockSpot, vi.fn()));
    expect(result.current.error).toBe(err);
  });
});
