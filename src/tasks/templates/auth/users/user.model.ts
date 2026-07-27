import { randomUUID } from 'crypto';
import { Role } from '../../../auth/domain/role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly roles: Role[],
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    email: string;
    name: string;
    passwordHash?: string;
    roles?: Role[];
  }): User {
    return new User(
      randomUUID(),
      props.email,
      props.name,
      props.passwordHash ?? '',
      props.roles ?? [Role.USER],
      new Date(),
    );
  }
}
