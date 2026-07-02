import { describe, it, expect, vi } from 'vitest';
import { GetSpaceWeatherUseCase } from './get-space-weather.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';

const mockWeather: SpaceWeather = {
  latitude: 40.4,
  longitude: -3.7,
  timezone: 'Europe/Madrid',
  daily: [
    {
      date: '2026-06-18',
      temperatureMin: 15,
      temperatureMax: 28,
      precipitationSum: 0,
      weatherCode: 0,
    },
  ],
};

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
  getInvitationPreview: vi.fn(),
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getSpaceWeather: vi.fn(),
  update: vi.fn(),
};

describe('GetSpaceWeatherUseCase', () => {
  it('returns SpaceWeather from repository', async () => {
    vi.mocked(mockRepository.getSpaceWeather).mockResolvedValue(mockWeather);

    const useCase = new GetSpaceWeatherUseCase(mockRepository);
    const result = await useCase.execute('space-1');

    expect(mockRepository.getSpaceWeather).toHaveBeenCalledWith('space-1');
    expect(result).toEqual(mockWeather);
  });

  it('returns null when repository has no weather data', async () => {
    vi.mocked(mockRepository.getSpaceWeather).mockResolvedValue(null);

    const useCase = new GetSpaceWeatherUseCase(mockRepository);
    const result = await useCase.execute('space-1');

    expect(result).toBeNull();
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.getSpaceWeather).mockRejectedValue(new Error('Weather unavailable'));

    const useCase = new GetSpaceWeatherUseCase(mockRepository);
    await expect(useCase.execute('space-1')).rejects.toThrow('Weather unavailable');
  });
});
