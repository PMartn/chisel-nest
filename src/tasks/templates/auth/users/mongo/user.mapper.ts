import { User } from '../../../domain/models/user.model';
import { UserDoc } from './user.schema';

export class UserMapper {
  static toDomain(doc: UserDoc): User {
    return new User(
      doc.id,
      doc.email,
      doc.name,
      doc.passwordHash,
      doc.roles,
      doc.createdAt,
    );
  }

  static toPersistence(domain: User): UserDoc {
    const doc = new UserDoc();
    doc.id = domain.id;
    doc.email = domain.email;
    doc.name = domain.name;
    doc.passwordHash = domain.passwordHash;
    doc.roles = domain.roles;
    doc.createdAt = domain.createdAt;
    return doc;
  }
}
