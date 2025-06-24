import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum EventParticipantStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
}

registerEnumType(EventParticipantStatus, {
  name: 'EventParticipantStatus',
});

@ObjectType()
@Entity({ name: 'event_participants' })
@Index('IDX_event_user_unique', ['eventId', 'userId'], { unique: true })
export class EventParticipant {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  eventId: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => EventParticipantStatus)
  @Column({
    type: 'enum',
    enum: EventParticipantStatus,
    default: EventParticipantStatus.PENDING,
  })
  status: EventParticipantStatus;

  @ManyToOne('Event', 'participants', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event?: any;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Field()
  @CreateDateColumn()
  joinedAt: Date;
}
