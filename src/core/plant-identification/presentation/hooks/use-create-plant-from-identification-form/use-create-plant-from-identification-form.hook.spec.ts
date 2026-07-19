import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreatePlantFromIdentificationForm } from './use-create-plant-from-identification-form.hook';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const identification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const mockMutate = vi.fn();

vi.mock(
  '@/core/plant-identification/presentation/hooks/use-create-plant-from-identification/use-create-plant-from-identification.hook',
  () => ({
    useCreatePlantFromIdentification: () => ({ mutate: mockMutate, isPending: false, error: null }),
  }),
);

describe('useCreatePlantFromIdentificationForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it('submits the typed name and identification id to the mutation', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreatePlantFromIdentificationForm(identification, onSuccess));

    act(() => {
      result.current.form.setValue('name', 'My Monstera');
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { identificationId: 'ident-1', name: 'My Monstera' },
      expect.anything(),
    );
  });

  it('calls onSuccess with the created plant id when the mutation succeeds', async () => {
    mockMutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 'plant-99' });
    });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreatePlantFromIdentificationForm(identification, onSuccess));

    act(() => {
      result.current.form.setValue('name', 'My Monstera');
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(onSuccess).toHaveBeenCalledWith('plant-99');
  });

  it('exposes isPending/error from the underlying mutation', () => {
    const { result } = renderHook(() =>
      useCreatePlantFromIdentificationForm(identification, vi.fn()),
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
