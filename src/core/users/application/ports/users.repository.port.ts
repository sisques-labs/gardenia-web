import type { User } from '@/core/users/domain/interfaces/user.interface';
import type { UpdateUserInput } from '@/core/users/application/interfaces/update-user-input.interface';

export interface IUsersRepository {
  getById(id: string): Promise<User>;
  update(input: UpdateUserInput): Promise<void>;
  listSpaceMembers(): Promise<User[]>;
}
