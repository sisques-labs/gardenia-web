import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetHarvestUseCase } from './get-harvest.use-case';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

const mockHarvest: Harvest = {
  id: 'harvest-1',
  cropType: 'Tomato',
  quantity: 5,
  unit: 'KG',
  harvestedAt: '2024-06-01',
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2024-06-01',
  updatedAt: '2024-06-01',
};

const mockRepository: IHarvestsRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetHarvestUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns single harvest from repository', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockHarvest);
    const useCase = new GetHarvestUseCase(mockRepository);

    const result = await useCase.execute('harvest-1');

    expect(result).toEqual(mockHarvest);
    expect(mockRepository.findById).toHaveBeenCalledOnce();
    expect(mockRepository.findById).toHaveBeenCalledWith('harvest-1');
  });

  it('propagates not-found rejection', async () => {
    vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Harvest not found: harvest-99'));
    const useCase = new GetHarvestUseCase(mockRepository);

    await expect(useCase.execute('harvest-99')).rejects.toThrow('Harvest not found: harvest-99');
  });
});
