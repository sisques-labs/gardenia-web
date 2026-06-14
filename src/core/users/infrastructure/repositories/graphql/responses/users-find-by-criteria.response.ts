import type { User } from '@/core/users/domain/interfaces/user.interface';

export interface UsersFindByCriteriaResponse {
  usersFindByCriteria: {
    items: User[];
    total: number;
  };
}
