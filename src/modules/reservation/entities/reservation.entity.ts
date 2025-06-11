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
import { Stadium } from '../../stadium/entities/stadium.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity({ name: 'reservations' })
export class Reservation {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => Int)
  @Column()
  stadiumId: number;

  @Field()
  @Column()
  sport: string;

  @Field()
  @Column()
  courtType: string;

  @Field(() => Int)
  @Column()
  courtNumber: number;

  @Field()
  @Column()
  date: string;

  @Field()
  @Column()
  startTime: string;

  @Field()
  @Column()
  endTime: string;

  @Field(() => Int)
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Field()
  @Column({ default: 'pending' })
  status: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Stadium)
  @ManyToOne(() => Stadium)
  @JoinColumn({ name: 'stadiumId' })
  stadium: Stadium;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
