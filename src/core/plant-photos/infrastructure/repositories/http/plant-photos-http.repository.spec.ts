import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/axios.client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: null,
      isBootComplete: false,
      clearAuth: vi.fn(),
      setBootComplete: vi.fn(),
      setAccessToken: vi.fn(),
      setCurrentUser: vi.fn(),
      currentUser: null,
    })),
  },
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: { getState: vi.fn(() => ({ currentSpaceId: null })) },
}));

import { http } from '@/shared/infrastructure/http/axios.client';
import { PlantPhotosHttpRepository } from './plant-photos-http.repository';

describe('PlantPhotosHttpRepository', () => {
  let repository: PlantPhotosHttpRepository;

  beforeEach(() => {
    repository = new PlantPhotosHttpRepository();
    vi.clearAllMocks();
  });

  describe('listByPlant', () => {
    it('GETs /plant-photos with plantId and returns items', async () => {
      vi.mocked(http.get).mockResolvedValue({
        data: { items: [{ id: 'ph1', plantId: 'plant-1' }] },
      });

      const result = await repository.listByPlant('plant-1');

      expect(http.get).toHaveBeenCalledWith('/plant-photos', {
        params: { plantId: 'plant-1', limit: 100 },
      });
      expect(result).toEqual([{ id: 'ph1', plantId: 'plant-1' }]);
    });
  });

  describe('upload', () => {
    it('POSTs a FormData with plantId and file', async () => {
      vi.mocked(http.post).mockResolvedValue({
        data: { id: 'ph1', plantId: 'plant-1', url: '/x' },
      });
      const file = new File(['x'], 'rose.png', { type: 'image/png' });

      const result = await repository.upload('plant-1', file);

      expect(http.post).toHaveBeenCalledWith('/plant-photos', expect.any(FormData));
      const formData = vi.mocked(http.post).mock.calls[0][1] as FormData;
      expect(formData.get('plantId')).toBe('plant-1');
      expect(formData.get('file')).toBe(file);
      expect(result).toEqual({ id: 'ph1', plantId: 'plant-1', url: '/x' });
    });

    it('propagates upload errors', async () => {
      vi.mocked(http.post).mockRejectedValue(new Error('Unsupported file type'));
      const file = new File(['x'], 'notes.txt', { type: 'text/plain' });

      await expect(repository.upload('plant-1', file)).rejects.toThrow('Unsupported file type');
    });
  });

  describe('delete', () => {
    it('DELETEs /plant-photos/:id', async () => {
      vi.mocked(http.delete).mockResolvedValue({ data: { success: true } });

      await repository.delete('ph1');

      expect(http.delete).toHaveBeenCalledWith('/plant-photos/ph1');
    });
  });
});
