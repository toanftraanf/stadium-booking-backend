import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity({ name: 'stadiums' })
export class Stadium {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field()
  @Column({ nullable: true })
  googleMap?: string;

  @Field()
  @Column({ nullable: true })
  phone?: string;

  @Field()
  @Column({ nullable: true })
  email?: string;

  @Field()
  @Column({ nullable: true })
  website?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  otherContacts?: string[];

  @Field()
  @Column({ nullable: true })
  startTime?: string;

  @Field()
  @Column({ nullable: true })
  endTime?: string;

  @Field()
  @Column({ nullable: true })
  otherInfo?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  sports?: string[];

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  area?: number;

  @Field(() => Int)
  @Column({ nullable: true })
  numberOfFields?: number;

  @Field(() => Float)
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating?: number;

  @Field()
  @Column({ default: 'active' })
  status?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, default: [] })
  images?: string[];

  // Bank information
  @Field({ nullable: true })
  @Column({ nullable: true })
  bank?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  accountNumber?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  otherPayments?: string[];

  // Pricing images
  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  pricingImages?: string[];

  // Image URLs
  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bannerUrl?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  galleryUrls?: string[];

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 