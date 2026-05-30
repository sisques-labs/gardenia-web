import { DomainEvent } from '@/core/shared/domain/domain-event.interface';

export interface UserRegisteredEvent extends DomainEvent {
  readonly type: 'auth.user_registered';
  readonly spaceId: string;
}
