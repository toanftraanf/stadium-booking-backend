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
import { Stadium } from './stadium.entity';

@ObjectType()
@Entity({ name: 'fields' })
export class StadiumField {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  fieldName: string;

  @Field(() => Int)
  @Column()
  stadiumId: number;

  @Field(() => Stadium)
  @ManyToOne(() => Stadium, (stadium) => stadium.fields)
  @JoinColumn({ name: 'stadiumId' })
  stadium: Stadium;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
