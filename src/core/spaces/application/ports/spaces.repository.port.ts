import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export interface ISpacesRepository {
  listByUser(): Promise<Space[]>;
  create(name: string): Promise<Space>;
  acceptInvitation(code: string): Promise<string>;
}
