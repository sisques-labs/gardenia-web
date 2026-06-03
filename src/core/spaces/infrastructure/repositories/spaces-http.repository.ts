import { gql } from '@apollo/client';
import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export const SPACES_FIND_BY_USER = gql`
  query SpacesFindByUser {
    spacesFindByUser {
      items {
        id
        name
        ownerId
        createdAt
      }
    }
  }
`;

export const SPACE_CREATE = gql`
  mutation SpaceCreate($input: SpaceCreateRequestDto!) {
    spaceCreate(input: $input) {
      id
      success
      message
    }
  }
`;

interface SpacesFindByUserData {
  spacesFindByUser: { items: Space[] };
}

interface SpaceCreateData {
  spaceCreate: { id: string; success: boolean; message: string };
}

export class SpacesHttpRepository implements ISpacesRepository {
  async listByUser(): Promise<Space[]> {
    const res = await apolloClient.query<SpacesFindByUserData>({ query: SPACES_FIND_BY_USER });
    return res.data?.spacesFindByUser?.items ?? [];
  }

  async create(name: string): Promise<Space> {
    const res = await apolloClient.mutate<SpaceCreateData>({
      mutation: SPACE_CREATE,
      variables: { input: { name } },
    });
    if (!res.data?.spaceCreate?.success) throw new Error('spaceCreate mutation failed');
    const ownerId = useAuthStore.getState().currentUser?.id ?? '';
    return {
      id: res.data.spaceCreate.id,
      name,
      ownerId,
      createdAt: new Date().toISOString(),
    };
  }
}

export const spacesHttpRepository = new SpacesHttpRepository();
