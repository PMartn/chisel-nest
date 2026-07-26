import { randomUUID } from 'crypto';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: { email: string; name: string }): User {
    return new User(randomUUID(), props.email, props.name, new Date());
  }
}
