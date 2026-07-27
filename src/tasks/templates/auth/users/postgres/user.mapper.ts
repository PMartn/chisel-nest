import { User } from '../../../domain/models/user.model';
import { UserEntity } from './user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.name,
      entity.passwordHash,
      entity.roles,
      entity.hashedRefreshToken,
      entity.createdAt,
    );
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.name = domain.name;
    entity.passwordHash = domain.passwordHash;
    entity.roles = domain.roles;
    entity.hashedRefreshToken = domain.hashedRefreshToken;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
