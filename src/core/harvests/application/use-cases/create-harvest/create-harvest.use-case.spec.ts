import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateHarvestUseCase } from './create-harvest.use-case';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import type { CreateHarvestInput } from '@/core/harvests/application/interfaces/create-harvest-input.interface';

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

const createInput: CreateHarvestInput = {
  cropType: 'Tomato',
  quantity: 5,
  unit: 'KG',
  harvestedAt: '2024-06-01',
};

const mockRepository: IHarvestsRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CreateHarvestUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repo and returns created harvest', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(mockHarvest);
    const useCase = new CreateHarvestUseCase(mockRepository);

    const result = await useCase.execute(createInput);

    expect(result).toEqual(mockHarvest);
    expect(mockRepository.create).toHaveBeenCalledOnce();
    expect(mockRepository.create).toHaveBeenCalledWith(createInput);
  });

  it('does NOT perform field validation', async () => {
    const minimalInput = { cropType: '', quantity: 0, unit: 'KG' as const, harvestedAt: '' };
    vi.mocked(mockRepository.create).mockResolvedValue({ ...mockHarvest, ...minimalInput });
    const useCase = new CreateHarvestUseCase(mockRepository);

    const result = await useCase.execute(minimalInput);

    expect(mockRepository.create).toHaveBeenCalledWith(minimalInput);
    expect(result).toBeDefined();
  });
});
