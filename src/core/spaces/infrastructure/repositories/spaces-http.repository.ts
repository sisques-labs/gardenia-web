import { gql } from '@apollo/client';
import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export const SPACES_FIND_BY_USER = gql`
  query SpacesFindByUser {
    spacesFindByUser {
      id
      name
      ownerId
      createdAt
    }
  }
`;

export const SPACE_CREATE = gql`
  mutation SpaceCreate($name: String!) {
    spaceCreate(name: $name) {
      id
      name
      ownerId
      createdAt
    }
  }
`;

interface SpacesFindByUserData {
  spacesFindByUser: Space[];
}

interface SpaceCreateData {
  spaceCreate: Space;
}

export class SpacesHttpRepository implements ISpacesRepository {
  async listByUser(): Promise<Space[]> {
    const res = await apolloClient.query<SpacesFindByUserData>({ query: SPACES_FIND_BY_USER });
    return res.data?.spacesFindByUser ?? [];
  }

  async create(name: string): Promise<Space> {
    const res = await apolloClient.mutate<SpaceCreateData>({ mutation: SPACE_CREATE, variables: { name } });
    if (!res.data) throw new Error('spaceCreate mutation returned no data');
    return res.data.spaceCreate;
  }
}

export const spacesHttpRepository = new SpacesHttpRepository();
