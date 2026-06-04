import { useQuery } from '@tanstack/react-query';
import { GetUserUseCase } from '@/core/users/application/use-cases/get-user/get-user.use-case';
import { UsersGqlRepository } from '@/core/users/infrastructure/repositories/graphql/users.gql.repository';

const getUserUseCase = new GetUserUseCase(new UsersGqlRepository());

export function useUser(id: string | null | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserUseCase.execute(id!),
    enabled: !!id,
  });
}
