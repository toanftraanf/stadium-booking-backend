import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
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
import { StadiumField } from './field.entity';

@ObjectType()
@Entity({ name: 'stadiums' })
export class Stadium {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  googleMap?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  otherContacts?: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  startTime?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endTime?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  otherInfo?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  sports?: string[];

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  numberOfFields?: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating?: number;

  @Field({ nullable: true })
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

  @Field(() => [StadiumField], { nullable: true })
  @OneToMany(() => StadiumField, (field) => field.stadium)
  fields?: StadiumField[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
