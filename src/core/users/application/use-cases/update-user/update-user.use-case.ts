import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { UpdateUserInput } from '@/core/users/application/interfaces/update-user-input.interface';

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    return this.usersRepository.update(input);
  }
}
