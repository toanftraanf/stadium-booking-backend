import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'coach_profiles' })
export class CoachProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ unique: true })
  userId: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Field(() => Number, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  availability?: string; // JSON string or simple text for availability schedule

  @Field(() => Int, { nullable: true })
  @Column({ default: 0 })
  yearsOfExperience?: number;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  certifications?: string[];

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  coachImages?: string[];

  @Field(() => Boolean)
  @Column({ default: false })
  isAvailable?: boolean;

  @Field(() => Number, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minSessionDuration?: number; // Minimum session duration in hours

  @Field(() => Number, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxSessionDuration?: number; // Maximum session duration in hours

  @OneToOne('User')
  @JoinColumn({ name: 'userId' })
  user?: any;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
