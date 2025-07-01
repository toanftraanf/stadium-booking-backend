import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Stadium } from '../../stadium/entities/stadium.entity';
import { CoachProfile } from '../../user/entities/coach-profile.entity';
import { CoachBooking } from '../../reservation/entities/coach-booking.entity';
import { Sport } from '../../sport/entities/sport.entity';
import { EventParticipantStatus } from '../entities/event-participant.entity';

@ObjectType()
export class EventParticipant {
  @Field(() => ID)
  id: number;

  @Field(() => User)
  user: User;

  @Field(() => EventParticipantStatus)
  status: EventParticipantStatus;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class Event {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  additionalNotes?: string;

  @Field()
  eventDate: string;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field(() => Int)
  maxParticipants: number;

  @Field()
  isPrivate: boolean;

  @Field()
  isSharedCost: boolean;

  @Field(() => Stadium)
  stadium: Stadium;

  @Field(() => CoachProfile, { nullable: true })
  coach?: CoachProfile;

  @Field(() => CoachBooking)
  coachBooking: CoachBooking;

  @Field(() => User)
  creator: User;

  @Field(() => [Sport])
  sports: Sport[];

  @Field(() => [EventParticipant])
  participants: EventParticipant[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
