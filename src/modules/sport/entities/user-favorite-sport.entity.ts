import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Sport } from './sport.entity';

@ObjectType()
@Entity({ name: 'user_favorite_sports' })
export class UserFavoriteSport {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field(() => Int)
  @Column()
  sportId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.favoriteSports)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Sport)
  @ManyToOne(() => Sport, (sport) => sport.userFavoriteSports)
  @JoinColumn({ name: 'sportId' })
  sport: Sport;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
