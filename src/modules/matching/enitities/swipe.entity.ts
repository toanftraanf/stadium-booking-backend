// src/modules/matching/entities/swipe.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import type { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity('swipes')
@Unique('UQ_swipe_pair', ['swiper', 'swipee'])
export class Swipe {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  // Hoãn resolve GraphQL type và dùng string-based relation
  @Field(() => require('../../user/entities/user.entity').User)
  @ManyToOne('User', 'swiped', { onDelete: 'CASCADE' })
  swiper: User;

  @Field(() => require('../../user/entities/user.entity').User)
  @ManyToOne('User', 'swipedBy', { onDelete: 'CASCADE' })
  swipee: User;

  @Field()
  @Column({ type: 'boolean', default: false })
  liked: boolean; // true = swipe phải, false = swipe trái

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
