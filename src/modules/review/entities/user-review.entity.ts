import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CoachProfile } from '../../user/entities/coach-profile.entity';
import { CoachBooking } from '../../reservation/entities/coach-booking.entity';

@ObjectType()
@Entity({ name: 'user_reviews' })
export class UserReview {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  coachBookingId: number;

  @Field(() => Int)
  @Column()
  coachProfileId: number;

  @Field(() => Int)
  @Column()
  clientId: number; // User who wrote the review

  @Field(() => Int)
  @Column()
  rating: number;

  @Field()
  @Column('text')
  comment: string;

  @Field(() => CoachBooking, { nullable: true })
  @ManyToOne(() => CoachBooking)
  @JoinColumn({ name: 'coachBookingId' })
  coachBooking?: CoachBooking;

  @Field(() => CoachProfile, { nullable: true })
  @ManyToOne(() => CoachProfile)
  @JoinColumn({ name: 'coachProfileId' })
  coachProfile?: CoachProfile;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
