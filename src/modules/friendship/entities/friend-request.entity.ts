import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import type { User } from '../../user/entities/user.entity';

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
registerEnumType(FriendRequestStatus, { name: 'FriendRequestStatus' });

@ObjectType()
@Entity('friend_requests')
@Index('IDX_friend_requests_recipient', ['recipient', 'status'])
export class FriendRequest {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  // lazy-load GraphQL type + string-based TypeORM relation
  @Field(() => require('../../user/entities/user.entity').User)
  @ManyToOne('User', 'sentFriendRequests', { onDelete: 'CASCADE' })
  requester: User;

  @Field(() => require('../../user/entities/user.entity').User)
  @ManyToOne('User', 'receivedFriendRequests', { onDelete: 'CASCADE' })
  recipient: User;

  @Field(() => FriendRequestStatus)
  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @Field() @CreateDateColumn() createdAt: Date;
  @Field() @UpdateDateColumn() updatedAt: Date;
}
