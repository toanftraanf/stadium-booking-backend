import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Currency } from '../entities/subscription.entity';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  durationMonths: number;

  @Field(() => String)
  @IsNotEmpty()
  price: string; // Use string to support bigint

  @Field(() => Currency)
  @IsEnum(Currency)
  currency: Currency;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  features?: string[];

  @Field()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
