import type { IUsersRepository, UpdateUserInput } from '@/core/users/application/ports/users.repository.port';

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    return this.usersRepository.update(input);
  }
}
