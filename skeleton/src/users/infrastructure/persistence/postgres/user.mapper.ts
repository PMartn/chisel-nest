import { User } from '../../../domain/models/user.model';
import { UserEntity } from './user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User(entity.id, entity.email, entity.name, entity.createdAt);
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
