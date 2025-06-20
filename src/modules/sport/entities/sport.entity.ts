import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserFavoriteSport } from './user-favorite-sport.entity';

@ObjectType()
@Entity({ name: 'sports' })
export class Sport {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => [UserFavoriteSport])
  @OneToMany(
    () => UserFavoriteSport,
    (userFavoriteSport) => userFavoriteSport.sport,
  )
  userFavoriteSports: UserFavoriteSport[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
