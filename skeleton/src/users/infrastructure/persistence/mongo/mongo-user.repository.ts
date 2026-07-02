import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from '../../../domain/ports/user-repository.port';
import { User } from '../../../domain/models/user.model';
import { UserDoc, UserDocument } from './user.schema';
import { UserMapper } from './user.mapper';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDoc.name)
    private readonly model: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(user);
    const savedDoc = await this.model.findOneAndUpdate(
      { id: user.id },
      persistenceModel,
      { upsert: true, new: true },
    );
    return UserMapper.toDomain(savedDoc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
}
