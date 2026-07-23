import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type __PASCAL_NAME__Document = __PASCAL_NAME__Doc & Document;

@Schema({ collection: "__PLURAL_KEBAB__", timestamps: true })
export class __PASCAL_NAME__Doc {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const __PASCAL_NAME__Schema =
  SchemaFactory.createForClass(__PASCAL_NAME__Doc);
