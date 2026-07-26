import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/ports/user-repository.port';
import { User } from '../../../domain/models/user.model';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);
    const savedEntity = await this.repository.save(entity);
    return UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ email });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => UserMapper.toDomain(entity));
  }
}
