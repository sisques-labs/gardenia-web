import { describe, it, expect, vi } from 'vitest';
import { UpdateSpaceGeolocationUseCase } from './update-space-geolocation.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';

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

const input = {
  spaceId: 'space-1',
  latitude: 40.4,
  longitude: -3.7,
  environment: 'OUTDOOR' as const,
};

describe('UpdateSpaceGeolocationUseCase', () => {
  it('delegates to repository.updateGeolocation', async () => {
    vi.mocked(mockRepository.updateGeolocation).mockResolvedValue(undefined);

    const useCase = new UpdateSpaceGeolocationUseCase(mockRepository);
    await useCase.execute(input);

    expect(mockRepository.updateGeolocation).toHaveBeenCalledWith(input);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.updateGeolocation).mockRejectedValue(new Error('Update failed'));

    const useCase = new UpdateSpaceGeolocationUseCase(mockRepository);
    await expect(useCase.execute(input)).rejects.toThrow('Update failed');
  });
});
