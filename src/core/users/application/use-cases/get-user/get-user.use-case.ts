import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { User } from '@/core/users/domain/interfaces/user.interface';

export class GetUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(id: string): Promise<User> {
    return this.usersRepository.getById(id);
  }
}
