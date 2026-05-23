import { IUser } from '@/core/users/domain/interfaces/user.interface';
import { UUIDValueObject } from '@/shared/domain/value-objects/uuid/uuid.vo';

export class UserEntity {
  private readonly _id: UUIDValueObject;
  private readonly _email: string;
  private readonly _password: string;

  constructor(props: IUser) {
    this._id = props.id;
    this._email = props.email;
    this._password = props.password;
  }

  get id(): UUIDValueObject {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }
}
