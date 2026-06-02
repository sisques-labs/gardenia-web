import { http } from '@/shared/infrastructure/http/axios.client';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

interface PlantsListResponse {
  items: Plant[];
  total: number;
  page: number;
  perPage: number;
}

export class PlantsHttpRepository implements IPlantsRepository {
  async list(): Promise<Plant[]> {
    const res = await http.get<PlantsListResponse>('/plants');
    return res.data.items;
  }

  async getById(id: string): Promise<Plant> {
    const res = await http.get<Plant>(`/plants/${id}`);
    return res.data;
  }
}

export const plantsHttpRepository = new PlantsHttpRepository();
