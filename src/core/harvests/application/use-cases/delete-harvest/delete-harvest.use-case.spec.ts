import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteHarvestUseCase } from './delete-harvest.use-case';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';

const mockRepository: IHarvestsRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('DeleteHarvestUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo and resolves void', async () => {
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    const useCase = new DeleteHarvestUseCase(mockRepository);

    const result = await useCase.execute('harvest-1');

    expect(result).toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledOnce();
    expect(mockRepository.delete).toHaveBeenCalledWith('harvest-1');
  });

  it('propagates rejection', async () => {
    vi.mocked(mockRepository.delete).mockRejectedValue(new Error('Harvest not found: harvest-99'));
    const useCase = new DeleteHarvestUseCase(mockRepository);

    await expect(useCase.execute('harvest-99')).rejects.toThrow('Harvest not found: harvest-99');
  });
});
