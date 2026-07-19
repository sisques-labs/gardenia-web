import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  http: {
    post: vi.fn(),
  },
}));

import { http } from '@/shared/infrastructure/http/axios.client';
import { PlantIdentificationHttpRepository } from './plant-identification-http.repository';

describe('PlantIdentificationHttpRepository', () => {
  let repository: PlantIdentificationHttpRepository;

  beforeEach(() => {
    repository = new PlantIdentificationHttpRepository();
    vi.clearAllMocks();
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
});
