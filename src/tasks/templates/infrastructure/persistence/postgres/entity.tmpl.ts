import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("__PLURAL_KEBAB__")
export class __PASCAL_NAME__Entity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
