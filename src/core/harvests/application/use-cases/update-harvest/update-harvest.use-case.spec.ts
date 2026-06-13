import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateHarvestUseCase } from './update-harvest.use-case';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';

const mockHarvest: Harvest = {
  id: 'harvest-1',
  cropType: 'Tomato Updated',
  quantity: 10,
  unit: 'KG',
  harvestedAt: '2024-06-05',
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2024-06-01',
  updatedAt: '2024-06-05',
};

const updateInput: UpdateHarvestInput = {
  id: 'harvest-1',
  cropType: 'Tomato Updated',
  quantity: 10,
};

const mockRepository: IHarvestsRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('UpdateHarvestUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo and returns updated harvest', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(mockHarvest);
    const useCase = new UpdateHarvestUseCase(mockRepository);

    const result = await useCase.execute(updateInput);

    expect(result).toEqual(mockHarvest);
    expect(mockRepository.update).toHaveBeenCalledOnce();
    expect(mockRepository.update).toHaveBeenCalledWith(updateInput);
  });

  it('propagates not-found rejection', async () => {
    vi.mocked(mockRepository.update).mockRejectedValue(new Error('Harvest not found: harvest-99'));
    const useCase = new UpdateHarvestUseCase(mockRepository);

    await expect(useCase.execute({ id: 'harvest-99' })).rejects.toThrow('Harvest not found: harvest-99');
  });
});
