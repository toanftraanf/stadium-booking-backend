import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Stadium } from '../../stadium/entities/stadium.entity';
import { CoachProfile } from '../../user/entities/coach-profile.entity';
import { CoachBooking } from '../../reservation/entities/coach-booking.entity';

@ObjectType()
@Entity({ name: 'events' })
export class Event {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 255 })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  additionalNotes?: string;

  @Field()
  @Column({ type: 'date' })
  eventDate: string;

  @Field()
  @Column({ type: 'time' })
  startTime: string;

  @Field()
  @Column({ type: 'time' })
  endTime: string;

  @Field(() => Int)
  @Column()
  maxParticipants: number;

  @Field()
  @Column({ default: false })
  isPrivate: boolean;

  @Field()
  @Column({ default: false })
  isSharedCost: boolean;

  @Field(() => Int)
  @Column()
  stadiumId: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  coachProfileId?: number;

  @Field(() => Int)
  @Column()
  coachBookingId: number;

  @Field(() => Int)
  @Column()
  creatorId: number;

  @Field(() => Stadium, { nullable: true })
  @ManyToOne(() => Stadium)
  @JoinColumn({ name: 'stadiumId' })
  stadium?: Stadium;

  @Field(() => CoachProfile, { nullable: true })
  @ManyToOne(() => CoachProfile)
  @JoinColumn({ name: 'coachProfileId' })
  coach?: CoachProfile;

  @Field(() => CoachBooking, { nullable: true })
  @ManyToOne(() => CoachBooking)
  @JoinColumn({ name: 'coachBookingId' })
  coachBooking?: CoachBooking;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @OneToMany('EventSport', 'event')
  eventSports?: any[];

  @OneToMany('EventParticipant', 'event')
  participants?: any[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
