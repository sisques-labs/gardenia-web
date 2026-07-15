import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  http: {
    post: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { http } from '@/shared/infrastructure/http/axios.client';
import { PlantIdentificationGqlRepository } from './plant-identification.gql.repository';
import { PLANT_IDENTIFICATIONS } from './queries/plant-identifications.query';
import { CREATE_PLANT_FROM_IDENTIFICATION } from './mutations/create-plant-from-identification.mutation';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [{ scientificName: 'Monstera deliciosa', commonNames: ['Swiss cheese plant'], score: 0.92 }],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

describe('PlantIdentificationGqlRepository', () => {
  let repository: PlantIdentificationGqlRepository;

  beforeEach(() => {
    repository = new PlantIdentificationGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('PLANT_IDENTIFICATIONS is a valid GQL document', () => {
      expect((PLANT_IDENTIFICATIONS as DocumentNode).kind).toBe('Document');
    });

    it('CREATE_PLANT_FROM_IDENTIFICATION is a valid GQL document', () => {
      expect((CREATE_PLANT_FROM_IDENTIFICATION as DocumentNode).kind).toBe('Document');
    });
  });

  describe('identify()', () => {
    it('POSTs a multipart FormData with photos and JSON-stringified organs', async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: {
          id: 'ident-1',
          status: 'resolved',
          resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
          candidates: [],
          photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
          createdAt: '2026-07-01T10:00:00Z',
        },
      });
      const file = new File(['x'], 'leaf.png', { type: 'image/png' });

      const result = await repository.identify({ photos: [{ file, organ: 'leaf' }] });

      expect(http.post).toHaveBeenCalledWith('/plant-identifications', expect.any(FormData));
      const formData = vi.mocked(http.post).mock.calls[0][1] as FormData;
      expect(formData.get('photos')).toBe(file);
      expect(formData.get('organs')).toBe(JSON.stringify(['leaf']));
      expect(result).toEqual({
        id: 'ident-1',
        status: 'resolved',
        resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
        candidates: [],
        photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
        convertedToPlantId: null,
        createdAt: '2026-07-01T10:00:00Z',
      });
    });

    it('appends one photos entry and one organs entry per photo, in order', async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: {
          id: 'ident-1',
          status: 'no_match',
          resolved: null,
          candidates: [],
          photos: [],
          createdAt: '2026-07-01T10:00:00Z',
        },
      });
      const fileA = new File(['a'], 'a.png', { type: 'image/png' });
      const fileB = new File(['b'], 'b.png', { type: 'image/png' });

      await repository.identify({
        photos: [
          { file: fileA, organ: 'leaf' },
          { file: fileB, organ: 'flower' },
        ],
      });

      const formData = vi.mocked(http.post).mock.calls[0][1] as FormData;
      expect(formData.getAll('photos')).toEqual([fileA, fileB]);
      expect(formData.get('organs')).toBe(JSON.stringify(['leaf', 'flower']));
    });

    it('propagates errors from http.post', async () => {
      vi.mocked(http.post).mockRejectedValue(new Error('Provider unavailable'));
      const file = new File(['x'], 'leaf.png', { type: 'image/png' });

      await expect(repository.identify({ photos: [{ file, organ: 'leaf' }] })).rejects.toThrow(
        'Provider unavailable',
      );
    });
  });

  describe('findByCriteria()', () => {
    it('calls apolloClient.query with PLANT_IDENTIFICATIONS and returns items/total', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { plantIdentifications: { items: [mockIdentification], total: 1 } },
      } as never);

      const result = await repository.findByCriteria('space-1', 1, 5);

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: PLANT_IDENTIFICATIONS,
        variables: { input: { spaceId: 'space-1', pagination: { page: 1, perPage: 5 } } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual({ items: [mockIdentification], total: 1 });
    });

    it('returns empty items when data is missing', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({ data: undefined } as never);

      const result = await repository.findByCriteria('space-1', 1, 5);
      expect(result).toEqual({ items: [], total: 0 });
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.findByCriteria('space-1', 1, 5)).rejects.toThrow('Network error');
    });
  });

  describe('createPlantFromIdentification()', () => {
    it('calls apolloClient.mutate with CREATE_PLANT_FROM_IDENTIFICATION and returns just the created id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { createPlantFromIdentification: { id: 'plant-1' } },
      } as never);

      const result = await repository.createPlantFromIdentification({
        identificationId: 'ident-1',
        name: 'My Monstera',
      });

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CREATE_PLANT_FROM_IDENTIFICATION,
        variables: { input: { identificationId: 'ident-1', name: 'My Monstera' } },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'plant-1' });
    });

    it('throws when the response has no id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({ data: undefined } as never);

      await expect(
        repository.createPlantFromIdentification({ identificationId: 'ident-1', name: 'My Monstera' }),
      ).rejects.toThrow('createPlantFromIdentification mutation failed');
    });

    it('propagates errors from apolloClient.mutate', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Network error'));
      await expect(
        repository.createPlantFromIdentification({ identificationId: 'ident-1', name: 'My Monstera' }),
      ).rejects.toThrow('Network error');
    });
  });
});
