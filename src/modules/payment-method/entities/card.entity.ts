import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  // Add more as needed
}

registerEnumType(CardType, {
  name: 'CardType',
});

@ObjectType()
@Entity('card')
export class Card {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'int' })
  userId: number;

  @Field(() => CardType)
  @Column({ type: 'enum', enum: CardType })
  cardType: CardType;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Field()
  @Column({ type: 'varchar', length: 4 })
  last4: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  cardToken?: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  saveForNextPayment: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
