import { useQuery } from '@tanstack/react-query';
import { ListSpacesUseCase } from '@/core/spaces/application/use-cases/list-spaces/list-spaces.use-case';
import { spacesGqlRepository as spacesHttpRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const listSpacesUseCase = new ListSpacesUseCase(spacesHttpRepository);

export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: () => listSpacesUseCase.execute(),
  });
}
