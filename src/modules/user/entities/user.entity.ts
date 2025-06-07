import { ObjectType, Field, registerEnumType, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
} from 'typeorm';
import { UserFavoriteSport } from '../../sport/entities/user-favorite-sport.entity';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export enum UserSex {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum UserType {
  PLAYER = 'player',
  COACH = 'coach',
}

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PRO = 'pro',
}

registerEnumType(UserStatus, { name: 'UserStatus' });
registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserSex, { name: 'UserSex' });
registerEnumType(UserType, { name: 'UserType' });
registerEnumType(UserLevel, { name: 'UserLevel' });

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

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

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Field(() => UserStatus)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  avatarId?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  dob?: Date;

  @Field(() => UserSex, { nullable: true })
  @Column({ type: 'enum', enum: UserSex, nullable: true })
  sex?: UserSex;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field(() => UserType, { nullable: true })
  @Column({ type: 'enum', enum: UserType, nullable: true })
  userType?: UserType;

  @Field(() => UserLevel, { nullable: true })
  @Column({ type: 'enum', enum: UserLevel, nullable: true })
  level?: UserLevel;

  @Field(() => [UserFavoriteSport])
  @OneToMany(
    () => UserFavoriteSport,
    (userFavoriteSport) => userFavoriteSport.user,
  )
  favoriteSports: UserFavoriteSport[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
