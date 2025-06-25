import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sport } from '../../sport/entities/sport.entity';

@ObjectType()
@Entity({ name: 'event_sports' })
export class EventSport {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  eventId: number;

  @Field(() => Int)
  @Column()
  sportId: number;

  @ManyToOne('Event', 'eventSports', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event?: any;

  @Field(() => Sport, { nullable: true })
  @ManyToOne(() => Sport)
  @JoinColumn({ name: 'sportId' })
  sport?: Sport;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
