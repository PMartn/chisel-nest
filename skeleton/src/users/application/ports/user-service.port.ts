import { User } from '../../domain/models/user.model';
import { CreateUserCommand } from '../dto/create-user.command';

export abstract class UserServicePort {
  abstract create(command: CreateUserCommand): Promise<User>;
  abstract findById(id: string): Promise<User>;
  abstract findAll(): Promise<User[]>;
}
