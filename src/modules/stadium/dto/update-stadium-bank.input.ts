import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateStadiumBankInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bank?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  otherPayments?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  pricingImages?: string[];
} 