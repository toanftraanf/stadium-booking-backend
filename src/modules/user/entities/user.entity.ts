import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  OWNER = 'owner',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  phoneNumber: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifyCode?: string;

  @Column({ nullable: true, type: 'timestamp' })
  verifyCodeExpiresAt?: Date;

  @Field(() => UserStatus)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  avatarPublicId?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
