import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserDoc & Document;

@Schema({ collection: 'users', timestamps: true })
export class UserDoc {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDoc);
