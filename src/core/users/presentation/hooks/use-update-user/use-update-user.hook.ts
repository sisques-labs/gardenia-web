import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateUserUseCase } from '@/core/users/application/use-cases/update-user/update-user.use-case';
import { usersGqlRepository } from '@/core/users/infrastructure/repositories/graphql/users.gql.repository';
import type { UpdateUserInput } from '@/core/users/application/ports/users.repository.port';

const updateUserUseCase = new UpdateUserUseCase(usersGqlRepository);

export function useUpdateUser(id: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUserUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', id] }),
  });
}
