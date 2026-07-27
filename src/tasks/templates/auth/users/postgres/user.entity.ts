import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { Role } from '../../../../auth/domain/role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @Column('simple-array')
  roles!: Role[];

  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
