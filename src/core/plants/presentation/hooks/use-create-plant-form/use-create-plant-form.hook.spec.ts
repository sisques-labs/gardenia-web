import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockCreatePlant = vi.hoisted(() => vi.fn());
const mockUseCreatePlant = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/presentation/hooks/use-create-plant/use-create-plant.hook', () => ({
  useCreatePlant: (...args: unknown[]) => mockUseCreatePlant(...args),
}));

import { useCreatePlantForm } from './use-create-plant-form.hook';

describe('useCreatePlantForm', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreatePlant.mockReturnValue({ mutate: mockCreatePlant, isPending: false, error: null });
  });

  it('submits the plant name and closes on success', async () => {
    mockCreatePlant.mockImplementation((_input, { onSuccess }: { onSuccess: () => void }) => onSuccess());
    const { result } = renderHook(() => useCreatePlantForm('space-1', onClose));

    act(() => {
      result.current.form.setValue('name', 'Basil');
    });

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => undefined } as unknown as React.BaseSyntheticEvent);
    });

    await waitFor(() =>
      expect(mockCreatePlant).toHaveBeenCalledWith(
        { name: 'Basil', imageUrl: undefined },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      ),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call createPlant when the name is missing', async () => {
    const { result } = renderHook(() => useCreatePlantForm('space-1', onClose));

    await act(async () => {
      result.current.onSubmit({ preventDefault: () => undefined } as unknown as React.BaseSyntheticEvent);
    });

    expect(mockCreatePlant).not.toHaveBeenCalled();
  });

  it('exposes pending and error state from the underlying mutation', () => {
    mockUseCreatePlant.mockReturnValue({ mutate: mockCreatePlant, isPending: true, error: new Error('oops') });
    const { result } = renderHook(() => useCreatePlantForm('space-1', onClose));

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
