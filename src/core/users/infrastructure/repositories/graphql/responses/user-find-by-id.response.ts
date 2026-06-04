import type { User } from '@/core/users/domain/interfaces/user.interface';

export interface UserFindByIdResponse {
  userFindById: User | null;
}
