import { describe, it, expect, vi } from 'vitest';
import { GetSpaceDetailUseCase } from './get-space-detail.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';

const mockDetail: SpaceDetail = {
  id: 'space-1',
  name: 'My Garden',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getSpaceWeather: vi.fn(),
  updateGeolocation: vi.fn(),
};

describe('GetSpaceDetailUseCase', () => {
  it('returns SpaceDetail from repository', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockDetail);

    const useCase = new GetSpaceDetailUseCase(mockRepository);
    const result = await useCase.execute('space-1');

    expect(mockRepository.findById).toHaveBeenCalledWith('space-1');
    expect(result).toEqual(mockDetail);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Space not found'));

    const useCase = new GetSpaceDetailUseCase(mockRepository);
    await expect(useCase.execute('space-x')).rejects.toThrow('Space not found');
  });
});
