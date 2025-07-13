import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum Currency {
  VND = 'VND',
}

registerEnumType(Currency, {
  name: 'Currency',
});

@ObjectType()
@Entity('subscription')
export class Subscription {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Field()
  @Column({ type: 'int' })
  durationMonths: number;

  @Field()
  @Column({ type: 'bigint' })
  price: number;

  @Field(() => Currency)
  @Column({ type: 'enum', enum: Currency, default: Currency.VND })
  currency: Currency;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  features?: string[];

  @Field()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
