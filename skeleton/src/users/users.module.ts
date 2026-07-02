import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRepository } from './domain/ports/user-repository.port';
import { UserEntity } from './infrastructure/persistence/postgres/user.entity';
import { PostgresUserRepository } from './infrastructure/persistence/postgres/postgres-user.repository';
import {
  UserDoc,
  UserSchema,
} from './infrastructure/persistence/mongo/user.schema';
import { MongoUserRepository } from './infrastructure/persistence/mongo/mongo-user.repository';

const UserRepositoryProvider: Provider = {
  provide: UserRepository,
  useClass: PostgresUserRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MongooseModule.forFeature([{ name: UserDoc.name, schema: UserSchema }]),
  ],
  providers: [
    PostgresUserRepository,
    MongoUserRepository,
    UserRepositoryProvider,
  ],
  exports: [UserRepository],
})
export class UsersModule {}
