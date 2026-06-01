import { http } from '@/shared/infrastructure/http/axios.client';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export class SpacesHttpRepository implements ISpacesRepository {
  async listByUser(): Promise<Space[]> {
    const res = await http.get<Space[]>('/spaces');
    return res.data;
  }

  async create(name: string): Promise<Space> {
    const res = await http.post<Space>('/spaces', { name });
    return res.data;
  }
}

export const spacesHttpRepository = new SpacesHttpRepository();
