import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { CardType } from '../entities/card.entity';

@InputType()
export class CreateCardInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @Field(() => CardType)
  @IsNotEmpty()
  @IsEnum(CardType)
  cardType: CardType;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  bankName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  last4: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cardToken?: string;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  saveForNextPayment: boolean;
}
