import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';
import type { SpaceInvitation, InvitationRole } from '@/core/spaces/domain/interfaces/space-invitation.interface';

export interface CreateInvitationInput {
  spaceId: string;
  role?: InvitationRole;
  expiresAt?: Date;
}

export interface MemberInput {
  spaceId: string;
  targetUserId: string;
}

export interface ISpacesRepository {
  listByUser(): Promise<Space[]>;
  create(name: string): Promise<Space>;
  acceptInvitation(code: string): Promise<string>;
  findById(spaceId: string): Promise<SpaceDetail>;
  createInvitation(input: CreateInvitationInput): Promise<SpaceInvitation>;
  addMember(input: MemberInput): Promise<void>;
  removeMember(input: MemberInput): Promise<void>;
}
