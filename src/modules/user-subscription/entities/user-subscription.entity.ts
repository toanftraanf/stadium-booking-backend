import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';

export enum UserSubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

registerEnumType(UserSubscriptionStatus, {
  name: 'UserSubscriptionStatus',
});

@ObjectType()
@Entity('user_subscription')
export class UserSubscription {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'int' })
  userId: number;

  @Field()
  @Column({ type: 'int' })
  subscriptionId: number;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionId' })
  @Field(() => Subscription)
  subscription: Subscription;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  endDate: Date;

  @Field(() => UserSubscriptionStatus)
  @Column({
    type: 'enum',
    enum: UserSubscriptionStatus,
    default: UserSubscriptionStatus.PENDING,
  })
  status: UserSubscriptionStatus;

  @Field()
  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Field()
  @Column({ type: 'int' })
  cardId: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
