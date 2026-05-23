import { UUIDValueObject } from '@/shared/domain/value-objects/uuid/uuid.vo';

export interface IUser {
  id: UUIDValueObject;
  email: string;
  password: string;
}
