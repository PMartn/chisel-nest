import { Injectable } from '@nestjs/common';
import { UserServicePort } from './ports/user-service.port';
import { UserRepository } from '../domain/ports/user-repository.port';
import { User } from '../domain/models/user.model';
import { CreateUserCommand } from './dto/create-user.command';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';

@Injectable()
export class UserService implements UserServicePort {
  constructor(private readonly repository: UserRepository) {}

  async create(command: CreateUserCommand): Promise<User> {
    const user = User.create({ email: command.email, name: command.name });
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }
}
