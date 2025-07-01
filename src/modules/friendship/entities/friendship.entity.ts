// src/modules/friendship/entities/friendship.entity.ts

import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import type { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity('friendships')
@Unique('UQ_friendship_pair', ['userOne', 'userTwo'])
export class Friendship {
  @Field(() => Int, { description: 'Primary key ID' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  // Lấy User class runtime qua require(), tránh import vòng
  @Field(() => require('../../user/entities/user.entity').User, {
    description: 'User who initiated the friendship',
  })
  @ManyToOne(
    () => require('../../user/entities/user.entity').User,
    (user: any) => user.friendshipsInitiated,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'userOneId' })
  userOne: User;

  @Field(() => require('../../user/entities/user.entity').User, {
    description: 'User who received the friendship',
  })
  @ManyToOne(
    () => require('../../user/entities/user.entity').User,
    (user: any) => user.friendshipsReceived,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'userTwoId' })
  userTwo: User;

  @Field(() => Date, { description: 'When the friendship was created' })
  @CreateDateColumn()
  createdAt: Date;
}
