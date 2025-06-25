import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserFavoriteSport } from '../../sport/entities/user-favorite-sport.entity';
import { File } from '../../upload/entities/file.entity';
import { CoachProfile } from './coach-profile.entity';

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

  @Field({ nullable: true })
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

  @Field(() => File, { nullable: true })
  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'avatarId' })
  avatar?: File;

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

  @Field(() => Number, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Field(() => UserType, { nullable: true })
  @Column({ type: 'enum', enum: UserType, nullable: true })
  userType?: UserType;

  @Field(() => UserLevel, { nullable: true })
  @Column({ type: 'enum', enum: UserLevel, nullable: true })
  level?: UserLevel;

  @Field(() => Number, { nullable: true })
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating?: number;

  @Field(() => CoachProfile, { nullable: true })
  @OneToOne(() => CoachProfile, (coachProfile) => coachProfile.user)
  coachProfile?: CoachProfile;

  @Field(() => [UserFavoriteSport], { nullable: true })
  @OneToMany(
    () => UserFavoriteSport,
    (userFavoriteSport) => userFavoriteSport.user,
  )
  favoriteSports?: UserFavoriteSport[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany('FriendRequest', 'requester')
  sentFriendRequests: any[];

  @OneToMany('FriendRequest', 'recipient')
  receivedFriendRequests: any[];

  @OneToMany('Friendship', 'userOne')
  friendshipsInitiated: any[];

  @OneToMany('Friendship', 'userTwo')
  friendshipsReceived: any[];
}
