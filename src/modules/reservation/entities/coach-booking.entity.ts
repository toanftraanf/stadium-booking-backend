import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CoachProfile } from '../../user/entities/coach-profile.entity';

export enum CoachBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(CoachBookingStatus, { name: 'CoachBookingStatus' });

@ObjectType()
@Entity({
  name: 'coach_bookings',
})
@Index(
  'unique_coach_booking_slot',
  ['coachProfileId', 'date', 'startTime', 'endTime'],
  {
    unique: true,
    where: "status != 'cancelled'",
  },
)
export class CoachBooking {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  clientId: number; // User who books the coach

  @Field(() => Int)
  @Column()
  coachProfileId: number; // CoachProfile being booked

  @Field()
  @Column()
  sport: string;

  @Field()
  @Column()
  sessionType: string; // e.g., "individual", "group", "training"

  @Field()
  @Column()
  date: string;

  @Field()
  @Column()
  startTime: string;

  @Field()
  @Column()
  endTime: string;

  @Field(() => Number)
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Field()
  @Column({
    type: 'enum',
    enum: CoachBookingStatus,
    default: CoachBookingStatus.PENDING,
  })
  status: CoachBookingStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  location?: string; // Where the session will take place

  @Field()
  @Column({ default: false })
  isEvent: boolean; // True if this booking is for an event

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @Field(() => CoachProfile, { nullable: true })
  @ManyToOne(() => CoachProfile)
  @JoinColumn({ name: 'coachProfileId' })
  coachProfile?: CoachProfile;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
