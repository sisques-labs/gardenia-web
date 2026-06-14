import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';
import type { CreateInvitationInput } from '@/core/spaces/application/interfaces/create-invitation-input.interface';
import type { MemberInput } from '@/core/spaces/application/interfaces/member-input.interface';

export type { CreateInvitationInput, MemberInput };

export interface ISpacesRepository {
  listByUser(): Promise<Space[]>;
  create(name: string): Promise<Space>;
  acceptInvitation(code: string): Promise<string>;
  findById(spaceId: string): Promise<SpaceDetail>;
  createInvitation(input: CreateInvitationInput): Promise<SpaceInvitation>;
  addMember(input: MemberInput): Promise<void>;
  removeMember(input: MemberInput): Promise<void>;
}
