import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { UpdateUserInput } from '@/core/users/application/interfaces/update-user-input.interface';
import type { User } from '@/core/users/domain/interfaces/user.interface';
import { USER_FIND_BY_ID } from './queries/user-find-by-id.query';
import { USER_UPDATE } from './mutations/user-update.mutation';
import type { UserFindByIdResponse } from './responses/user-find-by-id.response';

export class UsersGqlRepository implements IUsersRepository {
  async getById(id: string): Promise<User> {
    const res = await apolloClient.query<UserFindByIdResponse>({
      query: USER_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.userFindById) throw new Error(`User not found: ${id}`);
    return res.data.userFindById;
  }

  async update(input: UpdateUserInput): Promise<void> {
    await apolloClient.mutate({
      mutation: USER_UPDATE,
      variables: { input },
    });
  }
}

export const usersGqlRepository = new UsersGqlRepository();
