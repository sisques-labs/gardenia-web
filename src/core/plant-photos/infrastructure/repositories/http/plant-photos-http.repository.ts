import { http } from '@/shared/infrastructure/http/axios.client';
import type { IPlantPhotosRepository } from '@/core/plant-photos/application/ports/plant-photos.repository.port';
import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

export class PlantPhotosHttpRepository implements IPlantPhotosRepository {
  async listByPlant(plantId: string): Promise<PlantPhoto[]> {
    const res = await http.get<{ items: PlantPhoto[] }>('/plant-photos', {
      params: { plantId, limit: 100 },
    });
    return res.data.items;
  }

  async upload(plantId: string, file: File): Promise<PlantPhoto> {
    const formData = new FormData();
    formData.append('plantId', plantId);
    formData.append('file', file);
    const res = await http.post<PlantPhoto>('/plant-photos', formData);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await http.delete(`/plant-photos/${id}`);
  }
}

export const plantPhotosHttpRepository = new PlantPhotosHttpRepository();
