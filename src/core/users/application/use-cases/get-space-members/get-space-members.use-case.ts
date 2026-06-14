import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { User } from '@/core/users/domain/interfaces/user.interface';

export class GetSpaceMembersUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(): Promise<User[]> {
    return this.usersRepository.listSpaceMembers();
  }
}
