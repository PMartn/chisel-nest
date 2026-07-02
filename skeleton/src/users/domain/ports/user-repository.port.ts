import { User } from '../models/user.model';

export abstract class UserRepository {
  abstract save(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
}
