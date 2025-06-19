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
import { Stadium } from '../../stadium/entities/stadium.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

@ObjectType()
@Entity({ name: 'reviews' })
export class Review {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  reservationId: number;

  @Field(() => Int)
  @Column()
  stadiumId: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => Int)
  @Column()
  rating: number;

  @Field()
  @Column('text')
  comment: string;

  @Field(() => Reservation)
  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @Field(() => Stadium)
  @ManyToOne(() => Stadium)
  @JoinColumn({ name: 'stadiumId' })
  stadium: Stadium;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
